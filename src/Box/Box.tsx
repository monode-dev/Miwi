import { type JSX, type ParentProps, onCleanup } from 'solid-js'
import { Sig, exists, sig, watchEffect } from '../utils'
import { makePropParser, observeElement } from './BoxUtils'
import { _FlexAlign, watchBoxLayout, LayoutSty, stackClassName, Axis } from './BoxLayout'
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
      overrideOverrides: Partial<Omit<BoxStyleProps, `overrideProps` | `overrideOverrides`>>
      getElement: (e: HTMLElement) => void
      shouldLog?: boolean
    }
>
export function Box(props: BoxProps) {
  const parseProp: (...args: any[]) => any = makePropParser(props)
  // TODO: Eventually we want a "tag" prop, and to use document.createElement here.
  const element = sig<HTMLElement | undefined>(undefined)

  // Observe Parent
  const {
    parentAxis,
    parentPaddingLeft,
    parentPaddingTop,
    parentPaddingRight,
    parentPaddingBottom,
  } = _watchParent(element)

  // Observe Children
  const { hasMoreThanOneChild, aChildsWidthGrows, aChildsHeightGrows } = _watchChildren(element)

  // Compute Layout
  const isScrollable = sig(false)
  const { alignX, overflowX } = watchBoxLayout(parseProp, element, {
    hasMoreThanOneChild,
    isScrollable,
  })
  /** TODO: provide a second element sig for a contentWrapperElement. This will be the same as
   * element, but can be changed by watchLayout if a content wrapper is introduced. */

  // Compute Size
  watchBoxSize(parseProp, element, {
    parentAxis,
    parentPaddingLeft,
    parentPaddingRight,
    parentPaddingTop,
    parentPaddingBottom,
    aChildsWidthGrows,
    aChildsHeightGrows,
    shouldLog: parseProp(`shouldLog`),
  })

  // Compute Decoration
  watchBoxDecoration(parseProp, element)

  // Compute Text Styling
  watchBoxText(parseProp, element, {
    alignX,
    overflowX,
  })

  // Computer Interactivity
  watchBoxInteraction(parseProp, element, { isScrollable })

  // TODO: Toggle element type based on "tag" prop.
  return (
    <div
      {...props}
      ref={el => {
        element.value = el
        // Notify element getters
        parseProp(`getElement`, true).forEach((getter: any) => {
          if (typeof getter !== `function`) return
          getter(element.value)
        })
      }}
    />
  )
}

/** SECTION: Helper function to watch parent for Box */
function _watchParent(element: Sig<HTMLElement | undefined>) {
  const parentAxis = sig<Axis>(Axis.column)
  const parentPaddingLeft = sig(`0px`)
  const parentPaddingTop = sig(`0px`)
  const parentPaddingRight = sig(`0px`)
  const parentPaddingBottom = sig(`0px`)
  watchEffect(() => {
    if (!exists(element.value)) return
    if (!exists(element.value.parentElement)) return
    const parentObserver = observeElement(
      element.value.parentElement,
      {
        attributes: true,
        attributeFilter: [`style`, `class`],
      },
      () => {
        if (!exists(element.value)) return
        const parentElement = element.value.parentElement
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
      },
    )
    onCleanup(() => parentObserver.disconnect())
  })

  return {
    parentAxis,
    parentPaddingLeft,
    parentPaddingTop,
    parentPaddingRight,
    parentPaddingBottom,
  }
}

/** SECTION: Helper function to watch children for Box */
function _watchChildren(element: Sig<HTMLElement | undefined>) {
  const aChildsWidthGrows = sig(false)
  const aChildsHeightGrows = sig(false)
  const hasMoreThanOneChild = sig(false)
  const activeChildObservers: MutationObserver[] = []
  watchEffect(() => {
    if (!exists(element.value)) return
    const childListObserver = observeElement(
      element.value,
      {
        childList: true,
      },
      () => {
        if (!exists(element.value)) return
        const childElementsArray = Array.from(element.value.childNodes).filter(
          child => child instanceof HTMLElement,
        ) as HTMLElement[]
        // Has More Than One Child
        const newHasMoreThanOneChild = childElementsArray.length > 1
        if (hasMoreThanOneChild.value !== newHasMoreThanOneChild) {
          hasMoreThanOneChild.value = newHasMoreThanOneChild
        }
        // A Child Size Grows
        activeChildObservers.forEach(observer => observer.disconnect())
        childElementsArray.forEach(child => {
          activeChildObservers.push(
            observeElement(
              child,
              {
                attributes: true,
                attributeFilter: [`class`],
              },
              () => {
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
              },
            ),
          )
        })
      },
    )
    onCleanup(() => {
      childListObserver.disconnect()
      activeChildObservers.forEach(observer => observer.disconnect())
    })
  })
  return { element, hasMoreThanOneChild, aChildsWidthGrows, aChildsHeightGrows }
}
