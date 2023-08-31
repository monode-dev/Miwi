import { BoxProps } from "./Box";
import { Signal } from "./utils";
import { KeyboardType } from "./Field";
export declare function NumField(props: {
    value?: Signal<number | null>;
    negativesAreAllowed?: boolean;
    hasFocus?: Signal<boolean>;
    hint?: string;
    hintColor?: string;
    icon?: string;
    underlined?: boolean;
    title?: boolean;
    heading?: boolean;
    keyboard?: KeyboardType;
} & BoxProps): import("solid-js").JSX.Element;
