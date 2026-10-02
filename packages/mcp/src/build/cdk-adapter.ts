/**
 * CDK adapter — indexes the non-visual half of `uni-angular`: every symbol the
 * CDK barrel (`cdk/index.ts`) exports, with its signature and JSDoc, plus each
 * CDK module's docs page as markdown. Components are the Angular adapter's
 * business; this one covers what an assistant otherwise cannot see at all —
 * `copyToClipboard`, the decimal helpers, `PermissionService` — because none
 * of it has a selector.
 *
 * Signatures come from the TypeScript AST, not regexes: the CDK mixes
 * `function` declarations, arrow-function consts, generics, and multi-line
 * parameter lists, and the Angular adapter's line-oriented regex would miss
 * most of them. No type checker is involved — the declaration text as written
 * is what a developer reads in the editor, and it needs no module resolution.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
import type { UtilityDocModel, UtilityMemberModel, UtilityModel } from '../schema.js';

const IMPORT_PATH = '@uni-design-system/uni-angular';

/** A utility before the normalizer stamps the release version on it. */
export type UtilityFragment = Omit<UtilityModel, 'version'>;

// --- barrel resolution -------------------------------------------------------

/** Files reachable from a barrel through `export … from './x'` chains, in order. */
export function resolveBarrel(entry: string, seen = new Set<string>()): string[] {
  const file = resolveModule(entry);
  if (!file || seen.has(file)) return [];
  seen.add(file);
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  );
  const out: string[] = [];
  let reExportsOnly = true;
  for (const statement of source.statements) {
    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      out.push(...resolveBarrel(join(dirname(file), statement.moduleSpecifier.text), seen));
    } else if (!ts.isImportDeclaration(statement)) {
      reExportsOnly = false;
    }
  }
  // A barrel that only re-exports contributes nothing itself.
  return reExportsOnly ? out : [...out, file];
}

function resolveModule(path: string): string | undefined {
  for (const candidate of [path, `${path}.ts`, join(path, 'index.ts')]) {
    if (candidate.endsWith('.ts') && existsSync(candidate)) return candidate;
  }
  return undefined;
}

// --- symbol extraction -------------------------------------------------------

const MAX_SIGNATURE = 600;

const isExported = (node: ts.Node): boolean =>
  !!(ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export);

/** The JSDoc comment on a node, flattened to one paragraph; tags are dropped. */
function docOf(node: ts.Node): string {
  const docs = (node as { jsDoc?: ts.JSDoc[] }).jsDoc;
  const last = docs?.[docs.length - 1];
  if (!last?.comment) return '';
  const text =
    typeof last.comment === 'string' ? last.comment : last.comment.map((c) => c.text).join('');
  return text.replace(/\s*\n\s*/g, ' ').trim();
}

const firstSentence = (text: string): string => text.split(/(?<=[.!?])\s/)[0] ?? '';

/** Declaration text up to, and excluding, its body — one line, modifiers dropped. */
function headOf(source: ts.SourceFile, node: ts.Node, body: ts.Node | undefined): string {
  const start = node.getStart(source);
  const end = body ? body.getFullStart() : node.getEnd();
  return tidy(source.text.slice(start, end));
}

function tidy(text: string): string {
  const flat = text
    .replace(/^\s*(export\s+)?(default\s+)?(declare\s+)?(async\s+)?/, (m) =>
      m.includes('async') ? 'async ' : ''
    )
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/,?\s*\)/g, ')')
    .replace(/\s+/g, ' ')
    // A union written one member per line starts with a leading `|`.
    .replace(/=\s*\|\s*/g, '= ')
    .replace(/\boverride\s+/g, '')
    .trim()
    .replace(/[\s=]+$/, '')
    .replace(/;$/, '');
  return flat.length > MAX_SIGNATURE ? `${flat.slice(0, MAX_SIGNATURE)}…` : flat;
}

/** Initializers short enough to read as part of the contract, e.g. `signal<T[]>([])`. */
const MAX_INITIALIZER = 80;

const kebab = (name: string): string =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();

