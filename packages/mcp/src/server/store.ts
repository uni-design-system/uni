/**
 * Runtime store - loads the built `uni-index.json` (inlined into the bundle)
 * and exposes typed queries plus AI-optimized markdown formatters. The server
 * layer only calls into here; it never touches raw index shapes.
 */
import indexData from '../data/uni-index.json' with { type: 'json' };
import type {
  ComponentModel,
  Framework,
  ThemeTemplateModel,
  TokenModel,
  UniIndex,
} from '../schema.js';

const index = indexData as unknown as UniIndex;

export type ComponentFilter = { framework?: Framework; category?: string; status?: string };
export type TokenFilter = { type?: string; theme?: string; kind?: string };

export const meta = index.meta;

export function frameworksFor(c: ComponentModel): Framework[] {
  return Object.keys(c.bindings) as Framework[];
}

export function listComponents(filter: ComponentFilter = {}): ComponentModel[] {
  return index.components.filter((c) => {
    if (filter.framework && !c.bindings[filter.framework]) return false;
    if (filter.category && c.category !== filter.category) return false;
    if (filter.status && c.status !== filter.status) return false;
    return true;
  });
}

export function getComponent(id: string): ComponentModel | undefined {
  return index.components.find((c) => c.id === id);
}

export function listTokens(filter: TokenFilter = {}): TokenModel[] {
  return index.tokens.filter((t) => {
    if (filter.type && t.type !== filter.type) return false;
    if (filter.kind && t.kind !== filter.kind) return false;
    if (filter.theme && !(t.themeValues && filter.theme in t.themeValues)) return false;
    return true;
  });
}

export function getToken(id: string): TokenModel | undefined {
  return index.tokens.find((t) => t.id === id);
}

export function listThemes(): ThemeTemplateModel[] {
  return index.themes;
}

export function getTheme(id: string): ThemeTemplateModel | undefined {
  return index.themes.find((t) => t.id === id);
}

export type SearchKind = 'component' | 'token' | 'theme' | 'guideline';
export type SearchHit = { kind: SearchKind; id: string; label: string; snippet: string };

/** Keyword/substring search across the index (semantic is a later drop-in). */
export function search(query: string, kind?: SearchKind): SearchHit[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const hits: SearchHit[] = [];
  const match = (...fields: (string | undefined)[]) =>
    fields.some((f) => f?.toLowerCase().includes(q));

  if (!kind || kind === 'component') {
    for (const c of index.components) {
      const apiNames = frameworksFor(c).flatMap((f) => c.bindings[f]!.api.map((a) => a.name));
      if (match(c.id, c.name, c.summary, c.description, c.category, ...apiNames)) {
        hits.push({ kind: 'component', id: c.id, label: c.name, snippet: c.summary || c.description.slice(0, 120) });
      }
    }
  }
  if (!kind || kind === 'token') {
    for (const t of index.tokens) {
      if (match(t.id, t.type, t.description, String(t.value))) {
        hits.push({ kind: 'token', id: t.id, label: t.id, snippet: `${t.type} = ${t.value}` });
      }
    }
  }
  if (!kind || kind === 'theme') {
    for (const t of index.themes) {
      if (match(t.id, t.name, t.description)) {
        hits.push({ kind: 'theme', id: t.id, label: t.name, snippet: t.description });
      }
    }
  }
  if (!kind || kind === 'guideline') {
    for (const c of index.components) {
      const g = c.guidelines;
      if (match(g.whenToUse, ...g.dos, ...g.donts, ...g.accessibility)) {
        hits.push({ kind: 'guideline', id: c.id, label: `${c.name} guidelines`, snippet: g.whenToUse.slice(0, 120) });
      }
    }
  }
  return hits;
}

// ---------------------------------------------------------------------------
// Markdown formatters - tight cards, not raw dumps, to keep token usage low.
// ---------------------------------------------------------------------------

export function formatComponentList(components: ComponentModel[]): string {
  if (!components.length) return 'No components match that filter.';
  const rows = components.map((c) => {
    const fw = frameworksFor(c).join(', ');
    return `- **${c.name}** \`${c.id}\` - ${c.summary || '(no summary)'} _(${c.category}; ${fw})_`;
  });
  return `# Uni components (${components.length})\n\n${rows.join('\n')}`;
}

function formatApiTable(members: ComponentModel['bindings'][Framework]): string {
  const api = members?.api ?? [];
  if (!api.length) return '_No documented inputs/props._';
  return api
    .map((m) => {
      const req = m.required ? ' **(required)**' : '';
      const def = m.default ? ` = \`${m.default}\`` : '';
      const dep = m.deprecated ? ` (deprecated: ${m.deprecated})` : '';
      const doc = m.description ? ` - ${m.description}` : '';
      return `- \`${m.name}: ${m.type}\`${req}${def} _(${m.kind})_${doc}${dep}`;
    })
    .join('\n');
}

