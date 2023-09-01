export type Signal<T> = {
    value: T;
};
export declare function signal<T>(initValue: T): Signal<T>;
export type Getter<T> = {
    readonly value: T;
};
export declare function computed<T>(getter: () => T): Getter<T>;
export declare function watchDeps(deps: Getter<any>[], callback: () => void): void;
export declare function watchEffect(callback: () => void): void;
export declare function injectDefaults<T extends {}>(props: T, defaults: Partial<T>): T;
export declare function exists<T>(x: T): x is NonNullable<T>;
export declare function orderDocs<T, K extends string | number | null | undefined>(list: Iterable<T>, getKey: (obj: T) => K, options?: {
    nullPosition?: `first` | `last`;
    direction?: `normal` | `reverse`;
}): T[];
export declare function formatNumWithCommas(num: number, digits?: number | `min`): string;
export declare function roundToString(num: number, digits?: number | `min`): string;
export declare const NONE_SELECTED = "noneSelected";
export declare const ONE_TIME = "oneTime";
export declare const JUST_FUEL = "justFuel";
export declare function formatPhoneNumber(input: string, event: InputEvent): {
    input: string;
    caret: number;
};
export declare function formatAddress(input: string, event: InputEvent): {
    input: string;
    caret: number | null | undefined;
};
export declare function formatPosixTime(posixTime: number): string;
export declare function sessionStore<T>(storeName: string, defineStore: () => T): () => T;
