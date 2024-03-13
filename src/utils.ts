import { createEffect, createMemo, createSignal, on } from "solid-js";

(window as any).lastLogTime = 0;
export function logTime(message: string) {
  const now = Date.now();
  console.log(`${message}: ${now - (window as any).lastLogTime}ms`);
  (window as any).lastLogTime = now;
}

export type ReadonlyProp<T> = { get value(): T };
export type WriteonlyProp<T> = { set value(x: T) };
export type Prop<T> = ReadonlyProp<T> & WriteonlyProp<T>;
/** Creates a reactive value that can be accessed via `.value`.
 * ```tsx
 * function MyComponent() {
 *   const myProp = useProp(0);
 *   return (
 *     // Assigning to `myProp.value` will cause the text below to automatically re-render.
 *     <button onClick={() => myProp.value++}
 *       // Because we read `myProp.value` this will automatically re-render when myProp changes.
 *       >You've pressed the button {myProp.value} times.
 *     </button>
 *   );
 * }
 * ``` */
export function useProp<T>(initValue: T): Prop<T> {
  // We literally wrap a Solid JS signal.
  const [getValue, setValue] = createSignal(initValue);
  // We prefer to the `.value` syntax to Solid's function syntax, hence why we do this.
  return {
    // Reads the value, and triggers a re-render when it changes.
    get value(): T {
      return getValue();
    },
    // Updates the value and notifies all watchers.
    set value(newValue: T) {
      setValue(newValue as any);
    },
  };
}
/** Creates a reactive value that is derived from other reactive values and can be accessed
 * via `myFormula.value`.
 * ```tsx
 * function MyComponent(props: { firstName: string; lastName: string }) {
 *   const myFormula = useFormula(() => `${props.firstName} ${props.lastName}`);
 *   // Will re-render if firstName or lastName changes.
 *   return <Txt>{myFormula.value}</Txt>;
 * }
 * ```
 * Can also be be called with a second function to create a read/write formula. Note, the
 * write type is assumed to be the same as the read type, but you can override it if you
 * need to.
 * ```ts
 * const myProp = useProp<number | null>(null);
 * // In this example we use `useFormula` to create a non-null version of `myProp`.
 * const myFormula = useFormula(
 *   () => myProp ?? 0,
 *   // Can be written to.
 *   (newValue: number) => (myProp.value = newValue),
 * );
 * ``` */
export function useFormula<
  GetType,
  Sett extends (value: any) => any = (value: GetType) => any,
  Setter extends undefined | Sett = undefined,
>(
  get: () => GetType,
  /** Optional setter function */
  set?: Setter,
): ReadonlyProp<GetType> & (undefined extends Setter ? {} : WriteonlyProp<GetType>) {
  // For getting, `useFormula` just wraps SolidJS's `createMemo`.
  const getMemo = createMemo(get);
  return {
    _isSig: true,
    get value(): GetType {
      return getMemo();
    },
    // The value can't be set on readonly formulas.
    set value(newValue) {
      set?.(newValue);
    },
  } as any;
}
/** Runs the provided function immediately and returns the result.
 * ```tsx
 * // `myNum` will equal 42
 * const myNum = doNow(() => 42);
 * ``` */
export function doNow<T>(func: () => T): T {
  return func();
}
/** Runs the provided function immediately and then re-runs it whenever any of the
 * reactive values it reads from change.
 * ```tsx
 * const myProp = useProp(0);
 *
 * // Immediately logs "myProp: 0"
 * doWatch(() => {
 *   console.log("myProp: ", myProp.value);
 * });
 *
 * // Logs "myProp: 1" when myProp changes.
 * myProp.value = 1;
 * ```
 * You may also provide an `on` option to control exactly which props to watch.
 * ```tsx
 * const myProp = useProp(0);
 * const myOtherProp = useProp(0);
 *
 * // Immediately logs "myProp: 0"
 * doWatch(
 *   () => {
 *     console.log("myProp: ", myProp.value);
 *   },
 *   { on: [myProp] },
 * );
 *
 * // Logs "myProp: 1" when myProp changes.
 * myProp.value = 1;
 *
 * // Does not log anything when myOtherProp changes.
 * myOtherProp.value = 1;
 * ``` */
export function doWatch(
  func: () => void,
  options?: Partial<{
    on: ReadonlyProp<any>[];
  }>,
) {
  // Just wraps SolidJS's `createEffect`.
  createEffect(
    exists(options?.on)
      ? // Use SolidJS's `on` when requested.
        on(
          options!.on.map(dep => () => dep.value),
          func,
        )
      : func,
  );
}
// type WritableProps<T extends {}> = {
//   [K in keyof T]: T[K] extends Writable<any> ? K : never;
// }[keyof T];
// type NonWritableProps<T extends {}> = {
//   [K in keyof T]: T[K] extends Writable<any> ? never : K;
// }[keyof T];
// export function parseProps<T extends {}>(
//   obj: T,
// ): {
//   [K in WritableProps<T>]: T[K] extends Writable<infer R> ? R : never;
// } & {
//   readonly [K in NonWritableProps<T>]: T[K] extends Writable<any> ? never : T[K];
// } {
//   return new Proxy(obj, {
//     get(target, prop) {
//       const value = target[prop as keyof typeof target];
//       if (isProp(value)) {
//         return value.get();
//       } else {
//         return value;
//       }
//     },
//     set(target, prop, value) {
//       // setterForLastProp = undefined
//       const targetProp = target[prop as keyof typeof target];
//       // if (exists(setterForLastProp)) {
//       //   ;(setterForLastProp as any)(value)
//       // } else
//       if (isProp(targetProp)) {
//         targetProp.set(value);
//       } else {
//         target[prop as keyof typeof target] = value;
//       }
//       return true;
//     },
//     has(target, key) {
//       return key in target;
//     },
//     ownKeys(target) {
//       return Reflect.ownKeys(target);
//     },
//   }) as any;
// }

