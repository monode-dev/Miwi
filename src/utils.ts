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
export function useProp<T>(initValue: T): Prop<T> {
  const [getValue, setValue] = createSignal(initValue);
  return {
    get value(): T {
      return getValue();
    },
    set value(newValue: T) {
      setValue(newValue as any);
    },
  };
}
export function useFormula<T, Set extends ((value: T) => any) | undefined>(
  get: () => T,
  set?: Set,
): Set extends undefined ? ReadonlyProp<T> : Prop<T> {
  const getMemo = createMemo(get);
  return {
    _isSig: true,
    get value(): T {
      return getMemo();
    },
    set value(newValue: T) {
      set?.(newValue);
    },
  } as any;
}
export function doNow<T>(func: () => T): T {
  return func();
}
export function doWatch(
  options:
    | (() => void)
    | {
        on?: ReadonlyProp<any>[];
        do: () => void;
      },
) {
  createEffect(
    typeof options === `function`
      ? options
      : exists(options.on)
        ? on(
            options.on.map(dep => () => dep.value),
            options.do,
          )
        : options.do,
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
