import { computeBoxDecoration } from "./BoxDecoration";
import { Axis as _Axis, defaultOverflowX, Align as _Align, computeBoxLayout, } from "./BoxLayout";
import { exists, isString } from "./BoxUtils";
import { computeBoxSize } from "./BoxSize";
import { computeTextStyle } from "./BoxText";
import { computeBoxInteraction } from "./BoxInteraction";
export const Align = _Align;
export const Axis = _Axis;
// Cutom Element
export class Miwi_Box extends HTMLElement {
    _parentObserver;
    _parentAxis = `column`; // TODO: Add `stack` option. Probably needs to be a class or something of the sort.
    _parentPadTop = `0px`;
    _parentPadRight = `0px`;
    _parentPadBottom = `0px`;
    _parentPadLeft = `0px`;
    _selfObserver;
    _childrenObserver;
    _childCount = 0;
    _anyChildIsABoxWithAGrowingWidth = false;
    _anyChildIsABoxWithAGrowingHeight = false;
    static get observedAttributes() {
        return ["sty"];
    }
    _sty = {};
    get sty() {
        return this._sty;
    }
    set sty(value) {
        this._sty = value;
        this.updateStyle();
    }
    get _axis() {
        return this.sty.axis ?? _Axis.column;
    }
    computeParentStyle() {
        if (exists(this.parentElement)) {
            const computedParentStyle = getComputedStyle(this.parentElement);
            if (this._parentAxis !== computedParentStyle.flexDirection) {
                this._parentAxis = computedParentStyle.flexDirection;
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
    updateChildSizeGrows() {
        const childNodes = Array.from(this.childNodes);
        const childWidthGrows = childNodes.some((child) => {
            if (!(child instanceof Miwi_Box))
                return false;
            const computedChildStyle = getComputedStyle(child);
            return this._axis === _Axis.row
                ? computedChildStyle.flexBasis !== "auto"
                : this._axis === _Axis.column
                    ? child.style.width === `100%`
                    : false;
        });
        if (this._anyChildIsABoxWithAGrowingWidth !== childWidthGrows) {
            this._anyChildIsABoxWithAGrowingWidth = childWidthGrows;
            this.updateStyle();
        }
        const childHeightGrows = childNodes.some((child) => {
            if (!(child instanceof Miwi_Box))
                return false;
            const computedChildStyle = getComputedStyle(child);
            return this._axis === _Axis.row
                ? child.style.height === `100%`
                : this._axis === _Axis.column
                    ? computedChildStyle.flexBasis !== "auto"
                    : false;
        });
        if (this._anyChildIsABoxWithAGrowingHeight !== childHeightGrows) {
            this._anyChildIsABoxWithAGrowingHeight = childHeightGrows;
            this.updateStyle();
        }
    }
    updateChildList() {
        this._childrenObserver.disconnect();
        const childNodes = Array.from(this.childNodes);
        if (this._childCount !== childNodes.length) {
            this._childCount = childNodes.length;
            this.updateStyle();
        }
        this.updateChildSizeGrows();
        for (let i = 0; i < childNodes.length; i++) {
            const childNode = childNodes[i];
            this._childrenObserver.observe(childNode, { attributes: true });
        }
    }
    updateStyle() {
        const align = this.sty.align ?? _Align.center;
        const newStyle = {
            ...computeBoxSize(this.sty, this._anyChildIsABoxWithAGrowingWidth, this._anyChildIsABoxWithAGrowingHeight, this._parentAxis, this._parentPadTop, this._parentPadRight, this._parentPadBottom, this._parentPadLeft),
            ...computeBoxLayout(this.sty, align, this._parentAxis, this._axis, this._childCount),
            ...computeBoxDecoration(this.sty),
            ...computeTextStyle(this.sty, isString(align) ? align : align.alignX, this.sty.overflowX ?? defaultOverflowX),
            ...computeBoxInteraction(this.sty),
        };
        for (const key of Object.keys(newStyle)) {
            if (newStyle[key] !== this.style[key]) {
                this.style[key] = newStyle[key];
            }
        }
        this.classList.toggle(stackClassName, (this.sty.axis ?? _Axis.column) === _Axis.stack);
        this.classList.toggle(nonStackClassName, (this.sty.axis ?? _Axis.column) !== _Axis.stack);
    }
    constructor() {
        super();
        this._parentObserver = new MutationObserver((mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === "attributes" &&
                    mutation.attributeName === "style") {
                    this.computeParentStyle();
                }
            }
        });
        this._childrenObserver = new MutationObserver((mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === "attributes" &&
                    mutation.attributeName === "style" &&
                    mutation.target instanceof Element) {
                    this.updateChildSizeGrows();
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
