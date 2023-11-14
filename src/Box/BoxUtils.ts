export function exists<T>(x: T): x is NonNullable<T> {
  return x !== undefined && x !== null
}
export function isString(x: unknown): x is string {
  return exists(x) && typeof x === `string`
}

// SECTION: Prop Parser
export type ParseProp<Obj extends {}> = <
  Parsers extends
    | keyof Obj
    | {
        [Key in keyof Obj]?: (value: Obj[Key]) => any
      },
  ParseAll extends boolean = false,
>(
  parsers: Parsers,
  parseAll?: ParseAll,
) => ReturnBasedOnParseAll<
  | undefined
  | (Parsers extends keyof Obj
      ? Obj[Parsers]
      : Parsers[keyof Parsers] extends (...args: any[]) => infer T
      ? T
      : undefined),
  ParseAll
>
type ReturnBasedOnParseAll<T, IsList extends boolean> = IsList extends true ? NonNullable<T>[] : T
export function makePropParser<
  Obj extends {
    overrideProps?: Partial<Obj>
    [key: string]: any
  },
>(obj: Obj) {
  /** Some props have multiple aliases, like `width` and `widthGrows`. This function helps parse
   * aliased props in both the current obj and any overrides. */
  return ((parsers, parseAll: boolean = false) => {
    // First try parsing the override
    const parsedOverrides: any = exists(obj.overrideProps)
      ? makePropParser(obj.overrideProps)(parsers as any, parseAll)
      : undefined
    if (exists(parsedOverrides) && !parseAll) return parsedOverrides
    const allParsers: any[] = parseAll ? parsedOverrides ?? [] : []

    // If this prop has not been overriden, then try parsing the prop
    if (typeof parsers === `string`) {
      if (parseAll) {
        allParsers.splice(0, 0, obj[parsers])
        return allParsers.filter(exists)
      } else {
        return obj[parsers]
      }
    } else {
      for (const key of Object.keys(parsers)) {
        if (exists(obj[key])) {
          const parsedValue = (parsers as any)[key]?.(obj[key])
          if (exists(parsedValue)) {
            if (parseAll) {
              allParsers.splice(0, 0, parsedValue)
              return allParsers.filter(exists)
            } else {
              return parsedValue
            }
          }
        }
      }
    }

    // We might not be able to parse this prop
    return undefined
  }) satisfies ParseProp<Obj>
}

// scale: [positive-space, negative-space]
// const muToRem = 1.125; //1.0625;
export const muToRem = 1.125 //1.0625;
export function sizeToCss<Num extends number | string | undefined>(
  num: Num,
): Num extends number ? string : Num {
  if (exists(num) && typeof num === `number`) {
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

// SECTION: Observer
export function observeElement(
  element: HTMLElement,
  options: MutationObserverInit,
  callback: (mutations: MutationRecord[], observer: MutationObserver) => void,
) {
  const observer = new MutationObserver(callback)
  observer.observe(element, options)
  callback([], observer)
  return observer
}
