import { ParseProp, exists, isString, sizeToCss } from './BoxUtils'
import { Axis } from './BoxLayout'
import { Sig, sig, watchEffect } from 'src/utils'

// TODO: Add min and max size for all options.
export type Size = number | string | FlexSize
export type SizeSty = Partial<{
  width: Size
  widthGrows: boolean
  widthShrinks: boolean
  asWideAsParent: boolean
  height: Size
  heightGrows: boolean
  heightShrinks: boolean
  asTallAsParent: boolean
}>

export function grow(flex: number = 1) {
  return `${flex}f`
}

export interface FlexSize {
  flex: number
  min: number
  max: number
}
export function isFlexSize(size: any): size is FlexSize {
  return exists(size?.flex)
}
export function computeSizeInfo({
  size,
  isMainAxis,
}: {
  size: number | string | FlexSize
  isMainAxis: boolean
}) {
  const isShrink = size === -1
  const sizeIsFlex = isFlexSize(size)
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
        `fit-content` // This use to be auto, but that was allowing text to be cut off, so I'm trying fit-content again. I'm guessing I swapped to auto because fit-content was causing the parent to grow to fit the child even when we didnt' want it to. It seems to be working now, so I'm going to try it this way for a  bit.
  const minSize = sizeIsFlex ? (size.min === Infinity ? exactSize : sizeToCss(size.min)) : exactSize
  // TODO: If your parent's overflow is `hidden`, then max size should be `100%`
  const maxSize = sizeIsFlex
    ? size.max === Infinity
      ? undefined // ?? `100%` // I turned (maxSize: 100%) off because a 100% caps the element at the height of its parent which doesn't work if the parent scrolls its content
      : sizeToCss(size.max)
    : exactSize
  return [exactSize, minSize, maxSize, sizeIsFlex] as const
}

export function formatRawSize(props: { someChildGrows: boolean; size: Size | undefined }): Size {
  let formattedSize =
    (props.size ?? -1) === -1 ? (props.someChildGrows ? `1f` : -1) : props.size ?? -1
  if (isString(formattedSize) && formattedSize.endsWith(`f`)) {
    formattedSize = {
      min: -1,
      flex: parseFloat(formattedSize.split(`f`)[0]!),
      max: Infinity,
    } // satisfies FlexSize;
  }
  return formattedSize
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
  },
) {
  // SECTION: Basics
  watchEffect(() => {
    if (!exists(element.value)) return
    element.value.style.display = `flex`
    element.value.style.boxSizing = `border-box`
  })

  // SECTION: Width
  const formattedWidth = sig<Size>(-1)
  const widthGrows = sig(false)
  watchEffect(() => {
    if (!exists(element.value)) return
    const _formattedWidth = formatRawSize({
      someChildGrows: context.aChildsWidthGrows.value,
      size: parseProp({
        width: v => v,
        widthGrows: () => `1f`,
        widthShrinks: () => -1,
        asWideAsParent: () => `100%`,
      }),
    })
    formattedWidth.value = _formattedWidth
    const [exactWidth, wMin, wMax, _widthGrows] = computeSizeInfo({
      size: _formattedWidth,
      isMainAxis: context.parentAxis.value === Axis.row,
    })
    widthGrows.value = _widthGrows
    element.value.classList.toggle(widthGrowsClassName, _widthGrows)
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
  const formattedHeight = sig<Size>(-1)
  const heightGrows = sig(false)
  watchEffect(() => {
    if (!exists(element.value)) return
    const _formattedHeight = formatRawSize({
      someChildGrows: context.aChildsHeightGrows.value,
      size: parseProp({
        height: v => v,
        heightGrows: () => `1f`,
        heightShrinks: () => -1,
        asTallAsParent: () => `100%`,
      }),
    })
    formattedHeight.value = _formattedHeight
    const [exactHeight, hMin, hMax, _heightGrows] = computeSizeInfo({
      size: _formattedHeight,
      isMainAxis: context.parentAxis.value === Axis.column,
    })
    heightGrows.value = _heightGrows
    element.value.classList.toggle(heightGrowsClassName, _heightGrows)
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
    if (!exists(element.value)) return
    element.value.style.flexBasis =
      context.parentAxis.value === Axis.column
        ? isFlexSize(formattedHeight.value)
          ? `${formattedHeight.value.flex * 100}%`
          : heightGrows.value
          ? `100%`
          : ``
        : context.parentAxis.value === Axis.row
        ? isFlexSize(formattedWidth.value)
          ? `${formattedWidth.value.flex * 100}%`
          : widthGrows.value
          ? `100%`
          : ``
        : ``
  })
}
