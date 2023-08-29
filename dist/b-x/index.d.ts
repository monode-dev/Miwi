import { DecorationSty } from "./BoxDecoration";
import { Axis as _Axis, Overflow as _Overflow, Align as _Align, LayoutSty } from "./BoxLayout";
import { SizeSty, Size as _Size } from "./BoxSize";
import { TextSty } from "./BoxText";
import { InteractionSty } from "./BoxInteraction";
export type _Sty = SizeSty & DecorationSty & LayoutSty & TextSty & InteractionSty;
export type Sty = Partial<_Sty>;
export type Align = _Align;
export declare const Align: {
    readonly topLeft: {
        readonly alignX: "flex-start";
        readonly alignY: "flex-start";
    };
    readonly topCenter: {
        readonly alignX: "safe center";
        readonly alignY: "flex-start";
    };
    readonly topRight: {
        readonly alignX: "flex-end";
        readonly alignY: "flex-start";
    };
    readonly centerLeft: {
        readonly alignX: "flex-start";
        readonly alignY: "safe center";
    };
    readonly center: {
        readonly alignX: "safe center";
        readonly alignY: "safe center";
    };
    readonly centerRight: {
        readonly alignX: "flex-end";
        readonly alignY: "safe center";
    };
    readonly bottomLeft: {
        readonly alignX: "flex-start";
        readonly alignY: "flex-end";
    };
    readonly bottomCenter: {
        readonly alignX: "safe center";
        readonly alignY: "flex-end";
    };
    readonly bottomRight: {
        readonly alignX: "flex-end";
        readonly alignY: "flex-end";
    };
    readonly spaceBetween: "space-between";
    readonly spaceAround: "space-around";
    readonly spaceEvenly: "space-evenly";
    readonly start: "flex-start";
    readonly end: "flex-end";
};
export type Axis = _Axis;
export declare const Axis: {
    readonly row: "row";
    readonly column: "column";
    readonly stack: "stack";
};
export type Overflow = _Overflow;
export declare const Overflow: {
    readonly forceStretchParent: "forceStretchParent";
    readonly crop: "crop";
    readonly wrap: "wrap";
    readonly scroll: "scroll";
};
export declare const mdColors: {
    readonly white: "#ffffffff";
    readonly almostWhite: "#f9fafdff";
    readonly pink: "#e91e63ff";
    readonly red: "#f44336ff";
    readonly orange: "#ff9800ff";
    readonly yellow: "#ffea00ff";
    readonly dataplateyellow: "#f2b212";
    readonly green: "#4caf50ff";
    readonly teal: "#009688ff";
    readonly blue: "#2196f3ff";
    readonly purple: "#9c27b0ff";
    readonly brown: "#795548ff";
    readonly grey: "#9e9e9eff";
    readonly black: "#000000ff";
    readonly transparent: "#ffffff00";
    readonly sameAsText: "currentColor";
};
export type Size = _Size;
export declare class Miwi_Box extends HTMLElement {
    private _parentObserver;
    private _parentAxis;
    private _parentPadTop;
    private _parentPadRight;
    private _parentPadBottom;
    private _parentPadLeft;
    private _selfObserver;
    private _childrenObserver;
    private _childCount;
    private _anyChildIsABoxWithAGrowingWidth;
    private _anyChildIsABoxWithAGrowingHeight;
    static get observedAttributes(): string[];
    private _sty;
    get sty(): Partial<_Sty>;
    set sty(value: Partial<_Sty>);
    private get _axis();
    computeParentStyle(): void;
    updateChildSizeGrows(): void;
    updateChildList(): void;
    updateStyle(): void;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
}
