import { computeBoxDecoration, mdColors as _mdColors, } from "./BoxDecoration";
import { Axis as _Axis, defaultOverflowX, Overflow as _Overflow, Align as _Align, computeBoxLayout, } from "./BoxLayout";
import { exists, isString } from "./BoxUtils";
import { computeBoxSize, sizeToCss as _sizeToCss, isFlexSize, formatRawSize, } from "./BoxSize";
import { computeTextStyle } from "./BoxText";
import { computeBoxInteraction } from "./BoxInteraction";
export const Align = _Align;
export const Axis = _Axis;
export const Overflow = _Overflow;
export const mdColors = _mdColors;
export const sizeToCss = _sizeToCss;
function applyStylePart(selfStyle, updates) {
    for (const key of Object.keys(updates)) {
        if (updates[key] !== selfStyle[key]) {
            selfStyle[key] = updates[key] ?? ``;
        }
    }
}
// Cutom Element
export class Miwi_Box extends HTMLElement {
    _parentObserver;
    _parentAxis = `column`; // TODO: Add `stack` option. Probably needs to be a class or something of the sort.
    _parentPadTop = `0px`;
    _parentPadRight = `0px`;
    _parentPadBottom = `0px`;
    _parentPadLeft = `0px`;
    // private _selfObserver: MutationObserver;
    // private _childrenObserver: MutationObserver;
    _childCount = 0;
    // private _anyChildIsABoxWithAGrowingWidth: boolean = false;
    // private _anyChildIsABoxWithAGrowingHeight: boolean = false;
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
    _widthGrows = undefined;
    _heightGrows = undefined;
    _numChildrenWithGrowingWidths = 0;
    _numChildrenWithGrowingHeights = 0;
    get _someChildWidthGrows() {
        return this._numChildrenWithGrowingWidths > 0;
    }
    get _someChildHeightGrows() {
        return this._numChildrenWithGrowingHeights > 0;
    }
    thisIsAChildTogglingTheFactThatItGrows(props) {
        let shouldUpdateStyle = false;
        if (exists(props.widthGrows)) {
            const oldSomeChildGrows = this._someChildWidthGrows;
            this._numChildrenWithGrowingWidths += props.widthGrows ? 1 : -1;
            if (oldSomeChildGrows !== this._someChildWidthGrows) {
                shouldUpdateStyle = true;
            }
        }
        if (exists(props.heightGrows)) {
            const oldSomeChildGrows = this._someChildHeightGrows;
            this._numChildrenWithGrowingHeights += props.heightGrows ? 1 : -1;
            if (oldSomeChildGrows !== this._someChildHeightGrows) {
                shouldUpdateStyle = true;
            }
        }
        if (shouldUpdateStyle)
            this.updateStyle();
    }
    computeParentStyle() {
        let shouldUpdateStyle = false;
        if (exists(this.parentElement)) {
            const computedParentStyle = getComputedStyle(this.parentElement);
            if (this._parentAxis !== computedParentStyle.flexDirection) {
                this._parentAxis = computedParentStyle.flexDirection;
                shouldUpdateStyle = true;
            }
            if (this._parentPadTop !== computedParentStyle.paddingTop) {
                this._parentPadTop = computedParentStyle.paddingTop;
                shouldUpdateStyle = true;
            }
            if (this._parentPadRight !== computedParentStyle.paddingRight) {
                this._parentPadRight = computedParentStyle.paddingRight;
                shouldUpdateStyle = true;
            }
            if (this._parentPadBottom !== computedParentStyle.paddingBottom) {
                this._parentPadBottom = computedParentStyle.paddingBottom;
                shouldUpdateStyle = true;
            }
            if (this._parentPadLeft !== computedParentStyle.paddingLeft) {
                this._parentPadLeft = computedParentStyle.paddingLeft;
                shouldUpdateStyle = true;
            }
        }
        return shouldUpdateStyle;
    }
    computeSomeChildGrows() {
        const result = {
            someChildWidthGrows: false,
            someChildHeightGrows: false,
        };
        for (let i = 0; i < this.children.length &&
            (!result.someChildWidthGrows || !result.someChildWidthGrows); i++) {
            const child = this.children.item(i);
            if (!(child instanceof Miwi_Box))
                continue;
            if (child.classList.contains(widthGrowsClassName)) {
                result.someChildWidthGrows = true;
            }
            if (child.classList.contains(heightGrowsClassName)) {
                result.someChildHeightGrows = true;
            }
        }
        return result;
    }
    updateStyle() {
        const align = this.sty.align ?? _Align.center;
        const { someChildWidthGrows, someChildHeightGrows } = this.computeSomeChildGrows();
        const formattedWidth = formatRawSize({
            someChildGrows: someChildWidthGrows,
            size: this.sty.width,
        });
        const formattedHeight = formatRawSize({
            someChildGrows: someChildHeightGrows,
            size: this.sty.height,
        });
        applyStylePart(this.style, computeBoxSize(this.sty, formattedWidth, formattedHeight, this._parentAxis, this._parentPadTop, this._parentPadRight, this._parentPadBottom, this._parentPadLeft, this.sty.shouldLog));
        applyStylePart(this.style, computeBoxLayout(this.sty, align, this._parentAxis, this._axis, this._childCount));
        applyStylePart(this.style, computeBoxDecoration(this.sty));
        applyStylePart(this.style, computeTextStyle(this.sty, isString(align) ? align : align.alignX, this.sty.overflowX ?? defaultOverflowX));
        applyStylePart(this.style, computeBoxInteraction(this.sty));
        this.classList.toggle(stackClassName, (this.sty.axis ?? _Axis.column) === _Axis.stack);
        this.classList.toggle(nonStackClassName, (this.sty.axis ?? _Axis.column) !== _Axis.stack);
        this.classList.toggle(bonusTouchAreaClassName, this.sty.bonusTouchArea ?? false);
        // Recompute growth
        const newWidthGrows = isFlexSize(formattedWidth) && formattedWidth.flex > 0;
        this.classList.toggle(widthGrowsClassName, newWidthGrows);
        const shouldUpdateWidthGrows = this._widthGrows !== newWidthGrows;
        const newHeightGrows = isFlexSize(formattedHeight) && formattedHeight.flex > 0;
        this.classList.toggle(heightGrowsClassName, newHeightGrows);
        const shouldUpdateHeightGrows = this._heightGrows !== newHeightGrows;
        if (shouldUpdateWidthGrows || shouldUpdateHeightGrows) {
            if (exists(this.parentElement)) {
                if (this.parentElement instanceof Miwi_Box) {
                    if (shouldUpdateWidthGrows)
                        this._widthGrows = newWidthGrows;
                    if (shouldUpdateHeightGrows)
                        this._heightGrows = newHeightGrows;
                    this.parentElement.thisIsAChildTogglingTheFactThatItGrows({
                        widthGrows: shouldUpdateWidthGrows ? newWidthGrows : undefined,
                        heightGrows: shouldUpdateHeightGrows ? newHeightGrows : undefined,
                    });
                }
            }
        }
    }
    constructor() {
        super();
        this.classList.add(`b-x`);
        this._parentObserver = new MutationObserver((mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === "attributes" &&
                    mutation.attributeName === "style") {
                    const shouldUpdateStyle = this.computeParentStyle();
                    if (shouldUpdateStyle)
                        this.updateStyle();
                    return;
                }
            }
        });
    }
    connectedCallback() {
        this.computeParentStyle();
        this.updateStyle();
        if (exists(this.parentElement)) {
            this._parentObserver.observe(this.parentElement, { attributes: true });
        }
    }
    disconnectedCallback() {
        this._parentObserver.disconnect();
        this._childCount = 0;
        if (this.parentElement instanceof Miwi_Box) {
            this.parentElement.thisIsAChildTogglingTheFactThatItGrows({
                widthGrows: false,
                heightGrows: false,
            });
        }
    }
}
const widthGrowsClassName = `b-x-width-grows`;
const heightGrowsClassName = `b-x-height-grows`;
const stackClassName = `b-x-stack`;
const nonStackClassName = `b-x-non-stack`;
const bonusTouchAreaClassName = `b-x-bonus-touch-area`;
const style = document.createElement(`style`);
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
`;
document.body.appendChild(style);
customElements.define("b-x", Miwi_Box);
