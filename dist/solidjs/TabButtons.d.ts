import { BoxProps } from "./Box";
import { Signal } from "./utils";
export declare function TabButtons(props: BoxProps & {
    selectedTab: Signal<number>;
    labels?: [string, string, string];
}): import("solid-js").JSX.Element;