function classMembers(
  source: ts.SourceFile,
  node: ts.ClassDeclaration | ts.InterfaceDeclaration
): UtilityMemberModel[] {
  const out: UtilityMemberModel[] = [];
  for (const member of node.members) {
    const flags = ts.getCombinedModifierFlags(member as ts.Declaration);
    if (flags & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected)) continue;
    if (!member.name || ts.isPrivateIdentifier(member.name)) continue;
    if (ts.isConstructorDeclaration(member)) continue;
    const name = member.name.getText(source);
    if (ts.isMethodDeclaration(member) || ts.isMethodSignature(member)) {
      const body = ts.isMethodDeclaration(member) ? member.body : undefined;
      out.push({
        name,
        kind: 'method',
        signature: headOf(source, member, body),
        description: docOf(member),
      });
    } else if (
      ts.isPropertyDeclaration(member) ||
      ts.isPropertySignature(member) ||
      ts.isGetAccessor(member)
    ) {
      const initializer = ts.isPropertyDeclaration(member) ? member.initializer : undefined;
      if (
        initializer &&
        (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))
      ) {
        // `show = (alert: Alert) => …` is a method to the caller.
        const head = headOf(source, initializer, initializer.body).replace(/\s*=>$/, '');
        out.push({ name, kind: 'method', signature: `${name}${head}`, description: docOf(member) });
        continue;
      }
      const body = ts.isGetAccessor(member) ? member.body : undefined;
      // A declared type is the contract; an initializer stands in for one
      // only while it stays readable — `computed(() => …)` bodies do not.
      let signature = headOf(source, member, initializer ?? body);
      if (ts.isPropertyDeclaration(member) && !member.type && initializer) {
        signature = `${signature} = ${initializerSummary(initializer, source)}`;
      }
      out.push({ name, kind: 'property', signature, description: docOf(member) });
    }
  }
  return out;
}

/**
 * An initializer as part of a signature: verbatim while it stays readable, a
 * call collapsed to its callee (`computed(…)`, `memoize(…)`) once it does not.
 */
function initializerSummary(init: ts.Expression, source: ts.SourceFile): string {
  const text = tidy(init.getText(source));
  if (text.length <= MAX_INITIALIZER) return text;
  const call = text.match(/^(\w+(?:\.\w+)*)(<[^(]*>)?\(/);
  return call ? `${call[1]}${call[2] ?? ''}(…)` : `${text.slice(0, MAX_INITIALIZER)}…`;
}

const hasDecorator = (node: ts.ClassDeclaration, name: string): boolean =>
  (ts.getDecorators(node) ?? []).some((d) => d.expression.getText().startsWith(name));

/**
 * Parse one source file's exported symbols. Pure over `source` — the path only
 * names the module (its CDK folder). Classes carrying `@Component` or
 * `@Directive` are skipped: those are components, indexed elsewhere.
 */
export function parseUtilities(
  sourceText: string,
  module: string,
  fileName = `${module}.ts`
): UtilityFragment[] {
  const source = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true);
  const out: UtilityFragment[] = [];
  const push = (
    name: string,
    kind: UtilityModel['kind'],
    signature: string,
    node: ts.Node,
    members: UtilityMemberModel[] = []
  ) => {
    const description = docOf(node);
    out.push({
      id: kebab(name),
      name,
      kind,
      module,
      importPath: IMPORT_PATH,
      signature,
      summary: firstSentence(description),
      description,
      members,
    });
  };

  for (const statement of source.statements) {
    if (!isExported(statement)) continue;
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      push(statement.name.text, 'function', headOf(source, statement, statement.body), statement);
    } else if (ts.isClassDeclaration(statement) && statement.name) {
      if (hasDecorator(statement, 'Component') || hasDecorator(statement, 'Directive')) continue;
      const kind = hasDecorator(statement, 'Injectable') ? 'service' : 'class';
      const heritage = statement.heritageClauses?.map((h) => h.getText(source)).join(' ') ?? '';
      const generics = statement.typeParameters
        ? `<${statement.typeParameters.map((t) => t.getText(source)).join(', ')}>`
        : '';
      push(
        statement.name.text,
        kind,
        tidy(`class ${statement.name.text}${generics} ${heritage}`),
        statement,
        classMembers(source, statement)
      );
    } else if (ts.isInterfaceDeclaration(statement)) {
      const generics = statement.typeParameters
        ? `<${statement.typeParameters.map((t) => t.getText(source)).join(', ')}>`
        : '';
      const heritage = statement.heritageClauses?.map((h) => h.getText(source)).join(' ') ?? '';
      push(
        statement.name.text,
        'interface',
        tidy(`interface ${statement.name.text}${generics} ${heritage}`),
        statement,
        classMembers(source, statement)
      );
    } else if (ts.isTypeAliasDeclaration(statement)) {
      push(statement.name.text, 'type', tidy(statement.getText(source)), statement);
    } else if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name)) continue;
        const init = decl.initializer;
        if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) {
          // `const f = (a: A): B => …` reads as `function f(a: A): B`.
          const head = headOf(source, init, init.body).replace(/\s*=>$/, '');
          const generics = init.typeParameters
            ? `<${init.typeParameters.map((t) => t.getText(source)).join(', ')}>`
            : '';
          push(
            decl.name.text,
            'function',
            `function ${decl.name.text}${generics}${head.replace(/^<[^>]*>/, '')}`,
            statement
          );
        } else {
          const type = decl.type ? `: ${tidy(decl.type.getText(source))}` : '';
          const value = !decl.type && init ? ` = ${initializerSummary(init, source)}` : '';
          push(decl.name.text, 'const', `const ${decl.name.text}${type}${value}`, statement);
        }
      }
    }
  }
  return out;
}

