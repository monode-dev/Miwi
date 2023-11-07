import { exists, isString, sizeToCss } from './BoxUtils'
import { layoutStyler, Axis } from './BoxLayout'

export type Size = number | string | FlexSize
export type SizeSty = {
  width: Size
  height: Size
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

export const widthGrowsClassName = `b-x-width-grows`
export const heightGrowsClassName = `b-x-height-grows`

// Size Styler
export const sizeStyler = layoutStyler.addStyler<SizeSty>((attributes, htmlElement, context) => {
  const formattedWidth = formatRawSize({
    someChildGrows: context.aChildsWidthGrows,
    size: attributes.width,
  })
  const formattedHeight = formatRawSize({
    someChildGrows: context.aChildsHeightGrows,
    size: attributes.height,
  })
  const parentAxis = context.parentStyle?.flexDirection ?? Axis.column
  const [exactWidth, wMin, wMax, widthGrows] = computeSizeInfo({
    size: formattedWidth,
    isMainAxis: parentAxis === Axis.row,
  })
  const [exactHeight, hMin, hMax, heightGrows] = computeSizeInfo({
    size: formattedHeight,
    isMainAxis: parentAxis === Axis.column,
  })

  // Apply
  htmlElement.style.display = `flex`
  htmlElement.style.boxSizing = `border-box`
  htmlElement.style.width = (() => {
    let size = exactWidth
    // axis === Axis.stack && width === -1
    //   ? maxChildWidth
    //   : exactWidth;
    if ((parent as any)?.sty?.axis === Axis.stack) {
      size = `calc(${size} - ${context.parentStyle?.paddingLeft ?? `0px`} - ${
        context.parentStyle?.paddingRight ?? `0px`
      })`
    }
    return size ?? ``
  })()
  htmlElement.style.minWidth = (() => {
    let size = wMin
    // axis === Axis.stack && width === -1
    //   ? maxChildWidth
    //   : wMin;
    if ((parent as any)?.sty?.axis === Axis.stack) {
      size = `calc(${size} - ${context.parentStyle?.paddingLeft ?? `0px`} - ${
        context.parentStyle?.paddingRight ?? `0px`
      })`
    }
    return size ?? ``
  })()
  htmlElement.style.maxWidth = (() => {
    let size = wMax
    // axis === Axis.stack && width === -1
    //   ? maxChildWidth
    //   : wMax;
    if ((parent as any)?.sty?.axis === Axis.stack) {
      size = `calc(${size} - ${context.parentStyle?.paddingLeft ?? `0px`} - ${
        context.parentStyle?.paddingRight ?? `0px`
      })`
    }
    return size ?? ``
  })()
  htmlElement.style.height = (() => {
    let size = exactHeight
    // axis === Axis.stack && height === -1
    //   ? maxChildHeight
    //   : exactHeight;
    if ((parent as any)?.sty?.axis === Axis.stack) {
      size = `calc(${size} - ${context.parentStyle?.paddingTop ?? `0px`} - ${
        context.parentStyle?.paddingBottom ?? `0px`
      })`
    }
    return size ?? ``
  })()
  htmlElement.style.minHeight = (() => {
    let size = hMin
    // axis === Axis.stack && height === -1
    //   ? maxChildHeight
    //   : hMin;
    if ((parent as any)?.sty?.axis === Axis.stack) {
      size = `calc(${size} - ${context.parentStyle?.paddingTop ?? `0px`} - ${
        context.parentStyle?.paddingBottom ?? `0px`
      })`
    }
    return size ?? ``
  })()
  htmlElement.style.maxHeight = (() => {
    let size = hMax
    // axis === Axis.stack && height === -1
    //   ? maxChildHeight
    //   : hMax;
    if ((parent as any)?.sty?.axis === Axis.stack) {
      size = `calc(${size} - ${context.parentStyle?.paddingTop ?? `0px`} - ${
        context.parentStyle?.paddingBottom ?? `0px`
      })`
    }
    return size ?? ``
  })()
  htmlElement.style.flexBasis =
    parentAxis === Axis.column
      ? isFlexSize(formattedHeight)
        ? `${formattedHeight.flex * 100}%`
        : heightGrows
        ? `100%`
        : ``
      : parentAxis === Axis.row
      ? isFlexSize(formattedWidth)
        ? `${formattedWidth.flex * 100}%`
        : widthGrows
        ? `100%`
        : ``
      : ``

  // Recompute growth
  // const newWidthGrows = isFlexSize(formattedWidth) && formattedWidth.flex > 0
  // htmlElement.classList.toggle(widthGrowsClassName, newWidthGrows)
  // const shouldUpdateWidthGrows = this._widthGrows !== newWidthGrows
  // const newHeightGrows = isFlexSize(formattedHeight) && formattedHeight.flex > 0
  // htmlElement.classList.toggle(heightGrowsClassName, newHeightGrows)
  // const shouldUpdateHeightGrows = this._heightGrows !== newHeightGrows
  // if (shouldUpdateWidthGrows || shouldUpdateHeightGrows) {
  //   if (exists(context.parentElement)) {
  //     if (context.parentElement instanceof Miwi_Box) {
  //       if (shouldUpdateWidthGrows) this._widthGrows = newWidthGrows
  //       if (shouldUpdateHeightGrows) this._heightGrows = newHeightGrows
  //       context.parentElement.thisIsAChildTogglingTheFactThatItGrows({
  //         widthGrows: shouldUpdateWidthGrows ? newWidthGrows : undefined,
  //         heightGrows: shouldUpdateHeightGrows ? newHeightGrows : undefined,
  //       })
  //     }
  //   }
  // }
})
