/**
 * Normalizer — merges adapter fragments by component `id`, attaches examples
 * and related tokens, validates the whole index against the Zod schema, and
 * stamps it with the Uni release. Fails loudly on schema violations so a docs
 * drift becomes a caught build error rather than a silent wrong answer.
 */
import { UniIndex } from '../schema.js';
import type {
  ComponentModel,
  Framework,
  ThemeTemplateModel,
  TokenModel,
} from '../schema.js';
import type { ComponentFragment } from './angular-adapter.js';
import type { StorybookExample } from './storybook-adapter.js';

export type NormalizeInput = {
  version: string;
  frameworks: Framework[];
  angular: ComponentFragment[];
  examples: StorybookExample[];
  tokens: TokenModel[];
  themes: ThemeTemplateModel[];
};

export function normalize(input: NormalizeInput): UniIndex {
  const examplesByComponent = new Map<string, StorybookExample[]>();
  for (const ex of input.examples) {
    const list = examplesByComponent.get(ex.componentId) ?? [];
    list.push(ex);
    examplesByComponent.set(ex.componentId, list);
  }

  // Behavioral tokens declare which component they configure — surface those
  // as each component's related tokens.
  const behavioralByComponent = new Map<string, string[]>();
  for (const tok of input.tokens) {
    if (tok.kind === 'behavioral' && tok.appliesTo) {
      const list = behavioralByComponent.get(tok.appliesTo) ?? [];
      list.push(tok.id);
      behavioralByComponent.set(tok.appliesTo, list);
    }
  }

  const components: ComponentModel[] = input.angular.map((frag) => {
    const examples = (examplesByComponent.get(frag.id) ?? []).map(
      ({ componentId: _drop, ...ex }) => ex,
    );
    return {
      id: frag.id,
      name: frag.name,
      status: 'stable',
      summary: frag.summary,
      description: frag.description,
      category: frag.category,
      version: input.version,
      bindings: { angular: frag.binding },
      examples,
      guidelines: { whenToUse: '', dos: [], donts: [], accessibility: [] },
      relatedTokens: behavioralByComponent.get(frag.id) ?? [],
    } satisfies ComponentModel;
  });

  const index = {
    meta: {
      version: input.version,
      builtAt: new Date().toISOString(),
      frameworks: input.frameworks,
      counts: {
        components: components.length,
        tokens: input.tokens.length,
        themes: input.themes.length,
        examples: input.examples.length,
      },
    },
    components,
    tokens: input.tokens,
    themes: input.themes,
  };

  // Validate — throws with a precise path on any violation.
  return UniIndex.parse(index);
}
