import {
  DecorationSty,
  computeBoxDecoration,
  mdColors as _mdColors,
} from "./BoxDecoration";
import {
  Axis as _Axis,
  defaultOverflowX,
  Overflow as _Overflow,
  Align as _Align,
  computeBoxLayout,
  LayoutSty,
} from "./BoxLayout";
import { exists, isString } from "./BoxUtils";
import {
  SizeSty,
  computeBoxSize,
  Size as _Size,
  sizeToCss as _sizeToCss,
} from "./BoxSize";
import { TextSty, computeTextStyle } from "./BoxText";
import { InteractionSty, computeBoxInteraction } from "./BoxInteraction";

export type _Sty = SizeSty &
  DecorationSty &
  LayoutSty &
  TextSty &
  InteractionSty & {
    shouldLog?: boolean;
  };
export type Sty = Partial<_Sty>;
export type Align = _Align;
export const Align = _Align;
export type Axis = _Axis;
export const Axis = _Axis;
export type Overflow = _Overflow;
export const Overflow = _Overflow;
export const mdColors = _mdColors;
export type Size = _Size;
export const sizeToCss = _sizeToCss;

// Cutom Element
export class Miwi_Box extends HTMLElement {
  private _parentObserver: MutationObserver;
  private _parentAxis: `row` | `column` = `column`; // TODO: Add `stack` option. Probably needs to be a class or something of the sort.
  private _parentPadTop: string = `0px`;
  private _parentPadRight: string = `0px`;
  private _parentPadBottom: string = `0px`;
  private _parentPadLeft: string = `0px`;
  private _selfObserver: MutationObserver;
  private _childrenObserver: MutationObserver;
  private _childCount: number = 0;
  private _anyChildIsABoxWithAGrowingWidth: boolean = false;
  private _anyChildIsABoxWithAGrowingHeight: boolean = false;

  static get observedAttributes() {
    return ["sty"];
  }
  private _sty: Sty = {};
  get sty() {
    return this._sty;
  }
  set sty(value) {
    this._sty = value;
    this.updateStyle();
  }

  private get _axis() {
    return this.sty.axis ?? _Axis.column;
  }

  computeParentStyle() {
    if (exists(this.parentElement)) {
      const computedParentStyle = getComputedStyle(this.parentElement);
      if (this._parentAxis !== computedParentStyle.flexDirection) {
        this._parentAxis = computedParentStyle.flexDirection as
          | `row`
          | `column`;
        this.updateStyle();
      }
      if (this._parentPadTop !== computedParentStyle.paddingTop) {
        this._parentPadTop = computedParentStyle.paddingTop;
        this.updateStyle();
      }
      if (this._parentPadRight !== computedParentStyle.paddingRight) {
        this._parentPadRight = computedParentStyle.paddingRight;
        this.updateStyle();
      }
      if (this._parentPadBottom !== computedParentStyle.paddingBottom) {
        this._parentPadBottom = computedParentStyle.paddingBottom;
        this.updateStyle();
      }
      if (this._parentPadLeft !== computedParentStyle.paddingLeft) {
        this._parentPadLeft = computedParentStyle.paddingLeft;
        this.updateStyle();
      }
    }
  }

  updateChildSizeGrows(): boolean {
    let shouldUpdateStyle = false;
    const childNodes = Array.from(this.childNodes);
    const childWidthGrows = childNodes.some((child) => {
      if (!(child instanceof Miwi_Box)) return false;
      const computedChildStyle = getComputedStyle(child);
      return this._axis === _Axis.row
        ? computedChildStyle.flexBasis !== "auto"
        : this._axis === _Axis.column
        ? child.style.width === `100%`
        : false;
    });
    if (this._anyChildIsABoxWithAGrowingWidth !== childWidthGrows) {
      this._anyChildIsABoxWithAGrowingWidth = childWidthGrows;
      shouldUpdateStyle = true;
    }
    const childHeightGrows = childNodes.some((child) => {
      if (!(child instanceof Miwi_Box)) return false;
      const computedChildStyle = getComputedStyle(child);
      return this._axis === _Axis.row
        ? child.style.height === `100%`
        : this._axis === _Axis.column
        ? computedChildStyle.flexBasis !== "auto"
        : false;
    });
    if (this._anyChildIsABoxWithAGrowingHeight !== childHeightGrows) {
      this._anyChildIsABoxWithAGrowingHeight = childHeightGrows;
      shouldUpdateStyle = true;
    }
    return shouldUpdateStyle;
  }

