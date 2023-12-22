import { Sig, exists, sig, watchEffect } from 'src/utils'
import { ParseProp, sizeToCss } from './BoxUtils'

// NOTE: Look into https://solid-dnd.com/ for drag and drop, and re-orderable lists.

export type LayoutSty = Partial<
  PadStyProps &
    AlignStyProps &
    AxisStyProps & {
      overflowX: Overflow
      overflowY: Overflow
      overflowXWraps: boolean
      overflowYWraps: boolean
      overflowXScrolls: boolean
      overflowYScrolls: boolean
      overflowXCrops: boolean
      overflowYCrops: boolean
      overflowXForceStretchParent: boolean
      overflowYForceStretchParent: boolean
    }
>

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
export type AxisStyProps = Partial<{
  axis: Axis
  row: boolean
  column: boolean
  stack: boolean
}>

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

// Align
// NOTE: Align only makes sense if the size on this axis is not "shrink"
export type AlignStyProps = Partial<{
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
}>
function parseAlignProps(
  parseProp: ParseProp<LayoutSty>,
  hasMoreThanOneChild: boolean,
): AlignTwoAxis {
  const spaceBetweenAsCss = hasMoreThanOneChild ? _SpaceAlign.spaceBetween : Align.center.alignX
  return {
    alignX:
      parseProp({
        alignX: v => v,
        align: v => (typeof v === `string` ? v : v?.alignX),
        alignLeft: () => Align.centerLeft.alignX,
        alignCenterX: () => Align.center.alignX,
        alignRight: () => Align.centerRight.alignX,
        spaceBetweenX: () => spaceBetweenAsCss,
        spaceAroundX: () => _SpaceAlign.spaceAround,
        spaceEvenlyX: () => _SpaceAlign.spaceEvenly,
        alignTopLeft: () => Align.topLeft.alignX,
        alignTopCenter: () => Align.topCenter.alignX,
        alignTopRight: () => Align.topRight.alignX,
        alignCenterLeft: () => Align.centerLeft.alignX,
        alignCenter: () => Align.center.alignX,
        alignCenterRight: () => Align.centerRight.alignX,
        alignBottomLeft: () => Align.bottomLeft.alignX,
        alignBottomCenter: () => Align.bottomCenter.alignX,
        alignBottomRight: () => Align.bottomRight.alignX,
        spaceBetween: () => spaceBetweenAsCss,
        spaceAround: () => _SpaceAlign.spaceAround,
        spaceEvenly: () => _SpaceAlign.spaceEvenly,
      }) ?? Align.center.alignX,
    alignY:
      parseProp({
        alignY: v => v,
        align: v => (typeof v === `string` ? v : v?.alignY),
        alignTop: () => Align.topCenter.alignY,
        alignCenterY: () => Align.center.alignY,
        alignBottom: () => Align.bottomCenter.alignY,
        spaceBetweenY: () => spaceBetweenAsCss,
        spaceAroundY: () => _SpaceAlign.spaceAround,
        spaceEvenlyY: () => _SpaceAlign.spaceEvenly,
        alignTopLeft: () => Align.topLeft.alignY,
        alignTopCenter: () => Align.topCenter.alignY,
        alignTopRight: () => Align.topRight.alignY,
        alignCenterLeft: () => Align.centerLeft.alignY,
        alignCenter: () => Align.center.alignY,
        alignCenterRight: () => Align.centerRight.alignY,
        alignBottomLeft: () => Align.bottomLeft.alignY,
        alignBottomCenter: () => Align.bottomCenter.alignY,
        alignBottomRight: () => Align.bottomRight.alignY,
        spaceBetween: () => spaceBetweenAsCss,
        spaceAround: () => _SpaceAlign.spaceAround,
        spaceEvenly: () => _SpaceAlign.spaceEvenly,
      }) ?? Align.center.alignY,
  }
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

// Classes
export const stackClassName = `miwi-stack`
const nonStackClassName = `miwi-non-stack`
const style = document.createElement(`style`)
style.textContent = `
.${stackClassName} > * {
  position: absolute;
}

.${nonStackClassName} > * {
  position: relative;
}
`
document.body.appendChild(style)

// Layout Styler
export function watchBoxLayout(
  parseProp: ParseProp<LayoutSty>,
  element: Sig<HTMLElement | undefined>,
  context: {
    hasMoreThanOneChild: Sig<boolean>
    isScrollable: Sig<boolean>
  },
) {
  // Align & Axis
  const alignX = sig<AlignSingleAxis>(_FlexAlign.center)
  const alignY = sig<AlignSingleAxis>(_FlexAlign.center)
  const axis = sig<Axis>(Axis.column)
  watchEffect(() => {
    if (!exists(element.value)) return
    const { alignX: _alignX, alignY: _alignY } = parseAlignProps(
      parseProp,
      context.hasMoreThanOneChild.value,
    )
    alignX.value = _alignX
    alignY.value = _alignY
    const _axis =
      parseProp({
        axis: v => v,
        row: () => Axis.row,
        column: () => Axis.column,
        stack: () => Axis.stack,
      }) ?? Axis.column
    axis.value = _axis
    element.value.style.justifyContent = _axis === Axis.column ? _alignY : _alignX
    element.value.style.alignItems = _axis === Axis.column ? _alignX : _alignY
    element.value.style.flexDirection = _axis === Axis.stack ? `` : _axis
    element.value.classList.toggle(stackClassName, _axis === Axis.stack)
    element.value.classList.toggle(nonStackClassName, _axis !== Axis.stack)
  })

  // Pad
  watchEffect(() => {
    if (!exists(element.value)) return
    const padEachSide = [
      parseProp({
        padTop: v => v,
        padAroundY: v => v,
        padAround: v => v,
        pad: v => v,
      }) ?? 0,
      parseProp({
        padRight: v => v,
        padAroundX: v => v,
        padAround: v => v,
        pad: v => v,
      }) ?? 0,
      parseProp({
        padBottom: v => v,
        padAroundY: v => v,
        padAround: v => v,
        pad: v => v,
      }) ?? 0,
      parseProp({
        padLeft: v => v,
        padAroundX: v => v,
        padAround: v => v,
        pad: v => v,
      }) ?? 0,
    ]
    element.value.style.padding = padEachSide.every(x => x === 0)
      ? ``
      : padEachSide.map(sizeToCss).join(` `)
    // NOTE: We want pad between to cascade, but not pad around.
    element.value.style.rowGap = (
      [Align.spaceAround, Align.spaceBetween, Align.spaceEvenly] as AlignSingleAxis[]
    ).includes(alignY.value)
      ? ``
      : sizeToCss(
          parseProp({
            padBetweenY: v => v,
            padBetween: v => v,
            pad: v => v,
          }) ?? `inherit`,
        )
    element.value.style.columnGap = (
      [Align.spaceAround, Align.spaceBetween, Align.spaceEvenly] as AlignSingleAxis[]
    ).includes(alignX.value)
      ? ``
      : sizeToCss(
          parseProp({
            padBetweenX: v => v,
            padBetween: v => v,
            pad: v => v,
          }) ?? `inherit`,
        )
  })

  // Overflow
  const overflowX = sig<Overflow>(Overflow.forceStretchParent)
  watchEffect(() => {
    if (!exists(element.value)) return
    const _overflowX =
      parseProp({
        overflowX: v => v,
        overflowXCrops: () => Overflow.crop,
        overflowXScrolls: () => Overflow.scroll,
        overflowXWraps: () => Overflow.wrap,
      }) ?? Overflow.forceStretchParent // This is because otherwise text gets cut off.
    overflowX.value = _overflowX
    const overflowY =
      parseProp({
        overflowY: v => v,
        overflowYCrops: () => Overflow.crop,
        overflowYScrolls: () => Overflow.scroll,
        overflowYWraps: () => Overflow.wrap,
      }) ?? Overflow.forceStretchParent // This is because otherwise text gets cut off.
    context.isScrollable.value = [_overflowX, overflowY].includes(Overflow.scroll)
    /* NOTE: And-ing the axis check after the overflow check means we'll only watch row
     * when it is absolutely necessary. */
    element.value.style.flexWrap =
      _overflowX === Overflow.wrap && axis.value === Axis.row
        ? `wrap`
        : overflowY === Overflow.wrap && axis.value === Axis.row
        ? `wrap`
        : ``
    element.value.style.overflowX =
      _overflowX === Overflow.scroll
        ? `auto` // Scroll when necessary, and float above contents so we can make it invisible
        : _overflowX === Overflow.crop
        ? `clip` //hidden // https://www.youtube.com/watch?v=72pUm4tQesw&t=490
        : `visible` // TODO: This doesn't work with text because FlexBox handles text differently.
    element.value.style.overflowY =
      overflowY === Overflow.scroll
        ? `auto` // Scroll when necessary, and float above contents so we can make it invisible
        : overflowY === Overflow.crop
        ? `clip` //hidden // https://www.youtube.com/watch?v=72pUm4tQesw&t=490
        : `visible`
    // Scroll bar should be invisible
    ;(element.value.style as any).scrollbarWidth = [_overflowX, overflowY].includes(Overflow.scroll)
      ? `thin`
      : ``
    ;(element.value.style as any).scrollbarColor = [_overflowX, overflowY].includes(Overflow.scroll)
      ? `#e3e3e3 transparent`
      : ``
  })
  // TODO: These should really be signals so that other things can watch if they change.
  return {
    alignX,
    overflowX,
  }
}