export function exists<T>(x: T): x is NonNullable<T> {
  return x !== undefined && x !== null;
}

// Experimentally lets us create a value that can be watched or not.
export type Toggle<T> = {
  toggleWatch(on: boolean): void;
  out: T;
};
export function createToggle<T>(out: T, effect: () => () => void): Toggle<T> {
  let cleanup = () => {};
  let isOn = false;
  return {
    toggleWatch(on: boolean) {
      if (on === isOn) return;
      isOn = on;
      if (on) cleanup = effect();
      else cleanup();
    },
    out,
  };
}

export function formatNumWithCommas(num: number, digits: number | `min` = 0): string {
  const rounded = roundToString(num, digits);
  const [whole, decimal] = rounded.split(`.`);
  const wholeWithComma = whole?.replace(/\B(?=(\d{3})+(?!\d))/g, `,`);
  return `${wholeWithComma ?? ``}${exists(decimal) ? `.${decimal}` : ``}`;
}

export function roundToString(num: number, digits: number | `min` = 0): string {
  // Sometimes there are rouding errors. adding a 0.000..01 on the end seems to reduce these.
  const significantDecimals = num.toString().split(`.`)[1]?.length ?? 0;
  const acutalDigits = digits === `min` ? significantDecimals : digits;
  const numRoundingOffset = Math.pow(10, -significantDecimals - 1);
  const digitRoundOffset = Math.pow(10, -acutalDigits - 1);
  const roundingOffset = Math.min(numRoundingOffset, digitRoundOffset);
  return (num + roundingOffset).toFixed(acutalDigits);
}

export const NONE_SELECTED = `noneSelected`;
export const ONE_TIME = `oneTime`;
export const JUST_FUEL = `justFuel`;

export function formatPhoneNumber(input: string, event: InputEvent) {
  let ogInputLength = input?.length; // GET FULL LENGTH OF INPUT STRING
  let caretPos = (event.target as HTMLInputElement | HTMLTextAreaElement | undefined)
    ?.selectionStart; // GET CURRENT CURSOR POSITION
  let justNums = input?.replace(/\D/g, ""); // STRIP NON-NUMERIC CHARS
  let justNumsLength = justNums?.length; // GET LENGTH OF NUMBER STRING

  if (justNumsLength > 10) {
    input =
      justNums?.slice(0, 3) +
      "-" +
      justNums?.slice(3, 6) +
      "-" +
      justNums?.slice(6, 10) +
      "#" +
      justNums?.slice(10, justNumsLength);

    if (justNumsLength == 11 && caretPos == 13 && ogInputLength != 14) {
      caretPos = 14;
    }
  } else if (justNumsLength > 6) {
    input = justNums?.slice(0, 3) + "-" + justNums?.slice(3, 6) + "-" + justNums?.slice(6, 10);

    if (justNumsLength == 7 && caretPos == 8 && ogInputLength != 9) {
      caretPos = 9;
    }
  } else if (justNumsLength > 3) {
    input = justNums?.slice(0, 3) + "-" + justNums?.slice(3, 6);

    if (justNumsLength == 4 && caretPos == 4 && ogInputLength != 5) {
      caretPos = 5;
    }
  } else {
    input = justNums;
  }

  return {
    input: input,
    caret: caretPos as number,
  };
}

export function formatAddress(input: string, event: InputEvent) {
  for (let i = 0; i < input.length; i++) {
    if (i == 0 || input.charAt(i - 1) == " ") {
      input = input.slice(0, i) + input.charAt(i).toUpperCase() + input.slice(i + 1);
    }
  }

  return {
    input: input,
    caret: (event.target as HTMLInputElement | HTMLTextAreaElement | undefined)?.selectionStart,
  };
}

// Tue, March 10th 2021 - 3:00 PM
export function formatPosixTime(posixTime: number) {
  // Create a new Date object from the posix time
  let date = new Date(posixTime);

  // Array of day names
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Array of month names
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Get the day of the week, the month and the date
  let dayOfWeek = days[date.getDay()];
  let month = months[date.getMonth()];
  let day = date.getDate();
  let time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  // Add the ordinal suffix
  let suffix = "";
  switch (day % 10) {
    case 1:
      suffix = day === 11 ? "th" : "st";
      break;
    case 2:
      suffix = day === 12 ? "th" : "nd";
      break;
    case 3:
      suffix = day === 13 ? "th" : "rd";
      break;
    default:
      suffix = "th";
  }

  // Get the year
  let year = date.getFullYear();

  // Return the formatted string
  return `${dayOfWeek}, ${month} ${day}${suffix} ${year} - ${time}`;
}

export function sessionStore<T>(storeName: string, defineStore: () => T): () => T {
  const storePropName = `miwi_sessionStore_${storeName}`;
  return function () {
    if (!exists((window as any)[storePropName])) {
      (window as any)[storePropName] = defineStore();
    }
    return (window as any)[storePropName];
  };
}

export type AllowOne<T> = {
  [K in keyof T]: { [P in keyof T]?: P extends K ? T[P] : undefined };
}[keyof T];

export type DeepPartial<T extends {}> = {
  [K in keyof T]?: T[K] extends {} ? DeepPartial<T[K]> : T[K];
};

export type OnlyOne<T extends {}> = Partial<
  {
    [K in keyof T]: Pick<T, K> & Partial<Record<Exclude<keyof T, K>, never>>;
  }[keyof T]
>;
