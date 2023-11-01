import { CssProps, exists, isString } from './BoxUtils'
import { sizeToCss } from './BoxSize'

// NOTE: Look into https://solid-dnd.com/ for drag and drop, and reorderable lists.

export type LayoutSty = PadStyProps &
  AlignStyProps &
  AxisStyProps & {
    overflowX: Overflow
    overflowY: Overflow
  }

// type PartSty = {
//   width: -1
//   /**
//    * @deprecated When width is shrink, this is ignored.
//    */
//   align: Align
// }
// function test(part: PartSty) {}
// test({ width: -1, align: `center` })
// const myVal: PartSty = { width: -1, align: `center` }
// console.log(myVal)

// Pad
type _PadUnit = number | string
export type PadStyProps = {
  // All
  pad: _PadUnit
  // Around
  padAround: _PadUnit
  padAroundX: _PadUnit
  padAroundY: _PadUnit
  padTop: _PadUnit
  padRight: _PadUnit
  padBottom: _PadUnit
  padLeft: _PadUnit
  // Between
  padBetween: _PadUnit
  padBetweenX: _PadUnit
  padBetweenY: _PadUnit
}

// Axis
export type Axis = (typeof Axis)[keyof typeof Axis]
export const Axis = {
  row: `row`,
  column: `column`,
  stack: `stack`,
} as const
export type AxisStyProps = {
  axis: Axis
} & {
  row: boolean
  column: boolean
  stack: boolean
}

// Overflow
export type Overflow = (typeof Overflow)[keyof typeof Overflow]
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
} as const
export const defaultOverflowX = Overflow.forceStretchParent // Overflow.crop;
export const defaultOverflowY = Overflow.forceStretchParent // Overflow.crop; // This is because otherwise text gets cut off.

// Align
// NOTE: Align only makes sense if the size on this axis is not "shrink"
export type AlignStyProps = {
  align: Align
  alignX: AlignSingleAxis
  alignY: AlignSingleAxis
  // Flags
  alignTopLeft: boolean
  alignTopCenter: boolean
  alignTopRight: boolean
  alignCenterLeft: boolean
  alignCenter: boolean
  alignCenterRight: boolean
  alignBottomLeft: boolean
  alignBottomCenter: boolean
  alignBottomRight: boolean
  alignTop: boolean
  alignCenterY: boolean
  alignBottom: boolean
  alignLeft: boolean
  alignCenterX: boolean
  alignRight: boolean
  spaceBetween: boolean
  spaceBetweenX: boolean
  spaceBetweenY: boolean
  spaceAround: boolean
  spaceAroundX: boolean
  spaceAroundY: boolean
  spaceEvenly: boolean
  spaceEvenlyX: boolean
  spaceEvenlyY: boolean
}
function getAlign(sty: Partial<AlignStyProps>, childCount: number): AlignTwoAxis {
  const alignX = (() => {
    let result = sty.alignX ?? (isString(sty.align) ? sty.align : sty.align?.alignX)
    // Parse flags
    if (!exists(result)) {
      if (sty.alignLeft) {
        result = Align.centerLeft.alignX
      } else if (sty.alignCenterX) {
        result = Align.center.alignX
      } else if (sty.alignRight) {
        result = Align.centerRight.alignX
      } else if (sty.spaceBetweenX) {
        result = _SpaceAlign.spaceBetween
      } else if (sty.spaceAroundX) {
        result = _SpaceAlign.spaceAround
      } else if (sty.spaceEvenlyX) {
        result = _SpaceAlign.spaceEvenly
      } else if (sty.alignTopLeft || sty.alignCenterLeft || sty.alignBottomLeft) {
        result = Align.center.alignX
      } else if (sty.alignTopCenter || sty.alignCenter || sty.alignBottomCenter) {
        result = Align.center.alignX
      } else if (sty.alignTopRight || sty.alignCenterRight || sty.alignBottomRight) {
        result = Align.center.alignX
      } else if (sty.spaceBetween) {
        result = _SpaceAlign.spaceBetween
      } else if (sty.spaceAround) {
        result = _SpaceAlign.spaceAround
      } else if (sty.spaceEvenly) {
        result = _SpaceAlign.spaceEvenly
      } else {
        result = Align.center.alignX
      }
    }
    // I've decided that space-between with one child should center it, instead of putting it at the start like CSS does.
    if (result === _SpaceAlign.spaceBetween && childCount === 1) {
      result = _FlexAlign.center
    }
    return result
  })()
  const alignY = (() => {
    let result = sty.alignY ?? (isString(sty.align) ? sty.align : sty.align?.alignY)
    // Parse flags
    if (!exists(result)) {
      if (sty.alignTop) {
        result = Align.topCenter.alignY
      } else if (sty.alignCenterY) {
        result = Align.center.alignY
      } else if (sty.alignBottom) {
        result = Align.bottomCenter.alignY
      } else if (sty.spaceBetweenY) {
        result = _SpaceAlign.spaceBetween
      } else if (sty.spaceAroundY) {
        result = _SpaceAlign.spaceAround
      } else if (sty.spaceEvenlyY) {
        result = _SpaceAlign.spaceEvenly
      } else if (sty.alignTopLeft || sty.alignTopCenter || sty.alignTopRight) {
        result = Align.topCenter.alignY
      } else if (sty.alignCenterLeft || sty.alignCenter || sty.alignCenterRight) {
        result = Align.center.alignY
      } else if (sty.alignBottomLeft || sty.alignBottomCenter || sty.alignBottomRight) {
        result = Align.bottomCenter.alignY
      } else if (sty.spaceBetween) {
        result = _SpaceAlign.spaceBetween
      } else if (sty.spaceAround) {
        result = _SpaceAlign.spaceAround
      } else if (sty.spaceEvenly) {
        result = _SpaceAlign.spaceEvenly
      } else {
        result = Align.center.alignY
      }
    }
    // I've decided that space-between with one child should center it, instead of putting it at the start like CSS does.
    if (result === _SpaceAlign.spaceBetween && childCount === 1) {
      result = _FlexAlign.center
    }
    return result
  })()

  return { alignX, alignY }
}
// NOTE: At some point we probably want to crossout the align property if the size is shrink since it won't do anything.
// NOTE: We probably eventually want to allow align to be a number between -1 and 1 so that contents can be precisely positioned.
export type _FlexAlign = (typeof _FlexAlign)[keyof typeof _FlexAlign]
export const _FlexAlign = {
  start: `flex-start`,
  center: `center`,
  end: `flex-end`,
} as const
export type _SpaceAlign = (typeof _SpaceAlign)[keyof typeof _SpaceAlign]
export const _SpaceAlign = {
  spaceBetween: `space-between`,
  spaceAround: `space-around`,
  spaceEvenly: `space-evenly`,
} as const
export type AlignSingleAxis = _FlexAlign | _SpaceAlign
export type AlignTwoAxis = {
  alignX: AlignSingleAxis
  alignY: AlignSingleAxis
}
export type Align = AlignSingleAxis | AlignTwoAxis
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
} as const

