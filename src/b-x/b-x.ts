import { DecorationSty, decorationStyler, mdColors as _mdColors } from './BoxDecoration'
import {
  Axis as _Axis,
  defaultOverflowX,
  Overflow as _Overflow,
  Align as _Align,
  LayoutSty,
} from './BoxLayout'
import { CssProps, exists, isString, sizeToCss as _sizeToCss } from './BoxUtils'
import { SizeSty, Size as _Size, isFlexSize, formatRawSize } from './BoxSize'
import { TextSty, computeTextStyle } from './BoxText'
import { InteractionSty, computeBoxInteraction } from './BoxInteraction'

export type _Sty = SizeSty &
  DecorationSty &
  LayoutSty &
  TextSty &
  InteractionSty & {
    shouldLog?: boolean
  }
export type Sty = Partial<_Sty>
export type Align = _Align
export const Align = _Align
export type Axis = _Axis
export const Axis = _Axis
export type Overflow = _Overflow
export const Overflow = _Overflow
export const mdColors = _mdColors
export type Size = _Size
export const sizeToCss = _sizeToCss

function applyStylePart(selfStyle: CSSStyleDeclaration, updates: CssProps) {
  for (const key of Object.keys(updates)) {
    if (key.startsWith(`--`)) {
      selfStyle.setProperty(key, (updates[key] ?? ``).toString())
    } else if (updates[key] !== selfStyle[key as keyof CSSStyleDeclaration]) {
      ;(selfStyle as any)[key] = updates[key] ?? ``
    }
  }
}

// function applyStylePart(selfStyle: CSSStyleDeclaration, updates: CssProps) {
//   for (const key of Object.keys(updates)) {
//     if (updates[key] !== selfStyle.getPropertyValue(key)) {
//       selfStyle.setProperty(key, (updates[key] ?? ``).toString())
//     }
//   }
// }

// Cutom Element
export class Miwi_Box extends HTMLElement {
  private _parentObserver: MutationObserver
  private _parentStyle: CSSStyleDeclaration | undefined = undefined
  // private _selfObserver: MutationObserver;
  // private _childrenObserver: MutationObserver;
  private _childCount: number = 0
  // private _anyChildIsABoxWithAGrowingWidth: boolean = false;
  // private _anyChildIsABoxWithAGrowingHeight: boolean = false;

  static get observedAttributes() {
    return ['sty']
  }
  private _sty: Sty = {}
  get sty() {
    return this._sty
  }
  set sty(value) {
    this._sty = value
    this.updateStyle()
  }

  private _widthGrows: boolean | undefined = undefined
  private _heightGrows: boolean | undefined = undefined
  private _numChildrenWithGrowingWidths: number = 0
  private _numChildrenWithGrowingHeights: number = 0
  private get _someChildWidthGrows() {
    return this._numChildrenWithGrowingWidths > 0
  }
  private get _someChildHeightGrows() {
    return this._numChildrenWithGrowingHeights > 0
  }
  public thisIsAChildTogglingTheFactThatItGrows(props: {
    widthGrows?: boolean
    heightGrows?: boolean
  }) {
    let shouldUpdateStyle = false
    if (exists(props.widthGrows)) {
      const oldSomeChildGrows = this._someChildWidthGrows
      this._numChildrenWithGrowingWidths += props.widthGrows ? 1 : -1
      if (oldSomeChildGrows !== this._someChildWidthGrows) {
        shouldUpdateStyle = true
      }
    }
    if (exists(props.heightGrows)) {
      const oldSomeChildGrows = this._someChildHeightGrows
      this._numChildrenWithGrowingHeights += props.heightGrows ? 1 : -1
      if (oldSomeChildGrows !== this._someChildHeightGrows) {
        shouldUpdateStyle = true
      }
    }
    if (shouldUpdateStyle) this.updateStyle()
  }

  computeParentStyle() {
    let shouldUpdateStyle = false
    if (exists(this.parentElement)) {
      const computedParentStyle = getComputedStyle(this.parentElement)
      shouldUpdateStyle =
        computedParentStyle.flexDirection !== this._parentStyle?.flexDirection ||
        computedParentStyle.paddingTop !== this._parentStyle?.paddingTop ||
        computedParentStyle.paddingRight !== this._parentStyle?.paddingRight ||
        computedParentStyle.paddingBottom !== this._parentStyle?.paddingBottom ||
        computedParentStyle.paddingLeft !== this._parentStyle?.paddingLeft
      if (shouldUpdateStyle) this._parentStyle = computedParentStyle
    }
    return shouldUpdateStyle
  }

