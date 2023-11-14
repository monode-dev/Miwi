import { onMount, type JSX, type ParentProps, onCleanup } from 'solid-js'
import { Sig, exists, sig, watchEffect } from '../utils'
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

// SECTION: Box Component
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
    _watchParent({
      element,
      parentAxis,
      parentPaddingLeft,
      parentPaddingTop,
      parentPaddingRight,
      parentPaddingBottom,
    })

    // Observe Children
    const aChildsWidthGrows = sig(false)
    const aChildsHeightGrows = sig(false)
    const hasMoreThanOneChild = sig(false)
    _watchChildren({ element, hasMoreThanOneChild, aChildsWidthGrows, aChildsHeightGrows })

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

/** SECTION: Helper function to watch parent for Box */
function _watchParent(props: {
  element: Sig<HTMLElement | undefined>
  parentAxis: Sig<Axis>
  parentPaddingLeft: Sig<string>
  parentPaddingTop: Sig<string>
  parentPaddingRight: Sig<string>
  parentPaddingBottom: Sig<string>
}) {
  const {
    element,
    parentAxis,
    parentPaddingLeft,
    parentPaddingTop,
    parentPaddingRight,
    parentPaddingBottom,
  } = props
  // TODO: We might ned to watch element if there is any chance of it becoming null at some point.
  if (exists(element.value) && exists(element.value.parentElement)) {
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
    parentObserver.observe(element.value.parentElement, {
      attributes: true,
      attributeFilter: [`style`, `class`],
    })
    onCleanup(() => parentObserver.disconnect())
  }
}

/** SECTION: Helper function to watch children for Box */
function _watchChildren(props: {
  element: Sig<HTMLElement | undefined>
  hasMoreThanOneChild: Sig<boolean>
  aChildsWidthGrows: Sig<boolean>
  aChildsHeightGrows: Sig<boolean>
}) {
  const { element, hasMoreThanOneChild, aChildsWidthGrows, aChildsHeightGrows } = props
  const activeChildObservers: MutationObserver[] = []
  const childListObserver = new MutationObserver(() => {
    if (!exists(element.value)) return
    const childElementsArray = Array.from(element.value.childNodes)
    // Has More Than One Child
    const newHasMoreThanOneChild = childElementsArray.length > 1
    if (hasMoreThanOneChild.value !== newHasMoreThanOneChild) {
      hasMoreThanOneChild.value = newHasMoreThanOneChild
    }
    // A Child Size Grows
    activeChildObservers.forEach(observer => observer.disconnect())
    childElementsArray.forEach(child => {
      const childObserver = new MutationObserver(() => {
        if (!exists(element.value)) return
        const childElementsArray = Array.from(element.value.childNodes).filter(
          child => child instanceof HTMLElement,
        ) as HTMLElement[]
        const newAChildsWidthGrows = childElementsArray.some(childElement =>
          childElement.classList.contains(widthGrowsClassName),
        )
        if (aChildsWidthGrows.value !== newAChildsWidthGrows) {
          aChildsWidthGrows.value = newAChildsWidthGrows
        }
        const newAChildsHeightGrows = childElementsArray.some(childElement =>
          childElement.classList.contains(heightGrowsClassName),
        )
        if (aChildsHeightGrows.value !== newAChildsHeightGrows) {
          aChildsHeightGrows.value = newAChildsHeightGrows
        }
      })
      childObserver.observe(child, {
        attributes: true,
        attributeFilter: [`class`],
      })
      activeChildObservers.push(childObserver)
    })
  })
  childListObserver.observe(element.value!, {
    childList: true,
  })
  onCleanup(() => {
    childListObserver.disconnect()
    activeChildObservers.forEach(observer => observer.disconnect())
  })
}