export function formatComponent(c: ComponentModel, framework?: Framework): string {
  const frameworks = framework ? [framework] : frameworksFor(c);
  const out: string[] = [`# ${c.name} \`${c.id}\``];
  out.push(`_${c.category} · status: ${c.status} · Uni v${c.version}_`);
  if (c.description) out.push(`\n${c.description}`);

  for (const f of frameworks) {
    const b = c.bindings[f];
    if (!b) {
      out.push(`\n## ${f}\n_Not yet available for ${f}._`);
      continue;
    }
    out.push(`\n## ${f}`);
    out.push(`- import: \`${b.importPath}\``);
    out.push(`- selector/tag: \`${b.selectorOrTag}\``);
    out.push(`\n**API**\n${formatApiTable(b)}`);
  }

  if (c.relatedTokens.length) out.push(`\n**Related tokens:** ${c.relatedTokens.map((t) => `\`${t}\``).join(', ')}`);
  if (c.examples.length) {
    const ex = c.examples[0];
    out.push(`\n**Example - ${ex.title} (${ex.framework})**\n\`\`\`html\n${ex.code}\n\`\`\``);
    if (c.examples.length > 1) out.push(`_+${c.examples.length - 1} more via get-component-examples._`);
  }
  return out.join('\n');
}

export function formatExamples(c: ComponentModel, framework?: Framework): string {
  const examples = framework ? c.examples.filter((e) => e.framework === framework) : c.examples;
  if (!examples.length) return `No examples found for \`${c.id}\`${framework ? ` (${framework})` : ''}.`;
  const blocks = examples.map((e) => {
    const link = e.storybookUrl ? `\n[Open in Storybook](${e.storybookUrl})` : '';
    return `### ${e.title} _(${e.framework})_\n\`\`\`html\n${e.code}\n\`\`\`${link}`;
  });
  return `# ${c.name} - examples (${examples.length})\n\n${blocks.join('\n\n')}`;
}

export function formatToken(t: TokenModel): string {
  const out: string[] = [`# Token \`${t.id}\``];
  out.push(`- value: \`${t.value}\``);
  out.push(`- type: ${t.type}`);
  out.push(`- kind: **${t.kind}** (${t.target})`);
  if (t.appliesTo) out.push(`- applies to component: \`${t.appliesTo}\``);
  if (t.aliasOf) out.push(`- alias of: \`${t.aliasOf}\``);
  if (t.description) out.push(`\n${t.description}`);
  if (t.themeValues && Object.keys(t.themeValues).length) {
    out.push('\n**Per-theme values**');
    for (const [theme, val] of Object.entries(t.themeValues)) out.push(`- ${theme}: \`${val}\``);
  }
  const hint =
    t.kind === 'style'
      ? '\n_Style token - consumed by Emotion to generate CSS. Reference via the theme, not a raw value._'
      : '\n_Behavioral token - set as a component input/prop, not as CSS._';
  out.push(hint);
  return out.join('\n');
}

export function formatTokenList(tokens: TokenModel[]): string {
  if (!tokens.length) return 'No tokens match that filter.';
  const rows = tokens.map((t) => `- \`${t.id}\` - ${t.type} = \`${t.value}\` _(${t.kind})_`);
  return `# Uni tokens (${tokens.length})\n\n${rows.join('\n')}`;
}

export function formatThemeList(themes: ThemeTemplateModel[]): string {
  if (!themes.length) return 'No theme templates available.';
  const rows = themes.map((t) => `- **${t.name}** \`${t.id}\` - ${t.description}`);
  return `# Uni theme templates (${themes.length})\n\n${rows.join('\n')}`;
}

export function formatTheme(t: ThemeTemplateModel): string {
  const out: string[] = [`# Theme \`${t.id}\` - ${t.name}`];
  if (t.description) out.push(t.description);
  out.push('\n## Style overrides (-> Emotion CSS)');
  out.push('_Apply through the theme provider. These become CSS._');
  const styleKeys = Object.entries(t.styleOverrides);
  out.push(styleKeys.map(([k, v]) => `- \`${k}\`: \`${v}\``).join('\n'));

  out.push('\n## Component options (-> component inputs/props)');
  out.push('_Behavioral preferences. Pass as inputs/props, not CSS._');
  for (const [component, opts] of Object.entries(t.componentOptions)) {
    out.push(`- **${component}**: ${Object.entries(opts).map(([k, v]) => `\`${k}=${v}\``).join(', ')}`);
  }
  if (t.usage) out.push(`\n## How to apply\n${t.usage}`);
  return out.join('\n');
}

export function formatGuidelines(c: ComponentModel): string {
  const g = c.guidelines;
  const has = g.whenToUse || g.dos.length || g.donts.length || g.accessibility.length;
  if (!has) return `No authored guidelines yet for \`${c.id}\`. (Author them in the component's MDX.)`;
  const out: string[] = [`# ${c.name} - guidelines`];
  if (g.whenToUse) out.push(`\n**When to use**\n${g.whenToUse}`);
  if (g.dos.length) out.push(`\n**Do**\n${g.dos.map((d) => `- ${d}`).join('\n')}`);
  if (g.donts.length) out.push(`\n**Don't**\n${g.donts.map((d) => `- ${d}`).join('\n')}`);
  if (g.accessibility.length) out.push(`\n**Accessibility**\n${g.accessibility.map((a) => `- ${a}`).join('\n')}`);
  return out.join('\n');
}

export function formatSearch(query: string, hits: SearchHit[]): string {
  if (!hits.length) return `No results for "${query}".`;
  const rows = hits.slice(0, 40).map((h) => `- _[${h.kind}]_ **${h.label}** \`${h.id}\` - ${h.snippet}`);
  const more = hits.length > 40 ? `\n\n_...and ${hits.length - 40} more. Narrow with \`kind\`._` : '';
  return `# Search: "${query}" (${hits.length})\n\n${rows.join('\n')}${more}`;
}