// --- docs pages ------------------------------------------------------------------

/**
 * A CDK module's MDX page as plain markdown: Storybook imports, `<Meta>` and
 * story blocks go; headings, prose and fenced code stay. Code fences are kept
 * verbatim, including lines that start with `<` — those are examples.
 */
export function mdxToMarkdown(source: string): { title: string; markdown: string } {
  const lines: string[] = [];
  let title = '';
  let inFence = false;
  let inJsx = 0;
  for (const raw of source.split('\n')) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inFence = !inFence;
      lines.push(line);
      continue;
    }
    if (inFence) {
      lines.push(line);
      continue;
    }
    if (inJsx > 0) {
      inJsx +=
        (trimmed.match(/<[A-Za-z]/g) ?? []).length -
        (trimmed.match(/\/>|<\/[A-Za-z]/g) ?? []).length;
      if (inJsx < 0) inJsx = 0;
      continue;
    }
    if (trimmed.startsWith('import ') || trimmed.startsWith('export ')) continue;
    if (trimmed.startsWith('<')) {
      // A multi-line JSX block runs until its tags balance.
      inJsx =
        (trimmed.match(/<[A-Za-z]/g) ?? []).length -
        (trimmed.match(/\/>|<\/[A-Za-z]/g) ?? []).length;
      continue;
    }
    if (!title) {
      const h1 = trimmed.match(/^#\s+(.+)$/);
      if (h1) title = h1[1].trim();
    }
    lines.push(line);
  }
  const markdown = lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { title, markdown };
}

// --- entry -----------------------------------------------------------------------

export type CdkOptions = {
  /** `packages/angular/src/lib` — the barrel is `cdk/index.ts` beneath it. */
  srcRoot: string;
};

export function ingestCdk(opts: CdkOptions): {
  utilities: UtilityFragment[];
  docs: UtilityDocModel[];
} {
  const cdkRoot = join(opts.srcRoot, 'cdk');
  const files = resolveBarrel(join(cdkRoot, 'index.ts'));
  const moduleOf = (file: string): string =>
    relative(cdkRoot, file).split('/')[0].replace(/\.ts$/, '');

  const utilities: UtilityFragment[] = [];
  const seen = new Set<string>();
  for (const file of files) {
    for (const utility of parseUtilities(
      readFileSync(file, 'utf8'),
      moduleOf(file),
      basename(file)
    )) {
      // The barrel can reach one symbol by two paths; the first wins.
      if (seen.has(utility.id)) continue;
      seen.add(utility.id);
      utilities.push(utility);
    }
  }

  const docs: UtilityDocModel[] = [];
  const modules = [...new Set(utilities.map((u) => u.module))];
  for (const module of modules) {
    const dir = resolve(cdkRoot, module);
    if (!existsSync(dir) || !readdirSync(dir).length) continue;
    const mdx = readdirSync(dir).find((f) => f.endsWith('.mdx'));
    if (!mdx) continue;
    const { title, markdown } = mdxToMarkdown(readFileSync(join(dir, mdx), 'utf8'));
    if (markdown) docs.push({ module, title: title || module, markdown });
  }

  console.log(
    `  cdk: ${utilities.length} utilities in ${modules.length} modules, ${docs.length} docs pages`
  );
  return { utilities, docs };
}
