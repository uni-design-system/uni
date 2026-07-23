/**
 * Normalized data model for the Uni MCP index.
 *
 * Every source (Angular components, uni-core tokens/themes, Storybook stories)
 * is transformed into these shapes. The running server queries this model
 * only — never the raw framework files. Zod both validates the built index and
 * derives the TypeScript types, so schema and types can never drift.
 */
import { z } from 'zod';

export const Framework = z.enum(['angular', 'react']);
export type Framework = z.infer<typeof Framework>;

/** A single input/output (Angular) or prop/event (React) on a component. */
export const ApiMember = z.object({
  name: z.string(),
  kind: z.enum(['input', 'output', 'model', 'prop', 'event', 'method']),
  type: z.string(),
  required: z.boolean().default(false),
  default: z.string().optional(),
  description: z.string().default(''),
  deprecated: z.string().optional(),
});
export type ApiMember = z.infer<typeof ApiMember>;

export const SlotModel = z.object({
  name: z.string(),
  description: z.string().default(''),
});
export type SlotModel = z.infer<typeof SlotModel>;

/** One framework's concrete implementation of a component identity. */
export const Binding = z.object({
  importPath: z.string(),
  selectorOrTag: z.string(),
  api: z.array(ApiMember).default([]),
  slots: z.array(SlotModel).optional(),
});
export type Binding = z.infer<typeof Binding>;

export const ExampleModel = z.object({
  title: z.string(),
  framework: Framework,
  code: z.string(),
  storybookUrl: z.string().optional(),
});
export type ExampleModel = z.infer<typeof ExampleModel>;

export const GuidelineModel = z.object({
  whenToUse: z.string().default(''),
  dos: z.array(z.string()).default([]),
  donts: z.array(z.string()).default([]),
  accessibility: z.array(z.string()).default([]),
});
export type GuidelineModel = z.infer<typeof GuidelineModel>;

/** One component identity with N per-framework bindings. */
export const ComponentModel = z.object({
  id: z.string(), // framework-neutral, e.g. "button"
  name: z.string(), // "Button"
  status: z.enum(['stable', 'beta', 'deprecated']).default('stable'),
  summary: z.string().default(''),
  description: z.string().default(''),
  category: z.string().default('other'),
  version: z.string(),
  bindings: z.record(Framework, Binding),
  examples: z.array(ExampleModel).default([]),
  guidelines: GuidelineModel.default({}),
  relatedTokens: z.array(z.string()).default([]),
});
export type ComponentModel = z.infer<typeof ComponentModel>;

export const TokenValue = z.union([z.string(), z.number(), z.boolean()]);
export type TokenValue = z.infer<typeof TokenValue>;

/**
 * A single design token. `kind`/`target` capture the Emotion-aware split:
 * style tokens drive CSS, behavioral tokens set a component prop.
 */
export const TokenModel = z.object({
  id: z.string(), // "color.primary" | "button.behavior.elevateOnHover"
  value: TokenValue,
  type: z.string(), // "color" | "spacing" | "radius" | "shadow" | ...
  kind: z.enum(['style', 'behavioral']),
  target: z.enum(['emotion-css', 'component-prop']),
  appliesTo: z.string().optional(), // behavioral: the component id it configures
  description: z.string().optional(),
  aliasOf: z.string().optional(),
  themeValues: z.record(z.string(), TokenValue).optional(), // per-theme overrides
});
export type TokenModel = z.infer<typeof TokenModel>;

/**
 * A theme template. Deliberately keeps the two buckets distinct so an
 * assistant applies each correctly: style via the Emotion theme provider,
 * behavioral options via component inputs/props.
 */
export const ThemeTemplateModel = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(''),
  styleOverrides: z.record(z.string(), TokenValue), // → Emotion CSS
  componentOptions: z.record(z.string(), z.record(z.string(), TokenValue)), // → props
  usage: z.string().default(''),
});
export type ThemeTemplateModel = z.infer<typeof ThemeTemplateModel>;

export const IndexMeta = z.object({
  /** Uni release this index was built from. */
  version: z.string(),
  builtAt: z.string(),
  frameworks: z.array(Framework),
  counts: z.object({
    components: z.number(),
    tokens: z.number(),
    themes: z.number(),
    examples: z.number(),
  }),
});
export type IndexMeta = z.infer<typeof IndexMeta>;

export const UniIndex = z.object({
  meta: IndexMeta,
  components: z.array(ComponentModel),
  tokens: z.array(TokenModel),
  themes: z.array(ThemeTemplateModel),
});
export type UniIndex = z.infer<typeof UniIndex>;
