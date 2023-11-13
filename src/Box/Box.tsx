import { onMount, type JSX, type ParentProps } from 'solid-js'
import { exists, sig, watchEffect } from '../utils'
import { makePropParser } from './BoxUtils'
import { Overflow, _FlexAlign, applyLayoutStyle, AlignSingleAxis, LayoutSty } from './BoxLayout'
import { SizeSty, applySizeStyle, heightGrowsClassName, widthGrowsClassName } from './BoxSize'
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
    watchEffect(() => {
      if (!exists(element.value)) return
      const { alignX: newAlignX, overflowX: newOverflowX } = applyLayoutStyle(
        parseProp,
        element.value,
        {
          // TODO: Use mutation observers to observe this, or see if we can do it with a CSS class
          hasMoreThanOneChild: element.value.children.length > 1,
        },
      )
      alignX.value = newAlignX
      overflowX.value = newOverflowX
    })

    // Compute Size
    watchEffect(() => {
      if (!exists(element.value)) return
      applySizeStyle(parseProp, element.value, {
        // TODO: Use mutation observers to observe this.
        // TODO: We will recompute size when anything changes, this is overkill.
        // Ideally we only care about parent axis, and only care about parent padding
        // If the parent is a stack. We should pass sigs in, so that we only watch what matters for a recompute.
        parentStyle: parentStyle.value,
        aChildsWidthGrows: aChildsWidthGrows.value,
        aChildsHeightGrows: aChildsHeightGrows.value,
      })
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
      getter(element.value)
    })
  })

  // TODO: Toggle element type based on "tag" prop.
  return <div {...props} ref={el => (element.value = el)} />
}
