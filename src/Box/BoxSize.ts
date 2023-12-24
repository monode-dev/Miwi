import { ParseProp, exists, isString, sizeToCss } from './BoxUtils'
import { Axis } from './BoxLayout'
import { Sig, SigGet, sig, watchEffect } from 'src/utils'

export type Size = number | string | FlexSize
export type SizeSty = Partial<{
  // Width
  minWidth: string | number
  width: Size
  widthGrows: boolean | number
  widthShrinks: boolean
  asWideAsParent: boolean
  maxWidth: string | number
  // Height
  minHeight: string | number
  height: Size
  heightGrows: boolean | number
  heightShrinks: boolean
  asTallAsParent: boolean
  maxHeight: string | number
  // Other
  isFlexDisplay: boolean
  /* TODO: Provide an option for aspect ratio using CSS's `aspect-ratio: 3 / 2`. Maybe
   * this can be implemented as a value for width or height. Which would define it
   * relative to the other. Maybe we can find a way to pick a reasonable size if both
   * are set. I'm not 100% sure yet.*/
}>

export function grow(flex: number = 1) {
  return { flex }
}

export interface FlexSize {
  flex: number
}
export function isFlexSize(size: any): size is FlexSize {
  return exists(size?.flex)
}
export function computeSizeInfo(props: {
  minSize: number | string | undefined
  size: number | string | FlexSize | undefined
  maxSize: number | string | undefined
  isMainAxis: boolean
  someChildGrows: SigGet<boolean>
}) {
  const size =
    (props.size ?? -1) === -1 ? (props.someChildGrows.value ? { flex: 1 } : -1) : props.size ?? -1
  const isShrink = size === -1
  const sizeIsFlex = isFlexSize(size)
  const exactSize =
    !props.isMainAxis && sizeIsFlex
      ? `100%`
      : isString(size)
      ? size
      : !isShrink && !sizeIsFlex
      ? sizeToCss(size)
      : sizeIsFlex
      ? undefined
      : `fit-content` // This use to be auto, but that was allowing text to be cut off, so I'm trying fit-content again. I'm guessing I swapped to auto because fit-content was causing the parent to grow to fit the child even when we didnt' want it to. It seems to be working now, so I'm going to try it this way for a  bit.

  // TODO: If maxSize has been set, then maybe minSize should be set to 0.
  const minSize = exists(props.minSize)
    ? typeof props.minSize === `string`
      ? props.minSize
      : sizeToCss(props.minSize)
    : isShrink
    ? ``
    : /** Elements with no specified minWidth or minHeight might overflow their parent if
       * a non-immediate child is too big even if their overflow is set to "clip". If we
       * set min size to "0px" it should have no negative impacts, but should prevent this
       * behavior. */
      exactSize ?? `0px`
  const maxSize = exists(props.maxSize)
    ? typeof props.maxSize === `string`
      ? props.maxSize
      : props.maxSize === Infinity
      ? undefined
      : sizeToCss(props.maxSize)
    : isShrink
    ? ``
    : exactSize
  return [exactSize, minSize, maxSize, sizeIsFlex ? size.flex : undefined] as const
}

export const widthGrowsClassName = `miwi-width-grows`
export const heightGrowsClassName = `miwi-height-grows`

