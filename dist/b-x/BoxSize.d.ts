import { CssProps } from "./BoxUtils";
import { Axis, LayoutSty, Overflow } from "./BoxLayout";
export type Size = number | string | FlexSize;
export type SizeSty = {
    width: Size;
    height: Size;
};
export declare const muToRem = 1.125;
export declare function sizeToCss(num: number | string): string;
export interface FlexSize {
    flex: number;
    min: number;
    max: number;
}
export declare function isFlexSize(size: any): size is FlexSize;
export declare function computeSizeInfo({ size, isMainAxis, overflow, shouldLog, }: {
    size: number | string | FlexSize;
    isMainAxis: boolean;
    overflow: Overflow;
    shouldLog?: boolean;
}): readonly [string | undefined, string | undefined, string | undefined, boolean];
export declare function computeBoxSize(sty: Partial<SizeSty & LayoutSty>, childWidthGrows: boolean, childHeightGrows: boolean, parentAxis: Axis, parentPadTop: string, parentPadRight: string, parentPadBottom: string, parentPadLeft: string, shouldLog?: boolean): CssProps;
