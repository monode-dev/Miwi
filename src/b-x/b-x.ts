import { DecorationSty, applyDecorationStyle } from './BoxDecoration'
import { LayoutSty, applyLayoutStyle } from './BoxLayout'
import { exists, makePropParser } from './BoxUtils'
import { SizeSty, widthGrowsClassName, heightGrowsClassName, applySizeStyle } from './BoxSize'
import { TextSty, applyTextStyle } from './BoxText'
import { InteractionSty, applyInteractionStyle } from './BoxInteraction'

export type Sty = Partial<
  SizeSty &
    DecorationSty &
    LayoutSty &
    TextSty &
    InteractionSty & {
      overrideProps: Partial<Sty>
      shouldLog?: boolean
    }
>

// Custom Element
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
        computedParentStyle.paddingTop !== this._parentStyle.paddingTop ||
        computedParentStyle.paddingRight !== this._parentStyle.paddingRight ||
        computedParentStyle.paddingBottom !== this._parentStyle.paddingBottom ||
        computedParentStyle.paddingLeft !== this._parentStyle.paddingLeft
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
    const { someChildWidthGrows, someChildHeightGrows } = this.computeSomeChildGrows()
    const parseProp: (...args: any[]) => any = makePropParser(this.sty)
    const { alignX, overflowX } = applyLayoutStyle(parseProp, this, {
      childCount: this._childCount,
    })
    const { widthGrows, heightGrows } = applySizeStyle(parseProp, this, {
      parentStyle: this._parentStyle,
      aChildsWidthGrows: someChildWidthGrows,
      aChildsHeightGrows: someChildHeightGrows,
    })
    applyDecorationStyle(parseProp, this)
    applyTextStyle(parseProp, this, {
      alignX,
      overflowX,
    })
    applyInteractionStyle(parseProp, this)

    // Recompute growth
    // TODO: Eventually Handle this in applySizeStyle
    this.classList.toggle(widthGrowsClassName, widthGrows)
    const shouldUpdateWidthGrows = this._widthGrows !== widthGrows
    this.classList.toggle(heightGrowsClassName, heightGrows)
    const shouldUpdateHeightGrows = this._heightGrows !== heightGrows
    if (shouldUpdateWidthGrows || shouldUpdateHeightGrows) {
      if (exists(this.parentElement)) {
        if (this.parentElement instanceof Miwi_Box) {
          if (shouldUpdateWidthGrows) this._widthGrows = widthGrows
          if (shouldUpdateHeightGrows) this._heightGrows = heightGrows
          this.parentElement.thisIsAChildTogglingTheFactThatItGrows({
            widthGrows: shouldUpdateWidthGrows ? widthGrows : undefined,
            heightGrows: shouldUpdateHeightGrows ? heightGrows : undefined,
          })
        }
      }
    }
  }

  constructor() {
    super()
    this.classList.add(`b-x`)
    this._parentObserver = new MutationObserver(mutationsList => {
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

customElements.define('b-x', Miwi_Box)
