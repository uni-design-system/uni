export type SymbolFill = 1 | 0;
export type SymbolWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700;
export type SymbolGrade = -25 | 0 | 200;

export interface SymbolOptions {
  fill?: SymbolFill;
  weight?: SymbolWeight;
  grade?: SymbolGrade;
  opticalSize?: number;
}
