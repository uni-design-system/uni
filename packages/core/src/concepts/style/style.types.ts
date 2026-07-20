export type StyleExpression = {
  [key: string]: string | number | StyleExpression | undefined;
};
export type NullableStyleExpression = StyleExpression | undefined;
