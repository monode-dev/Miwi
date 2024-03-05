import { ParseProp, exists, muToCss } from "./BoxUtils";
import { Axis } from "./BoxLayout";
import { Sig, SigGet, Toggle, logTime, sig } from "src/utils";
import { createRenderEffect, untrack } from "solid-js";

export type Size = number | string | FlexSize | SIZE_SHRINKS;
export type SizeSty = Partial<{
  // Width
  minWidth: string | number;
  width: Size;
  widthGrows: boolean | number;
  widthShrinks: boolean;
  asWideAsParent: boolean;
  maxWidth: string | number;
  // Height
  minHeight: string | number;
  height: Size;
  heightGrows: boolean | number;
  heightShrinks: boolean;
  asTallAsParent: boolean;
  maxHeight: string | number;
  // Other
  isFlexDisplay: boolean;
  /* TODO: Provide an option for aspect ratio using CSS's `aspect-ratio: 3 / 2`. Maybe
   * this can be implemented as a value for width or height. Which would define it
   * relative to the other. Maybe we can find a way to pick a reasonable size if both
   * are set. I'm not 100% sure yet.*/
}>;

export function grow(flex: number = 1) {
  return { flex };
}
export function isCssSize(size: any): size is string {
  return typeof size === `string`;
}
export function isMiwiUnitSize(size: any): size is number {
  return typeof size === `number`;
}
export type SIZE_SHRINKS = typeof SIZE_SHRINKS;
export const SIZE_SHRINKS = { __SIZE_SHRINKS__: true } as const;
export function isShrinkSize(size: any): size is SIZE_SHRINKS {
  return size === SIZE_SHRINKS || size?.__SIZE_SHRINKS__ === true;
}
export interface FlexSize {
  flex: number;
}
export function isFlexSize(size: any): size is FlexSize {
  return exists(size?.flex);
}

export function computeSizeInfo(props: {
  shouldWatchMaxChildSize: Sig<boolean>;
  minSize: number | string | undefined;
  size: Size | undefined;
  maxSize: number | string | undefined;
  isMainAxis: boolean;
  parentIsStack: boolean;
  iAmAStack: boolean;
  parentPaddingStart: string;
  parentPaddingEnd: string;
  myPaddingStart: string;
  myPaddingEnd: string;
  maxChildSizePx: SigGet<number>;
  someChildGrows: Toggle<SigGet<boolean>>;
  shouldLog?: boolean;
}) {
  const sizeIgnoringChildGrowth = props.size ?? SIZE_SHRINKS;
  props.someChildGrows.toggleWatch(isShrinkSize(sizeIgnoringChildGrowth));
  if (props.shouldLog) {
    untrack(() => console.log(`someChildGrows`, props.someChildGrows.out.value));
  }
  props.shouldWatchMaxChildSize.value = props.iAmAStack && isShrinkSize(sizeIgnoringChildGrowth);
  const targetSize =
    isShrinkSize(sizeIgnoringChildGrowth) && props.someChildGrows.out.value
      ? { flex: 1 }
      : sizeIgnoringChildGrowth;
  const exactSize = isCssSize(targetSize)
    ? targetSize
    : isMiwiUnitSize(targetSize)
      ? muToCss(targetSize) // Miwi Units
      : isShrinkSize(targetSize)
        ? props.iAmAStack
          ? `calc(${props.maxChildSizePx.value}px + ${props.myPaddingStart} + ${props.myPaddingEnd})`
          : /** NOTE: This use to be auto, but that was allowing text to be cut off, so I'm trying
             * fit-content again. I'm guessing I swapped to auto because fit-content was causing the
             * parent to grow to fit the child even when we didn't want it to. It seems to be working
             * now, so I'm going to try it this way for a  bit. */
            `fit-content`
        : isFlexSize(targetSize)
          ? props.isMainAxis
            ? undefined // We'll use flex-basis instead.
            : // No siblings on this axis, so just fill parent
              props.parentIsStack
              ? `calc(100% - ${props.parentPaddingStart} - ${props.parentPaddingEnd})`
              : `100%`
          : undefined;

  // TODO: If maxSize has been set, then maybe minSize should be set to 0.
  const minSize = exists(props.minSize)
    ? isCssSize(props.minSize)
      ? props.minSize
      : muToCss(props.minSize)
    : isShrinkSize(targetSize)
      ? props.iAmAStack
        ? exactSize ?? ``
        : ``
      : /** NOTE: Elements with no specified minWidth or minHeight might overflow their parent if
         * a non-immediate child is too big even if their overflow is set to "clip". If we
         * set min size to "0px" it should have no negative impacts, but should prevent this
         * behavior. */
        exactSize ?? `0px`;
  const maxSize = exists(props.maxSize)
    ? isCssSize(props.maxSize)
      ? props.maxSize
      : props.maxSize === Infinity
        ? ``
        : muToCss(props.maxSize)
    : isShrinkSize(targetSize)
      ? ``
      : exactSize ?? ``;
  return [
    exactSize ?? ``,
    minSize,
    maxSize,
    isFlexSize(targetSize) ? targetSize.flex : undefined,
  ] as const;
}

export const widthGrowsClassName = `miwi-width-grows`;
export const heightGrowsClassName = `miwi-height-grows`;

