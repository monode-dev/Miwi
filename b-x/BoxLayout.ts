import { CssProps, exists, isNum, isString } from "./BoxUtils";
import { sizeToCss } from "./BoxSize";

export type LayoutSty = PadStyProps &
  AlignStyProps & {
    axis: Axis;
    overflowX: Overflow;
    overflowY: Overflow;
  };

// Pad
type _PadUnit = number | string;
export type PadStyProps = {
  // All
  pad: _PadUnit;
  // Around
  padAround: _PadUnit;
  padAroundX: _PadUnit;
  padAroundY: _PadUnit;
  padTop: _PadUnit;
  padRight: _PadUnit;
  padBottom: _PadUnit;
  padLeft: _PadUnit;
  // Between
  padBetween: _PadUnit;
  padBetweenRows: _PadUnit;
  padBetweenColumns: _PadUnit;
};

// Axis
export type Axis = (typeof Axis)[keyof typeof Axis];
export const Axis = {
  row: `row`,
  column: `column`,
  stack: `stack`,
} as const;

// Overflow
export type Overflow = (typeof Overflow)[keyof typeof Overflow];
export const Overflow = {
  /** TODO: A css overflow of `visible` doesn't behave like we want it to. We
   * want it to behave like a spreadsheet, showing the overflow but not affecting
   * layout. However, a css overflow of visible instead affect the layout of
   * siblings and parents. We need to find a way to fix this. It would probabl
   * involve spawing a sub div to wrap the children in. */
  // visible: `visible`, // Maybe just call this "overflow"
  forceStretchParent: `forceStretchParent`,
  crop: `crop`, // Ellipsis should be a sub option of crop on overflowX
  wrap: `wrap`,
  scroll: `scroll`,
} as const;
export const defaultOverflowX = Overflow.forceStretchParent; // Overflow.crop;
export const defaultOverflowY = Overflow.forceStretchParent; // Overflow.crop; // This is because otherwise text gets cut off.

// Align
// NOTE: Align only makes sense if the size on this axis is not "shrink"
export type AlignStyProps = {
  align: Align;
  alignX: AlignSingleAxis;
  alignY: AlignSingleAxis;
};
// NOTE: At some point we probably want to crossout the align property if the size is shrink since it won't do anything.
// NOTE: We probably eventually want to allow align to be a number between -1 and 1 so that contents can be precisely positioned.
export type _FlexAlign = (typeof _FlexAlign)[keyof typeof _FlexAlign];
export const _FlexAlign = {
  start: `flex-start`,
  center: `center`,
  end: `flex-end`,
} as const;
export type _SpaceAlign = (typeof _SpaceAlign)[keyof typeof _SpaceAlign];
export const _SpaceAlign = {
  spaceBetween: `space-between`,
  spaceAround: `space-around`,
  spaceEvenly: `space-evenly`,
} as const;
export type AlignSingleAxis = _FlexAlign | _SpaceAlign;
export type AlignTwoAxis = {
  alignX: AlignSingleAxis;
  alignY: AlignSingleAxis;
};
export type Align = AlignSingleAxis | AlignTwoAxis;
export const Align = {
  ..._FlexAlign,
  ..._SpaceAlign,
  topLeft: {
    alignX: _FlexAlign.start,
    alignY: _FlexAlign.start,
  },
  topCenter: {
    alignX: _FlexAlign.center,
    alignY: _FlexAlign.start,
  },
  topRight: {
    alignX: _FlexAlign.end,
    alignY: _FlexAlign.start,
  },
  centerLeft: {
    alignX: _FlexAlign.start,
    alignY: _FlexAlign.center,
  },
  center: {
    alignX: _FlexAlign.center,
    alignY: _FlexAlign.center,
  },
  centerRight: {
    alignX: _FlexAlign.end,
    alignY: _FlexAlign.center,
  },
  bottomLeft: {
    alignX: _FlexAlign.start,
    alignY: _FlexAlign.end,
  },
  bottomCenter: {
    alignX: _FlexAlign.center,
    alignY: _FlexAlign.end,
  },
  bottomRight: {
    alignX: _FlexAlign.end,
    alignY: _FlexAlign.end,
  },
} as const;

