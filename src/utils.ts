import { mosaForSolid } from "mosa-js/solid-js";
import { children, JSXElement } from "solid-js";

// SECTION: Mosa Reactivity
export type { ReadonlyProp, WriteonlyProp, Prop } from "mosa-js";
export const { useProp, useFormula, doNow, doWatch, onDispose, exists, useRoot } = mosaForSolid;

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

export function getActualChildrenProp(getChildren: () => JSXElement) {
  const getActualChildren = children(getChildren);
  return useFormula(() => {
    const actualChildren = getActualChildren();
    return exists(actualChildren)
      ? Array.isArray(actualChildren)
        ? actualChildren
        : [actualChildren]
      : [];
  })
}