// Box Size
export function watchBoxSize(
  parseProp: ParseProp<SizeSty>,
  element: Sig<HTMLElement | undefined>,
  context: {
    aChildsWidthGrows: Toggle<SigGet<boolean>>;
    aChildsHeightGrows: Toggle<SigGet<boolean>>;
    shouldWatchMaxChildSize: Sig<boolean>;
    maxChildWidthPx: Sig<number>;
    maxChildHeightPx: Sig<number>;
    parentAxis: Sig<Axis>;
    myAxis: SigGet<Axis>;
    shouldWatchParentPadding: Sig<boolean>;
    padTop: Sig<string>;
    padRight: Sig<string>;
    padBottom: Sig<string>;
    padLeft: Sig<string>;
    parentPaddingLeft: Sig<string>;
    parentPaddingTop: Sig<string>;
    parentPaddingRight: Sig<string>;
    parentPaddingBottom: Sig<string>;
    shouldLog: boolean;
  },
) {
  // SECTION: Basics
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    element.value.style.display = parseProp(`isFlexDisplay`) ?? true ? `flex` : ``;
    element.value.style.boxSizing = `border-box`;
    context.shouldWatchParentPadding.value = context.myAxis.value === Axis.stack;
  });

  // SECTION: Width
  const flexWidth = sig<number | undefined>(undefined);
  createRenderEffect(() => {
    if (context.shouldLog) {
      untrack(() => {
        logTime(
          `Computing width: ${JSON.stringify({
            shouldWatchMaxChildSize: context.shouldWatchMaxChildSize.value,
            minSize: parseProp(`minWidth`),
            size: parseProp({
              width: v => v,
              widthGrows: v => (exists(v) && v !== false ? { flex: v === true ? 1 : v } : -1),
              widthShrinks: (() => SIZE_SHRINKS) as () => SIZE_SHRINKS,
              asWideAsParent: () => `100%`,
            }),
            maxSize: parseProp(`maxWidth`),
            isMainAxis: context.parentAxis.value === Axis.row,
            iAmAStack: context.myAxis.value === Axis.stack,
            myPaddingStart: context.padLeft.value,
            myPaddingEnd: context.padRight.value,
            maxChildSizePx: context.maxChildWidthPx.value,
            parentIsStack: context.parentAxis.value === Axis.stack,
            parentPaddingStart: context.parentPaddingLeft.value,
            parentPaddingEnd: context.parentPaddingRight.value,
            someChildGrows: context.aChildsWidthGrows.out.value,
          })}`,
        );
      });
    }
    if (!exists(element.value)) return;
    const [exactWidth, wMin, wMax, _flexWidth] = computeSizeInfo({
      shouldWatchMaxChildSize: context.shouldWatchMaxChildSize,
      minSize: parseProp(`minWidth`),
      size: parseProp({
        width: v => v,
        widthGrows: v => (exists(v) && v !== false ? { flex: v === true ? 1 : v } : -1),
        widthShrinks: (() => SIZE_SHRINKS) as () => SIZE_SHRINKS,
        asWideAsParent: () => `100%`,
      }),
      maxSize: parseProp(`maxWidth`),
      isMainAxis: context.parentAxis.value === Axis.row,
      iAmAStack: context.myAxis.value === Axis.stack,
      myPaddingStart: context.padLeft.value,
      myPaddingEnd: context.padRight.value,
      maxChildSizePx: context.maxChildWidthPx,
      parentIsStack: context.parentAxis.value === Axis.stack,
      parentPaddingStart: context.parentPaddingLeft.value,
      parentPaddingEnd: context.parentPaddingRight.value,
      someChildGrows: context.aChildsWidthGrows,
      shouldLog: context.shouldLog,
    });
    if (context.shouldLog) {
      console.log(`exactWidth`, exactWidth);
    }
    flexWidth.value = _flexWidth;
    element.value.classList.toggle(widthGrowsClassName, exists(_flexWidth));
    element.value.style.minWidth = wMin;
    element.value.style.width = exactWidth;
    element.value.style.maxWidth = wMax;
  });

  // Height
  const flexHeight = sig<number | undefined>(undefined);
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    const [exactHeight, hMin, hMax, _flexHeight] = computeSizeInfo({
      shouldWatchMaxChildSize: context.shouldWatchMaxChildSize,
      minSize: parseProp(`minHeight`),
      size: parseProp({
        height: v => v,
        heightGrows: v => (exists(v) && v !== false ? { flex: v === true ? 1 : v } : -1),
        heightShrinks: (() => SIZE_SHRINKS) as () => SIZE_SHRINKS,
        asTallAsParent: () => `100%`,
      }),
      maxSize: parseProp(`maxHeight`),
      isMainAxis: context.parentAxis.value === Axis.column,
      iAmAStack: context.myAxis.value === Axis.stack,
      myPaddingStart: context.padTop.value,
      myPaddingEnd: context.padBottom.value,
      maxChildSizePx: context.maxChildHeightPx,
      parentIsStack: context.parentAxis.value === Axis.stack,
      parentPaddingStart: context.parentPaddingTop.value,
      parentPaddingEnd: context.parentPaddingBottom.value,
      someChildGrows: context.aChildsHeightGrows,
    });
    flexHeight.value = _flexHeight;
    element.value.classList.toggle(heightGrowsClassName, exists(_flexHeight));
    element.value.style.minHeight = hMin;
    element.value.style.height = exactHeight;
    element.value.style.maxHeight = hMax;
  });

  // SECTION: Flex Basis
  createRenderEffect(() => {
    if (!exists(element.value)) return; //flex: 1 1 0;
    element.value.style.flexBasis =
      context.parentAxis.value === Axis.column
        ? exists(flexHeight.value)
          ? `${flexHeight.value * 100}%`
          : ``
        : context.parentAxis.value === Axis.row
          ? exists(flexWidth.value)
            ? `${flexWidth.value * 100}%`
            : ``
          : ``;
  });
}
