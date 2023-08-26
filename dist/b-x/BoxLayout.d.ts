import { CssProps } from "./BoxUtils";
export type LayoutSty = PadStyProps & AlignStyProps & {
    axis: Axis;
    overflowX: Overflow;
    overflowY: Overflow;
};
type _PadUnit = number | string;
export type PadStyProps = {
    pad: _PadUnit;
    padAround: _PadUnit;
    padAroundX: _PadUnit;
    padAroundY: _PadUnit;
    padTop: _PadUnit;
    padRight: _PadUnit;
    padBottom: _PadUnit;
    padLeft: _PadUnit;
    padBetween: _PadUnit;
    padBetweenRows: _PadUnit;
    padBetweenColumns: _PadUnit;
};
export type Axis = (typeof Axis)[keyof typeof Axis];
export declare const Axis: {
    readonly row: "row";
    readonly column: "column";
    readonly stack: "stack";
};
export type Overflow = (typeof Overflow)[keyof typeof Overflow];
export declare const Overflow: {
    /** TODO: A css overflow of `visible` doesn't behave like we want it to. We
     * want it to behave like a spreadsheet, showing the overflow but not affecting
     * layout. However, a css overflow of visible instead affect the layout of
     * siblings and parents. We need to find a way to fix this. It would probabl
     * involve spawing a sub div to wrap the children in. */
    readonly forceStretchParent: "forceStretchParent";
    readonly crop: "crop";
    readonly wrap: "wrap";
    readonly scroll: "scroll";
};
export declare const defaultOverflowX: "forceStretchParent";
export declare const defaultOverflowY: "forceStretchParent";
export type AlignStyProps = {
    align: Align;
    alignX: AlignSingleAxis;
    alignY: AlignSingleAxis;
};
export type _FlexAlign = (typeof _FlexAlign)[keyof typeof _FlexAlign];
export declare const _FlexAlign: {
    readonly start: "flex-start";
    readonly center: "safe center";
    readonly end: "flex-end";
};
export type _SpaceAlign = (typeof _SpaceAlign)[keyof typeof _SpaceAlign];
export declare const _SpaceAlign: {
    readonly spaceBetween: "space-between";
    readonly spaceAround: "space-around";
    readonly spaceEvenly: "space-evenly";
};
export type AlignSingleAxis = _FlexAlign | _SpaceAlign;
export type AlignTwoAxis = {
    alignX: AlignSingleAxis;
    alignY: AlignSingleAxis;
};
export type Align = AlignSingleAxis | AlignTwoAxis;
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
export declare function computeBoxLayout(sty: Partial<LayoutSty>, align: Align, parent: any, axis: Axis, childCount: number): CssProps;
export {};
