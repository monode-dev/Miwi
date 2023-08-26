import { CssProps } from "./BoxUtils";
import { Axis, LayoutSty, Overflow } from "./BoxLayout";
export type SizeSty = {
    width: number | string | FlexSize;
    height: number | string | FlexSize;
};
export declare const muToRem = 1.125;
export declare function sizeToCss(num: number | string): string;
export interface FlexSize {
    flex: number;
    min: number;
    max: number;
}
export declare function isFlexSize(size: any): size is FlexSize;
export declare function computeSizeInfo({ size, isMainAxis, overflow, }: {
    size: number | string | FlexSize;
    isMainAxis: boolean;
    overflow: Overflow;
}): readonly [string | undefined, string | undefined, string | undefined, boolean];
export declare function computeBoxSize(sty: Partial<SizeSty & LayoutSty>, childWidthGrows: boolean, childHeightGrows: boolean, parentAxis: Axis, parentPadTop: string, parentPadRight: string, parentPadBottom: string, parentPadLeft: string): CssProps;
