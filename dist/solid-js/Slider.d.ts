import { Signal } from "./utils";
import { BoxProps } from "./Box";
export declare function Slider(props: {
    value: Signal<number>;
    min: number;
    max: number;
} & BoxProps): import("solid-js").JSX.Element;
