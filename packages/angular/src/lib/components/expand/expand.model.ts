/** Theme-level options for `uni-expand`. */
export interface UniExpandOptions {
  /**
   * Base reveal/collapse duration in seconds (matching alert/card
   * `transitionSpeed`), lives in the `expand` theme options. The default
   * theme uses `0.35`. This is the duration at a 240px-tall region; the
   * actual duration scales with content height (√-of-height, clamped —
   * `expandDuration` in uni-core) so short regions stay snappy and tall
   * ones aren't rushed. Also drives `uni-expand-toggle`'s chevron rotation
   * so trigger and region move on the same clock.
   */
  transitionSpeed?: number;
}