// Box Size
export function watchBoxSize(
  parseProp: ParseProp<SizeSty>,
  element: Sig<HTMLElement | undefined>,
  context: {
    aChildsWidthGrows: Sig<boolean>
    aChildsHeightGrows: Sig<boolean>
    parentAxis: Sig<Axis>
    parentPaddingLeft: Sig<string>
    parentPaddingTop: Sig<string>
    parentPaddingRight: Sig<string>
    parentPaddingBottom: Sig<string>
    shouldLog: boolean
  },
) {
  // SECTION: Basics
  watchEffect(() => {
    if (!exists(element.value)) return
    element.value.style.display = parseProp(`isFlexDisplay`) ?? true ? `flex` : ``
    element.value.style.boxSizing = `border-box`
  })

  // SECTION: Width
  const flexWidth = sig<number | undefined>(undefined)
  watchEffect(() => {
    if (!exists(element.value)) return
    const [exactWidth, wMin, wMax, _flexWidth] = computeSizeInfo({
      minSize: parseProp(`minWidth`),
      size: parseProp({
        width: v => v,
        widthGrows: v => (exists(v) && v !== false ? { flex: v === true ? 1 : v } : -1),
        widthShrinks: () => -1,
        asWideAsParent: () => `100%`,
      }),
      maxSize: parseProp(`maxWidth`),
      isMainAxis: context.parentAxis.value === Axis.row,
      someChildGrows: context.aChildsWidthGrows,
    })
    flexWidth.value = _flexWidth
    element.value.classList.toggle(widthGrowsClassName, exists(_flexWidth))
    element.value.style.minWidth = (() => {
      let size = wMin
      // axis === Axis.stack && width === -1
      //   ? maxChildWidth
      //   : wMin;
      if (context.parentAxis.value === Axis.stack) {
        size = `calc(${size} - ${context.parentPaddingLeft.value} - ${context.parentPaddingRight.value})`
      }
      return size ?? ``
    })()
    element.value.style.width = (() => {
      let size = exactWidth
      // axis === Axis.stack && width === -1
      //   ? maxChildWidth
      //   : exactWidth;
      if (context.parentAxis.value === Axis.stack) {
        size = `calc(${size} - ${context.parentPaddingLeft.value} - ${context.parentPaddingRight.value})`
      }
      return size ?? ``
    })()
    element.value.style.maxWidth = (() => {
      let size = wMax
      // axis === Axis.stack && width === -1
      //   ? maxChildWidth
      //   : wMax;
      if (context.parentAxis.value === Axis.stack) {
        size = `calc(${size} - ${context.parentPaddingLeft.value} - ${context.parentPaddingRight.value})`
      }
      return size ?? ``
    })()
  })

  // Height
  const flexHeight = sig<number | undefined>(undefined)
  watchEffect(() => {
    if (!exists(element.value)) return
    const [exactHeight, hMin, hMax, _flexHeight] = computeSizeInfo({
      minSize: parseProp(`minHeight`),
      size: parseProp({
        height: v => v,
        heightGrows: v => (exists(v) && v !== false ? { flex: v === true ? 1 : v } : -1),
        heightShrinks: () => -1,
        asTallAsParent: () => `100%`,
      }),
      maxSize: parseProp(`maxHeight`),
      isMainAxis: context.parentAxis.value === Axis.column,
      someChildGrows: context.aChildsHeightGrows,
    })
    flexHeight.value = _flexHeight
    element.value.classList.toggle(heightGrowsClassName, exists(_flexHeight))
    element.value.style.minHeight = (() => {
      let size = hMin
      if (context.parentAxis.value === Axis.stack) {
        size = `calc(${size} - ${context.parentPaddingTop.value} - ${context.parentPaddingBottom.value})`
      }
      return size ?? ``
    })()
    element.value.style.height = (() => {
      let size = exactHeight
      if (context.parentAxis.value === Axis.stack) {
        size = `calc(${size} - ${context.parentPaddingTop.value} - ${context.parentPaddingBottom.value})`
      }
      return size ?? ``
    })()
    element.value.style.maxHeight = (() => {
      let size = hMax
      if (context.parentAxis.value === Axis.stack) {
        size = `calc(${size} - ${context.parentPaddingTop.value} - ${context.parentPaddingBottom.value})`
      }
      return size ?? ``
    })()
  })

  // SECTION: Flex Basis
  watchEffect(() => {
    if (!exists(element.value)) return //flex: 1 1 0;
    element.value.style.flexBasis =
      context.parentAxis.value === Axis.column
        ? exists(flexHeight.value)
          ? `${flexHeight.value * 100}%`
          : ``
        : context.parentAxis.value === Axis.row
        ? exists(flexWidth.value)
          ? `${flexWidth.value * 100}%`
          : ``
        : ``
  })
}
