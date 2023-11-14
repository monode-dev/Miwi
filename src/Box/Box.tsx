import { onMount, type JSX, type ParentProps, onCleanup } from 'solid-js'
import { exists, sig, watchEffect } from '../utils'
import { makePropParser } from './BoxUtils'
import {
  Overflow,
  _FlexAlign,
  watchBoxLayout,
  AlignSingleAxis,
  LayoutSty,
  stackClassName,
  Axis,
} from './BoxLayout'
import { SizeSty, heightGrowsClassName, watchBoxSize, widthGrowsClassName } from './BoxSize'
import { DecorationSty, watchBoxDecoration } from './BoxDecoration'
import { TextSty, watchBoxText } from './BoxText'
import { InteractionSty, watchBoxInteraction } from './BoxInteraction'

export function grow(flex: number = 1) {
  return `${flex}f`
}

export type BoxProps = BoxStyleProps & ParentProps & JSX.DOMAttributes<HTMLDivElement>
export type BoxStyleProps = Partial<
  LayoutSty &
    SizeSty &
    DecorationSty &
    TextSty &
    InteractionSty & {
      overrideProps: Partial<BoxStyleProps>
      getElement: (e: HTMLElement) => void
      shouldLog?: boolean
    }
>
export function Box(props: BoxProps) {
  const element = sig<HTMLElement | undefined>(undefined)
  const parseProp: (...args: any[]) => any = makePropParser(props)

  onMount(() => {
    // Observe Parent
    const parentAxis = sig<Axis>(Axis.column)
    const parentPaddingLeft = sig(`0px`)
    const parentPaddingTop = sig(`0px`)
    const parentPaddingRight = sig(`0px`)
    const parentPaddingBottom = sig(`0px`)
    const parentObserver = new MutationObserver(() => {
      const parentElement = element.value!.parentElement
      if (!exists(parentElement)) return
      const parentStyle = getComputedStyle(parentElement)
      // Parent Axis
      const newParentAxis = parentElement.classList.contains(stackClassName)
        ? Axis.stack
        : parentStyle.flexDirection === Axis.column
        ? Axis.column
        : Axis.row
      if (parentAxis.value !== newParentAxis) {
        parentAxis.value = newParentAxis
      }
      // Parent Padding
      const newParentPaddingLeft = parentStyle.paddingLeft
      if (parentPaddingLeft.value !== newParentPaddingLeft) {
        parentPaddingLeft.value = newParentPaddingLeft
      }
      const newParentPaddingTop = parentStyle.paddingTop
      if (parentPaddingTop.value !== newParentPaddingTop) {
        parentPaddingTop.value = newParentPaddingTop
      }
      const newParentPaddingRight = parentStyle.paddingRight
      if (parentPaddingRight.value !== newParentPaddingRight) {
        parentPaddingRight.value = newParentPaddingRight
      }
      const newParentPaddingBottom = parentStyle.paddingBottom
      if (parentPaddingBottom.value !== newParentPaddingBottom) {
        parentPaddingBottom.value = newParentPaddingBottom
      }
    })
    onCleanup(() => parentObserver.disconnect())

    // Observe Children
    // TODO: Use Mutations observers to watch this base it on classes in the children
    const aChildsWidthGrows = sig(false)
    const aChildsHeightGrows = sig(false)
    const hasMoreThanOneChild = sig(false)
    const childObserver = new MutationObserver(() => {
      const childElements = element.value!.children
      if (!exists(childElements)) return
      const childElementsArray = Array.from(childElements)
      const newHasMoreThanOneChild = childElementsArray.length > 1
      if (hasMoreThanOneChild.value !== newHasMoreThanOneChild) {
        hasMoreThanOneChild.value = newHasMoreThanOneChild
      }
    })
    onCleanup(() => childObserver.disconnect())
    ;(() => {
      const childElements = element.value!.children
      if (!exists(childElements)) return
      const childElementsArray = Array.from(childElements)
      if (childElementsArray.length === 0) return
      aChildsHeightGrows.value = childElementsArray.some(childElement =>
        childElement.classList.contains(heightGrowsClassName),
      )
      aChildsWidthGrows.value = childElementsArray.some(childElement =>
        childElement.classList.contains(widthGrowsClassName),
      )
    })()

    // Compute Layout
    const alignX = sig<AlignSingleAxis>(_FlexAlign.center)
    const overflowX = sig<Overflow>(Overflow.forceStretchParent)
    watchBoxLayout(parseProp, element, { hasMoreThanOneChild, alignX, overflowX })

    // Compute Size
    watchBoxSize(parseProp, element, {
      parentAxis,
      parentPaddingLeft,
      parentPaddingRight,
      parentPaddingTop,
      parentPaddingBottom,
      aChildsWidthGrows,
      aChildsHeightGrows,
    })

    // Compute Decoration
    watchBoxDecoration(parseProp, element)

    // Compute Text Styling
    watchBoxText(parseProp, element, {
      alignX,
      overflowX,
    })

    // Computer Interactivity
    watchBoxInteraction(parseProp, element)

    // Notify element getters
    watchEffect(() => {
      if (!exists(element.value)) return
      const elementGetters: any[] = parseProp(`getElement`, true)
      elementGetters.forEach(getter => {
        if (typeof getter !== `function`) return
        getter(element.value)
      })
    })
  })

  // TODO: Toggle element type based on "tag" prop.
  return <div {...props} ref={el => (element.value = el)} />
}
