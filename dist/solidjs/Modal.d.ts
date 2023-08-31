import { Signal } from "./utils";
import { BoxProps } from "./Box";
import { Size } from "../b-x";
import { JSX } from "solid-js";
export declare function Modal<T>(props: {
    openButton: JSX.Element;
    openButtonWidth: Size;
    openButtonHeight: Size;
    isOpen?: Signal<boolean>;
    modalWidth?: Size;
} & BoxProps): JSX.Element;
