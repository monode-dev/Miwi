import type { Align, Axis, Overflow } from "../b-x";
export type ExpectedGlobals = {
    $theme: {
        readonly colors: {
            readonly primary: string;
            readonly accent: string;
            readonly pageBackground: string;
            readonly text: string;
            readonly hint: string;
            readonly lightHint: string;
            readonly warning: string;
            readonly error: string;
            readonly sameAsText: string;
        };
    };
    $Align: typeof Align;
    $Axis: typeof Axis;
    $Overflow: typeof Overflow;
};
