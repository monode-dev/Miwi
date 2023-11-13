import { onMount, type JSX, type ParentProps } from 'solid-js'
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
import { applyDecorationStyle, DecorationSty } from './BoxDecoration'
import { TextSty, applyTextStyle } from './BoxText'
import { InteractionSty, applyInteractionStyle } from './BoxInteraction'

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
    if (!exists(element.value)) return
    const parentStyle = sig<CSSStyleDeclaration | undefined>(undefined)
    ;(() => {
      const parentElement = element.value.parentElement
      if (!exists(parentElement)) return
      parentStyle.value = getComputedStyle(parentElement)
    })()
    // TODO: Use Mutations observers to watch this base it on classes in the children
    const aChildsWidthGrows = sig(false)
    const aChildsHeightGrows = sig(false)
    ;(() => {
      const childElements = element.value.children
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
    watchBoxLayout(parseProp, element, {
      // TODO: Use mutation observers to observe this, or see if we can do it with a CSS class
      hasMoreThanOneChild: sig(element.value.children.length > 1),
      alignX,
      overflowX,
    })

    // Compute Size
    watchBoxSize(parseProp, element, {
      // TODO: Use mutation observers to observe this.
      // TODO: We will recompute size when anything changes, this is overkill.
      // Ideally we only care about parent axis, and only care about parent padding
      // If the parent is a stack. We should pass sigs in, so that we only watch what matters for a recompute.
      parentAxis: sig(
        element.value.parentElement?.classList.contains(stackClassName) ?? false
          ? Axis.stack
          : parentStyle.value?.flexDirection === Axis.column
          ? Axis.column
          : Axis.row,
      ),
      parentPaddingLeft: sig(parentStyle.value?.paddingLeft ?? `0px`),
      parentPaddingRight: sig(parentStyle.value?.paddingRight ?? `0px`),
      parentPaddingTop: sig(parentStyle.value?.paddingTop ?? `0px`),
      parentPaddingBottom: sig(parentStyle.value?.paddingBottom ?? `0px`),
      aChildsWidthGrows,
      aChildsHeightGrows,
    })

    // Compute Decoration
    watchEffect(() => {
      if (!exists(element.value)) return
      applyDecorationStyle(parseProp, element.value)
    })

    // Compute Text Styling
    watchEffect(() => {
      if (!exists(element.value)) return
      applyTextStyle(parseProp, element.value, {
        alignX: alignX.value,
        overflowX: overflowX.value,
      })
    })

    // Computer Interactivity
    watchEffect(() => {
      if (!exists(element.value)) return
      applyInteractionStyle(parseProp, element.value)
    })

    // Notify element getters
    const elementGetters: any[] = parseProp(`getElement`, true)
    elementGetters.forEach(getter => {
      if (typeof getter !== `function`) return
      getter(element.value)
    })
  })

  // TODO: Toggle element type based on "tag" prop.
  return <div {...props} ref={el => (element.value = el)} />
}
