import './b-x/b-x'
import { Sty } from './b-x/b-x'
import { onMount, type JSX, type ParentProps } from 'solid-js'
import { exists, sig, watchEffect } from './utils'
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
  if (props.shouldLog) console.log('Box', props)
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
    // watchEffect(() => {
    const { alignX: newAlignX, overflowX: newOverflowX } = applyLayoutStyle(
      parseProp,
      element.value!,
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
    // })
    //   // Compute Size
    //   // watchEffect(() => {
    //   applySizeStyle(parseProp, element.value!, {
    //     // TODO: Use mutation observers to observe this.
    //     // TODO: We will recompute size when anything changes, this is overkill.
    //     // Ideally we only care about parent axis, and only care about parent padding
    //     // If the parent is a stack. We should pass sigs in, so that we only watch what matters for a recompute.
    //     parentStyle: parentStyle.value,
    //     aChildsWidthGrows: aChildsWidthGrows.value,
    //     aChildsHeightGrows: aChildsHeightGrows.value,
    //   })
    //   // })
    //   // Compute Decoration
    //   // watchEffect(() => {
    //   applyDecorationStyle(parseProp, element.value!)
    //   // })
    //   // Compute Text Styling
    //   // watchEffect(() => {
    //   applyTextStyle(parseProp, element.value!, {
    //     alignX: alignX.value,
    //     overflowX: overflowX.value,
    //   })
    //   // })
    //   // Computer Interactivity
    //   // watchEffect(() => {
    //   applyInteractionStyle(parseProp, element.value!)
    //   // })
  })

  // TODO: Toggle element type based on "tag" prop.
  return <div {...props} ref={el => (element.value = el)} />
}
