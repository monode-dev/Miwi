import { Signal } from "./utils";
import { JSX } from "solid-js";
import { BoxProps } from "./Box";
export declare function TabView(props: BoxProps & {
    selectedTab: Signal<number>;
    tab0?: JSX.Element;
    tab1?: JSX.Element;
    tab2?: JSX.Element;
}): JSX.Element;
