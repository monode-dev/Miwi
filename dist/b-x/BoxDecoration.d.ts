import { CssProps } from "./BoxUtils";
import { AlignTwoAxis, _SpaceAlign } from "./BoxLayout";
export type DecorationSty = {
    cornerRadius: number | string | [number, number, number, number];
    outlineColor: string;
    outlineSize: number;
    background: string;
    shadowSize: number;
    shadowDirection: ShadowDirection;
    zIndex: number;
};
export type ShadowDirection = {
    [Key in keyof AlignTwoAxis]: Exclude<AlignTwoAxis[Key], _SpaceAlign>;
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
export declare function computeBoxDecoration(sty: Partial<DecorationSty>): CssProps;
