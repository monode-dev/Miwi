import './b-x/b-x'
import { Sty } from './b-x/b-x'
import { type JSX, type ParentProps } from 'solid-js'
import { compute, exists, sig, watchEffect } from './utils'
import { Overflow, _FlexAlign, applyLayoutStyle, AlignSingleAxis } from './b-x/BoxLayout'
import { applySizeStyle, heightGrowsClassName, widthGrowsClassName } from './b-x/BoxSize'
import { makePropParser } from './b-x/BoxUtils'
import { applyDecorationStyle } from './b-x/BoxDecoration'
import { applyTextStyle } from './b-x/BoxText'
import { applyInteractionStyle } from './b-x/BoxInteraction'

type BDashXProps = ParentProps & {
  sty?: Sty
} & JSX.DOMAttributes<HTMLDivElement>
declare module 'solid-js' {
  const element: HTMLElement
  namespace JSX {
    interface IntrinsicElements {
      'b-x': BDashXProps
    }
  }
}

export function grow(flex: number = 1) {
  return `${flex}f`
}

export type BoxProps = Partial<Sty> & ParentProps & JSX.DOMAttributes<HTMLDivElement>
export function Box(props: BoxProps) {
  const element = sig<HTMLElement | undefined>(undefined)
  const parentStyle = compute(() => {
    const parentElement = element.value?.parentElement
    if (!exists(parentElement)) return undefined
    return getComputedStyle(parentElement)
  })
  const parseProp: (...args: any[]) => any = makePropParser(props)
  const alignX = sig<AlignSingleAxis>(_FlexAlign.center)
  const overflowX = sig<Overflow>(Overflow.forceStretchParent)
  const widthGrows = sig(false)
  const heightGrows = sig(false)
  // TODO: Use Mutations observers to watch this base it on classes in the children
  const aChildsWidthGrows = compute(() => {
    if (!exists(element.value)) return false
    const childElements = element.value.children
    if (!exists(childElements)) return false
    const childElementsArray = Array.from(childElements)
    if (childElementsArray.length === 0) return false
    return childElementsArray.some(childElement =>
      childElement.classList.contains(widthGrowsClassName),
    )
  })
  const aChildsHeightGrows = compute(() => {
    if (!exists(element.value)) return false
    const childElements = element.value.children
    if (!exists(childElements)) return false
    const childElementsArray = Array.from(childElements)
    if (childElementsArray.length === 0) return false
    return childElementsArray.some(childElement =>
      childElement.classList.contains(heightGrowsClassName),
    )
  });

  // Compute Layout
  watchEffect(() => {
    if (!exists(element.value)) return
    const { alignX: newAlignX, overflowX: newOverflowX } = applyLayoutStyle(
      parseProp,
      element.value,
      {
        childCount: !exists(props.children)
          ? 0
          : Array.isArray(props.children)
          ? props.children.length
          : 1,
      },
    )
    alignX.value = newAlignX
    overflowX.value = newOverflowX
  })

  // Compute Size
  watchEffect(() => {
    if (!exists(element.value)) return
    const { widthGrows: newWidthGrows, heightGrows: newHeightGrows } = applySizeStyle(
      parseProp,
      element.value,
      {
        // TODO: Use mutation observers to observe this.
        // TODO: We will recompute size when anything changes, this is overkill.
        // Ideally we only care about parent axis, and only care about parent padding
        // If the parent is a stack. We should pass sigs in, so that we only watch what matters for a recompute.
        parentStyle: parentStyle.value,
        aChildsWidthGrows: aChildsWidthGrows.value,
        aChildsHeightGrows: aChildsHeightGrows.value,
      },
    )
    widthGrows.value = newWidthGrows
    heightGrows.value = newHeightGrows
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

  // TODO: Toggle element type based on "tag" prop.
  return (
    <div
      {...props}
      ref={el => (element.value = el)}
      classList={{
        [widthGrowsClassName]: widthGrows.value,
        [heightGrowsClassName]: heightGrows.value,
      }}
    ></div>
  )
}
