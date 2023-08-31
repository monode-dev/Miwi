import { CssProps } from "./BoxUtils";
export type InteractionSty = {
    isInteractable: boolean;
    bonusTouchArea: boolean;
};
export declare function computeBoxInteraction(sty: Partial<InteractionSty>): CssProps;
