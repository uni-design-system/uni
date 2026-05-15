export interface BoxShadow {
  offset: number; // Y-axis (positive numbers shift down)
  blur: number;
  opacity: number;
}

export interface ShadowDefinition {
  umbra: BoxShadow;
  penumbra: BoxShadow;
}
