export declare function exists<T>(x: T): x is NonNullable<T>;
export declare function isNum(x: unknown): x is number;
export declare function isString(x: unknown): x is string;
export type CssProps = {
    [key: string]: string | number | undefined;
};
