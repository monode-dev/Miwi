import { CssProps } from "./BoxUtils";
export type InteractionSty = {
    isInteractable: boolean;
};
export declare function computeBoxInteraction(sty: Partial<InteractionSty>): CssProps;
