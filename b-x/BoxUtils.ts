
export function exists<T>(x: T): x is NonNullable<T> {
  return x !== undefined && x !== null;
}
export function isNum(x: unknown): x is number {
  return exists(x) && typeof x === `number`;
}
export function isString(x: unknown): x is string {
  return exists(x) && typeof x === `string`;
}
export type CssProps = {
  [key: string]: string | number | undefined;
};