  computeSomeChildGrows(): {
    someChildWidthGrows: boolean
    someChildHeightGrows: boolean
  } {
    const result = {
      someChildWidthGrows: false,
      someChildHeightGrows: false,
    }
    for (
      let i = 0;
      i < this.children.length && (!result.someChildWidthGrows || !result.someChildHeightGrows);
      i++
    ) {
      const child = this.children.item(i)
      if (!(child instanceof Miwi_Box)) continue
      if (child.classList.contains(widthGrowsClassName)) {
        result.someChildWidthGrows = true
      }
      if (child.classList.contains(heightGrowsClassName)) {
        result.someChildHeightGrows = true
      }
    }
    return result
  }
  updateStyle() {
    const align = this.sty.align ?? _Align.center
    const { someChildWidthGrows, someChildHeightGrows } = this.computeSomeChildGrows()
    const formattedWidth = formatRawSize({
      someChildGrows: someChildWidthGrows,
      size: this.sty.width,
    })
    const formattedHeight = formatRawSize({
      someChildGrows: someChildHeightGrows,
      size: this.sty.height,
    })

    decorationStyler.applyStyle(this.sty, this, {
      parentStyle: this._parentStyle,
      childCount: this._childCount,
      aChildsWidthGrows: someChildWidthGrows,
      aChildsHeightGrows: someChildHeightGrows,
    })
    applyStylePart(
      this.style,
      computeTextStyle(
        this.sty,
        isString(align) ? align : align.alignX,
        this.sty.overflowX ?? defaultOverflowX,
      ),
    )
    const interactionConfig = computeBoxInteraction(this.sty)
    this.onmouseenter = interactionConfig.elementAttributes.onMouseEnter ?? null
    this.onmouseleave = interactionConfig.elementAttributes.onMouseLeave ?? null
    applyStylePart(this.style, interactionConfig.cssProps)

    this.classList.toggle(stackClassName, (this.sty.axis ?? _Axis.column) === _Axis.stack)
    this.classList.toggle(nonStackClassName, (this.sty.axis ?? _Axis.column) !== _Axis.stack)
    this.classList.toggle(bonusTouchAreaClassName, this.sty.bonusTouchArea ?? false)

    // Recompute growth
    const newWidthGrows = isFlexSize(formattedWidth) && formattedWidth.flex > 0
    this.classList.toggle(widthGrowsClassName, newWidthGrows)
    const shouldUpdateWidthGrows = this._widthGrows !== newWidthGrows
    const newHeightGrows = isFlexSize(formattedHeight) && formattedHeight.flex > 0
    this.classList.toggle(heightGrowsClassName, newHeightGrows)
    const shouldUpdateHeightGrows = this._heightGrows !== newHeightGrows
    if (shouldUpdateWidthGrows || shouldUpdateHeightGrows) {
      if (exists(this.parentElement)) {
        if (this.parentElement instanceof Miwi_Box) {
          if (shouldUpdateWidthGrows) this._widthGrows = newWidthGrows
          if (shouldUpdateHeightGrows) this._heightGrows = newHeightGrows
          this.parentElement.thisIsAChildTogglingTheFactThatItGrows({
            widthGrows: shouldUpdateWidthGrows ? newWidthGrows : undefined,
            heightGrows: shouldUpdateHeightGrows ? newHeightGrows : undefined,
          })
        }
      }
    }
  }

  constructor() {
    super()
    this.classList.add(`b-x`)
    this._parentObserver = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const shouldUpdateStyle = this.computeParentStyle()
          if (shouldUpdateStyle) this.updateStyle()
          return
        }
      }
    })
  }

  connectedCallback() {
    this.computeParentStyle()
    this.updateStyle()

    if (exists(this.parentElement)) {
      this._parentObserver.observe(this.parentElement, { attributes: true })
    }
  }

  disconnectedCallback() {
    this._parentObserver.disconnect()
    this._childCount = 0
    if (this.parentElement instanceof Miwi_Box) {
      this.parentElement.thisIsAChildTogglingTheFactThatItGrows({
        widthGrows: false,
        heightGrows: false,
      })
    }
  }
}

const widthGrowsClassName = `b-x-width-grows`
const heightGrowsClassName = `b-x-height-grows`
const stackClassName = `b-x-stack`
const nonStackClassName = `b-x-non-stack`
const bonusTouchAreaClassName = `b-x-bonus-touch-area`
const style = document.createElement(`style`)
style.textContent = `
.${stackClassName} > * {
  position: absolute;
}

.${nonStackClassName} > * {
  position: relative;
}

.${bonusTouchAreaClassName}::before {
  content: '';
  position: absolute;
  top: -1rem;
  right: -1rem;
  bottom: -1rem;
  left: -1rem;
  z-index: -1;
}
`
document.body.appendChild(style)
customElements.define('b-x', Miwi_Box)
