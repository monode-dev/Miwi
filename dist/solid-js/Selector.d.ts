import { Signal } from "./utils";
import { BoxProps } from "./Box";
export declare function Selector<T>(props: {
    value: T;
    getLabelForData: (data: T) => string | null;
    noneLabel?: string;
    modalIsOpen?: Signal<boolean>;
    emptyListText?: string;
    filterString?: Signal<string>;
    showCancelOptionForFilter?: boolean;
    isWide?: boolean;
} & BoxProps): import("solid-js").JSX.Element;