// Compute
export function computeBoxLayout(
  sty: Partial<LayoutSty>,
  align: Align,
  parent: any,
  axis: Axis,
  childCount: number,
): CssProps {
  // Pad
  const padTop = sizeToCss(
    sty.padTop ?? sty.padAroundY ?? sty.padAround ?? sty.pad ?? 0,
  );
  const padRight = sizeToCss(
    sty.padRight ?? sty.padAroundX ?? sty.padAround ?? sty.pad ?? 0,
  );
  const padBottom = sizeToCss(
    sty.padBottom ?? sty.padAroundY ?? sty.padAround ?? sty.pad ?? 0,
  );
  const padLeft = sizeToCss(
    sty.padLeft ?? sty.padAroundX ?? sty.padAround ?? sty.pad ?? 0,
  );
  const padBetweenRows = sizeToCss(
    sty.padBetweenRows ?? sty.padBetween ?? sty.pad ?? 0,
  );
  const padBetweenColumns = sizeToCss(
    sty.padBetweenColumns ?? sty.padBetween ?? sty.pad ?? 0,
  );
  // Align
  const alignX = (() => {
    let result =
      sty.alignX ??
      (isString(align) ? align : align.alignX) ??
      _FlexAlign.center;
    if (result === _SpaceAlign.spaceBetween && childCount === 1) {
      result = _FlexAlign.center;
    }
    return result;
  })();
  const alignY = (() => {
    let result =
      sty.alignY ??
      (isString(align) ? align : align.alignY) ??
      _FlexAlign.center;
    if (result === _SpaceAlign.spaceBetween && childCount === 1) {
      result = _FlexAlign.center;
    }
    return result;
  })();

  // Overflow
  const overflowX = sty.overflowX ?? defaultOverflowX;
  const overflowY = sty.overflowY ?? defaultOverflowY;
  return {
    // position: parent?.props?.sty?.axis === Axis.stack ? `absolute` : `relative`,

    // Pad
    // NOTE: Default could maybe be based off of font size.
    // NOTE: We might consider making padding and spacing cascade. I'm not sure if we want to, but it might reduce developer code.
    padding: `${padTop} ${padRight} ${padBottom} ${padLeft}`,
    rowGap: padBetweenRows,
    columnGap: padBetweenColumns,
    margin: 0,

    // Align: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
    // I've decided that space-between with one child should center it, instead of putting it at the start like CSS does.
    justifyContent: axis === Axis.column ? alignY : alignX,
    alignItems: axis === Axis.column ? alignX : alignY,

    // Axis
    flexDirection: axis === Axis.stack ? undefined : axis,

    // Overflow
    flexWrap:
      axis === Axis.row
        ? overflowX === Overflow.wrap
          ? `wrap`
          : undefined
        : overflowY === Overflow.wrap
        ? `wrap`
        : undefined,
    overflowX:
      overflowX === Overflow.scroll
        ? `auto` // Scroll when nesscary, and float above contents so we can make it invisible
        : overflowX === Overflow.crop
        ? `hidden`
        : `visible`,
    overflowY:
      overflowY === Overflow.scroll
        ? `auto` // Scroll when nesscary, and float above contents so we can make it invisible
        : overflowY === Overflow.crop
        ? `hidden`
        : `visible`,
    // Scroll bar should be invisible
    scrollbarWidth: [overflowX, overflowY].includes(Overflow.scroll)
      ? `thin`
      : undefined,
    scrollbarColor: [overflowX, overflowY].includes(Overflow.scroll)
      ? `#e3e3e3 transparent`
      : undefined,
  };
}
