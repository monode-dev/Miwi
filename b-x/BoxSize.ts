import { isNum, exists, isString, CssProps } from "./BoxUtils";
import {
  Axis,
  LayoutSty,
  Overflow,
  defaultOverflowX,
  defaultOverflowY,
} from "./BoxLayout";

export type SizeSty = {
  width: number | string | FlexSize;
  height: number | string | FlexSize;
};

// scale: [positive-space, negative-space]
// const muToRem = 1.125; //1.0625;
export const muToRem = 1.125; //1.0625;
export function sizeToCss(num: number | string) {
  if (isNum(num)) {
    const remValue = num * muToRem;
    const fontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    const pixelValue = remValue * fontSize;
    return `${roundToString(pixelValue)}px`;
  } else {
    return num;
  }
}
function roundToString(num: number, digits: number = 0): string {
  // Sometimes there are rouding errors. adding a 0.000..01 on the end seems to reduce these.
  const significantDecimals = num.toString().split(`.`)[1]?.length ?? 0;
  const roundingOffset = Math.pow(10, -significantDecimals - 1);
  return (num + roundingOffset).toFixed(digits);
}

export interface FlexSize {
  flex: number;
  min: number;
  max: number;
}
export function isFlexSize(size: any): size is FlexSize {
  return exists(size?.flex);
}
export function computeSizeInfo({
  size,
  isMainAxis,
  overflow,
}: {
  size: number | string | FlexSize;
  isMainAxis: boolean;
  overflow: Overflow;
}) {
  const isShrink = size === -1;
  const sizeIsFlex = isFlexSize(size);
  const exactSize =
    !isMainAxis && sizeIsFlex
      ? `100%`
      : isString(size)
      ? size
      : !isShrink && !sizeIsFlex
      ? sizeToCss(size)
      : sizeIsFlex
      ? undefined
      : //: `fit-content`;
        `fit-content`; // This use to be auto, but that was allowing text to be cut off, so I'm trying fit-content again. I'm guessing I swapped to auto because fit-content was causing the parent to grow to fit the child even when we didnt' want it to. It seems to be working now, so I'm going to try it this way for a  bit.
  const minSize = sizeIsFlex
    ? size.min === Infinity
      ? exactSize
      : sizeToCss(size.min)
    : exactSize;
  // TODO: If your parent's overflow is `hidden`, then max size should be `100%`
  const maxSize = sizeIsFlex
    ? size.max === Infinity
      ? undefined // ?? `100%` // I turned (maxSize: 100%) off because a 100% caps the element at the height of its parent which doesn't work if the parent scrolls its content
      : sizeToCss(size.max)
    : exactSize;
  return [exactSize, minSize, maxSize, sizeIsFlex] as const;
}

export function computeBoxSize(
  sty: Partial<SizeSty & LayoutSty>,
  childWidthGrows: boolean,
  childHeightGrows: boolean,
  parentAxis: Axis,
  parentPadTop: string,
  parentPadRight: string,
  parentPadBottom: string,
  parentPadLeft: string,
): CssProps {
  let width =
    (sty.width ?? -1) === -1 ? (childWidthGrows ? `1f` : -1) : sty.width ?? -1;
  if (isString(width) && width.endsWith(`f`)) {
    width = {
      flex: parseFloat(width.split(`f`)[0]),
      min: -1,
      max: Infinity,
    }; // satisfies FlexSize;
  }
  const [exactWidth, wMin, wMax, widthGrows] = computeSizeInfo({
    size: width,
    isMainAxis: parentAxis === Axis.row,
    overflow: sty.overflowX ?? defaultOverflowX,
  });
  let height =
    (sty.height ?? -1) === -1
      ? childHeightGrows
        ? `1f`
        : -1
      : sty.height ?? -1;
  if (isString(height) && height.endsWith(`f`)) {
    height = {
      flex: parseFloat(height.split(`f`)[0]),
      min: -1,
      max: Infinity,
    }; // satisfies FlexSize;
  }
  const [exactHeight, hMin, hMax, heightGrows] = computeSizeInfo({
    size: height,
    isMainAxis: parentAxis === Axis.column,
    overflow: sty.overflowY ?? defaultOverflowY,
  });
  return {
    // Sizing
    display: `flex`,
    boxSizing: `border-box`,
    // Using minWidth and maxWidth tells css to not override the size of this element
    width: (() => {
      let size = exactWidth;
      // axis === Axis.stack && width === -1
      //   ? maxChildWidth
      //   : exactWidth;
      if ((parent as any)?.sty?.axis === Axis.stack) {
        size = `calc(${size} - ${parentPadLeft ?? `0px`} - ${
          parentPadRight ?? `0px`
        })`;
      }
      return size;
    })(),
    minWidth: (() => {
      let size = wMin;
      // axis === Axis.stack && width === -1
      //   ? maxChildWidth
      //   : wMin;
      if ((parent as any)?.sty?.axis === Axis.stack) {
        size = `calc(${size} - ${parentPadLeft ?? `0px`} - ${
          parentPadRight ?? `0px`
        })`;
      }
      return size;
    })(),
    maxWidth: (() => {
      let size = wMax;
      // axis === Axis.stack && width === -1
      //   ? maxChildWidth
      //   : wMax;
      if ((parent as any)?.sty?.axis === Axis.stack) {
        size = `calc(${size} - ${parentPadLeft ?? `0px`} - ${
          parentPadRight ?? `0px`
        })`;
      }
      return size;
    })(),
    height: (() => {
      let size = exactHeight;
      // axis === Axis.stack && height === -1
      //   ? maxChildHeight
      //   : exactHeight;
      if ((parent as any)?.sty?.axis === Axis.stack) {
        size = `calc(${size} - ${parentPadTop ?? `0px`} - ${
          parentPadBottom ?? `0px`
        })`;
      }
      return size;
    })(),
    minHeight: (() => {
      let size = hMin;
      // axis === Axis.stack && height === -1
      //   ? maxChildHeight
      //   : hMin;
      if ((parent as any)?.sty?.axis === Axis.stack) {
        size = `calc(${size} - ${parentPadTop ?? `0px`} - ${
          parentPadBottom ?? `0px`
        })`;
      }
      return size;
    })(),
    maxHeight: (() => {
      let size = hMax;
      // axis === Axis.stack && height === -1
      //   ? maxChildHeight
      //   : hMax;
      if ((parent as any)?.sty?.axis === Axis.stack) {
        size = `calc(${size} - ${parentPadTop ?? `0px`} - ${
          parentPadBottom ?? `0px`
        })`;
      }
      return size;
    })(),
    flexBasis:
      parentAxis === Axis.column
        ? isFlexSize(height)
          ? `${height.flex * 100}%`
          : heightGrows
          ? `100%`
          : undefined
        : parentAxis === Axis.row
        ? isFlexSize(width)
          ? `${width.flex * 100}%`
          : widthGrows
          ? `100%`
          : undefined
        : undefined,
    // flexBasis:
    //   parentAxis === Axis.column
    //     ? isFlexSize(height)
    //       ? `calc(${height.flex * 100}% - (4 * ${cssPadding ?? `0px`}))`
    //       : heightGrows
    //         ? `calc(100% - (4 * ${cssPadding ?? `0px`}))`
    //         : undefined
    //     : parentAxis === Axis.row
    //       ? isFlexSize(width)
    //         ? `calc(${width.flex * 100}% - (4 * ${cssPadding ?? `0px`}))`
    //         : widthGrows
    //           ? `calc(100% - (4 * ${cssPadding ?? `0px`}))`
    //           : undefined
    //       : undefined,
  };
}
