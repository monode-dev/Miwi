export function exists<T>(x: T): x is NonNullable<T> {
  return x !== undefined && x !== null
}
export function isNum(x: unknown): x is number {
  return exists(x) && typeof x === `number`
}
export function isString(x: unknown): x is string {
  return exists(x) && typeof x === `string`
}
export type CssProps = {
  [key: string]: string | number | undefined
}

// scale: [positive-space, negative-space]
// const muToRem = 1.125; //1.0625;
export const muToRem = 1.125 //1.0625;
export function sizeToCss<Num extends number | string | undefined>(
  num: Num,
): Num extends number ? string : Num {
  if (isNum(num)) {
    const remValue = num * muToRem
    const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const pixelValue = remValue * fontSize
    return `${roundToString(pixelValue)}px` as any
  } else {
    return num as any
  }
}
function roundToString(num: number, digits: number = 0): string {
  // Sometimes there are rouding errors. adding a 0.000..01 on the end seems to reduce these.
  const significantDecimals = num.toString().split(`.`)[1]?.length ?? 0
  const roundingOffset = Math.pow(10, -significantDecimals - 1)
  return (num + roundingOffset).toFixed(digits)
}
