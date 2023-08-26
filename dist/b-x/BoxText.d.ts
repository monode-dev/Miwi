import { CssProps } from "./BoxUtils";
import { AlignSingleAxis, Overflow } from "./BoxLayout";
export type TextSty = {
    scale: number | string;
    textColor: string;
    textIsBold: boolean;
    textIsItalic: boolean;
    textIsUnderlined: boolean;
};
export declare function numToFontSize(num: number): string;
export declare function computeTextStyle(sty: Partial<TextSty>, alignX: AlignSingleAxis, overflowX: Overflow): CssProps;
