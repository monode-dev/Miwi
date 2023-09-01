export function computeBoxInteraction(sty) {
    return {
        pointerEvents: sty.isInteractable === undefined
            ? undefined
            : sty.isInteractable
                ? `auto`
                : `none`,
    };
}