// Compute
export function computeBoxLayout(sty: Partial<LayoutSty>, childCount: number): CssProps {
  // Pad
  const padTop = sizeToCss(sty.padTop ?? sty.padAroundY ?? sty.padAround ?? sty.pad ?? 0)
  const padRight = sizeToCss(sty.padRight ?? sty.padAroundX ?? sty.padAround ?? sty.pad ?? 0)
  const padBottom = sizeToCss(sty.padBottom ?? sty.padAroundY ?? sty.padAround ?? sty.pad ?? 0)
  const padLeft = sizeToCss(sty.padLeft ?? sty.padAroundX ?? sty.padAround ?? sty.pad ?? 0)
  // NOTE: We want pad between to cascade, but not pad around.
  const padBetweenX = sizeToCss(sty.padBetweenX ?? sty.padBetween ?? sty.pad ?? `inherit`)
  const padBetweenY = sizeToCss(sty.padBetweenY ?? sty.padBetween ?? sty.pad ?? `inherit`)
  // Axis
  const axis = sty.axis ?? (sty.row ? Axis.row : sty.stack ? Axis.stack : Axis.column)
  // Align
  const { alignX, alignY } = getAlign(sty, childCount)

  // Overflow
  const overflowX = sty.overflowX ?? defaultOverflowX
  const overflowY = sty.overflowY ?? defaultOverflowY
  return {
    // position: parent?.props?.sty?.axis === Axis.stack ? `absolute` : `relative`,

    // Pad
    // NOTE: Default could maybe be based off of font size.
    // NOTE: We might consider making padding and spacing cascade. I'm not sure if we want to, but it might reduce developer code.
    padding: `${padTop} ${padRight} ${padBottom} ${padLeft}`,
    rowGap: padBetweenX,
    columnGap: padBetweenY,
    margin: 0,

    // Align: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
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
    scrollbarWidth: [overflowX, overflowY].includes(Overflow.scroll) ? `thin` : undefined,
    scrollbarColor: [overflowX, overflowY].includes(Overflow.scroll)
      ? `#e3e3e3 transparent`
      : undefined,
  }
}