  updateChildList() {
    let shouldUpdateStyle = false;
    this._childrenObserver.disconnect();
    const childNodes = Array.from(this.childNodes);
    if (this._childCount !== childNodes.length) {
      this._childCount = childNodes.length;
      shouldUpdateStyle = true;
    }
    const shouldUpdateStyle2 = this.updateChildSizeGrows();
    if (shouldUpdateStyle || shouldUpdateStyle2) this.updateStyle();
    for (let i = 0; i < childNodes.length; i++) {
      const childNode = childNodes[i];
      this._childrenObserver.observe(childNode, { attributes: true });
    }
  }

  updateStyle() {
    const align = this.sty.align ?? _Align.center;

    const newStyle = {
      ...computeBoxSize(
        this.sty,
        this._anyChildIsABoxWithAGrowingWidth,
        this._anyChildIsABoxWithAGrowingHeight,
        this._parentAxis,
        this._parentPadTop,
        this._parentPadRight,
        this._parentPadBottom,
        this._parentPadLeft,
        this.sty.shouldLog,
      ),
      ...computeBoxLayout(
        this.sty,
        align,
        this._parentAxis,
        this._axis,
        this._childCount,
      ),
      ...computeBoxDecoration(this.sty),
      ...computeTextStyle(
        this.sty,
        isString(align) ? align : align.alignX,
        this.sty.overflowX ?? defaultOverflowX,
      ),
      ...computeBoxInteraction(this.sty),
    };

    for (const key of Object.keys(newStyle)) {
      if (newStyle[key] !== this.style[key as keyof CSSStyleDeclaration]) {
        (this.style as any)[key] = newStyle[key] ?? ``;
      }
    }

    this.classList.toggle(
      stackClassName,
      (this.sty.axis ?? _Axis.column) === _Axis.stack,
    );
    this.classList.toggle(
      nonStackClassName,
      (this.sty.axis ?? _Axis.column) !== _Axis.stack,
    );
  }

  constructor() {
    super();
    this._parentObserver = new MutationObserver((mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          this.computeParentStyle();
        }
      }
    });

    this._childrenObserver = new MutationObserver((mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style" &&
          mutation.target instanceof Element
        ) {
          const shouldUpdateStyle = this.updateChildSizeGrows();
          if (shouldUpdateStyle) this.updateStyle();
        }
      }
    });

    this._selfObserver = new MutationObserver((mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (mutation.type === "childList") {
          this.updateChildList();
        }
      }
    });
  }

  connectedCallback() {
    this.computeParentStyle();
    this.updateChildList();
    this.updateStyle();

    this._selfObserver.observe(this, { childList: true });

    if (exists(this.parentElement)) {
      this._parentObserver.observe(this.parentElement, { attributes: true });
    }
  }

  disconnectedCallback() {
    this._parentObserver.disconnect();
    this._selfObserver.disconnect();
    this._childrenObserver.disconnect();
    this._childCount = 0;
  }
}

const stackClassName = `b-x-stack`;
const nonStackClassName = `b-x-non-stack`;
const style = document.createElement(`style`);
style.textContent = `
.${stackClassName} > * {
  position: absolute;
}

.${nonStackClassName} > * {
  position: relative;
}`;

// b-x::before {
//   content: '';
//   position: absolute;
//   top: -1rem;
//   right: -1rem;
//   bottom: -1rem;
//   left: -1rem;
//   z-index: -1;
// }
document.body.appendChild(style);
customElements.define("b-x", Miwi_Box);
