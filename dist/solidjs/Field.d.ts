import { BoxProps } from "./Box";
import { Signal } from "./utils";
import "./Field.css";
export type KeyboardType = "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
type FormattedResult = {
    input: string;
    caret: number;
};
export declare function Field(props: {
    value?: Signal<string>;
    tempValue?: Signal<string>;
    hasFocus?: Signal<boolean>;
    hintText?: string;
    hintColor?: string;
    lineCount?: number;
    underlined?: boolean;
    scale?: number;
    icon?: string;
    keyboard?: KeyboardType;
    heading?: boolean;
    title?: boolean;
    validateNextInput?: (nextInput: string) => boolean;
    formatInput?: (nextInput: string, event: InputEvent) => FormattedResult;
    sty?: {
        scale?: number;
    };
} & BoxProps): import("solid-js").JSX.Element;
export {};
