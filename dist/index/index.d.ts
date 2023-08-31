type LayoutSty = PadStyProps & AlignStyProps & {
    axis: Axis$1;
    overflowX: Overflow$1;
    overflowY: Overflow$1;
};
type _PadUnit = number | string;
type PadStyProps = {
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
type Axis$1 = (typeof Axis$1)[keyof typeof Axis$1];
declare const Axis$1: {
    readonly row: "row";
    readonly column: "column";
    readonly stack: "stack";
};
type Overflow$1 = (typeof Overflow$1)[keyof typeof Overflow$1];
declare const Overflow$1: {
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
type AlignStyProps = {
    align: Align$1;
    alignX: AlignSingleAxis;
    alignY: AlignSingleAxis;
};
type _FlexAlign = (typeof _FlexAlign)[keyof typeof _FlexAlign];
declare const _FlexAlign: {
    readonly start: "flex-start";
    readonly center: "center";
    readonly end: "flex-end";
};
type _SpaceAlign = (typeof _SpaceAlign)[keyof typeof _SpaceAlign];
declare const _SpaceAlign: {
    readonly spaceBetween: "space-between";
    readonly spaceAround: "space-around";
    readonly spaceEvenly: "space-evenly";
};
type AlignSingleAxis = _FlexAlign | _SpaceAlign;
type AlignTwoAxis = {
    alignX: AlignSingleAxis;
    alignY: AlignSingleAxis;
};
type Align$1 = AlignSingleAxis | AlignTwoAxis;
declare const Align$1: {
    readonly topLeft: {
        readonly alignX: "flex-start";
        readonly alignY: "flex-start";
    };
    readonly topCenter: {
        readonly alignX: "center";
        readonly alignY: "flex-start";
    };
    readonly topRight: {
        readonly alignX: "flex-end";
        readonly alignY: "flex-start";
    };
    readonly centerLeft: {
        readonly alignX: "flex-start";
        readonly alignY: "center";
    };
    readonly center: {
        readonly alignX: "center";
        readonly alignY: "center";
    };
    readonly centerRight: {
        readonly alignX: "flex-end";
        readonly alignY: "center";
    };
    readonly bottomLeft: {
        readonly alignX: "flex-start";
        readonly alignY: "flex-end";
    };
    readonly bottomCenter: {
        readonly alignX: "center";
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

type DecorationSty = {
    cornerRadius: number | string | [number, number, number, number];
    outlineColor: string;
    outlineSize: number;
    background: string;
    shadowSize: number;
    shadowDirection: ShadowDirection;
    zIndex: number;
};
type ShadowDirection = {
    [Key in keyof AlignTwoAxis]: Exclude<AlignTwoAxis[Key], _SpaceAlign>;
};

type Size$1 = number | string | FlexSize;
type SizeSty = {
    width: Size$1;
    height: Size$1;
};
declare function sizeToCss$1(num: number | string): string;
interface FlexSize {
    flex: number;
    min: number;
    max: number;
}

type TextSty = {
    scale: number | string;
    textColor: string;
    textIsBold: boolean;
    textIsItalic: boolean;
    textIsUnderlined: boolean;
};

type InteractionSty = {
    isInteractable: boolean;
    bonusTouchArea: boolean;
};

type _Sty = SizeSty & DecorationSty & LayoutSty & TextSty & InteractionSty & {
    shouldLog?: boolean;
};
type Sty = Partial<_Sty>;
type Align = Align$1;
declare const Align: {
    readonly topLeft: {
        readonly alignX: "flex-start";
        readonly alignY: "flex-start";
    };
    readonly topCenter: {
        readonly alignX: "center";
        readonly alignY: "flex-start";
    };
    readonly topRight: {
        readonly alignX: "flex-end";
        readonly alignY: "flex-start";
    };
    readonly centerLeft: {
        readonly alignX: "flex-start";
        readonly alignY: "center";
    };
    readonly center: {
        readonly alignX: "center";
        readonly alignY: "center";
    };
    readonly centerRight: {
        readonly alignX: "flex-end";
        readonly alignY: "center";
    };
    readonly bottomLeft: {
        readonly alignX: "flex-start";
        readonly alignY: "flex-end";
    };
    readonly bottomCenter: {
        readonly alignX: "center";
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
type Axis = Axis$1;
declare const Axis: {
    readonly row: "row";
    readonly column: "column";
    readonly stack: "stack";
};
type Overflow = Overflow$1;
declare const Overflow: {
    readonly forceStretchParent: "forceStretchParent";
    readonly crop: "crop";
    readonly wrap: "wrap";
    readonly scroll: "scroll";
};
declare const mdColors: {
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
type Size = Size$1;
declare const sizeToCss: typeof sizeToCss$1;
declare class Miwi_Box extends HTMLElement {
    private _parentObserver;
    private _parentAxis;
    private _parentPadTop;
    private _parentPadRight;
    private _parentPadBottom;
    private _parentPadLeft;
    private _childCount;
    static get observedAttributes(): string[];
    private _sty;
    get sty(): Partial<_Sty>;
    set sty(value: Partial<_Sty>);
    private get _axis();
    private _widthGrows;
    private _heightGrows;
    private _numChildrenWithGrowingWidths;
    private _numChildrenWithGrowingHeights;
    private get _someChildWidthGrows();
    private get _someChildHeightGrows();
    thisIsAChildTogglingTheFactThatItGrows(props: {
        widthGrows?: boolean;
        heightGrows?: boolean;
    }): void;
    computeParentStyle(): boolean;
    computeSomeChildGrows(): {
        someChildWidthGrows: boolean;
        someChildHeightGrows: boolean;
    };
    updateStyle(): void;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
}

export { Align, Axis, Miwi_Box, Overflow, Size, Sty, _Sty, mdColors, sizeToCss };
