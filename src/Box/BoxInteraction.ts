import { Prop, doNow, exists } from "src/utils";
import { muToCss, ParseProp } from "./BoxUtils";
import { createRenderEffect } from "solid-js";

export type InteractionSty = Partial<{
  // role: string
  // bonusTouchArea: boolean;
  touchRadius: number | string;
  // TODO: Maybe rename to "interactable", "clickable", "absorbsClicks", or something like that.
  preventClickPropagation: boolean;
  cssCursor: "pointer" | "default";
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMouseDown: (e: MouseEvent) => void;
  onMouseUp: (e: MouseEvent) => void;
  onTouchStart: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
  onClick: (e: MouseEvent) => void;
  onclick: (e: MouseEvent) => void;
}>;

// SECTION: Touch radius
/* To get touch radius we are using a `::before` pseudo element with `position: absolute`, but this is adding
 * extra padding to layouts when both a full-screen dialog and keyboard are open, and overflow clip on a box is
 * clipping that box's touch radius. An element's parent's clip should affect the touch radius, but an element's
 * own clip should not affect its touch radius. Imagine a scrollable body, with a bottom nav bar. Components
 * under the bottom nav bar should not be interactable. See the following link for a possible future approach.
 * https://github.com/w3c/csswg-drafts/issues/4708 */
export const { touchAreaColorCssVarName, applyTouchRadius } = doNow(() => {
  const expandedTouchRadiusClassName = `miwi-bonus-touch-area`;
  const touchRadiusCssVarName = `--miwi-touch-radius`;
  // This is so we can use semi-transparent red for debugging: `rgba(255, 0, 0, 0.125)`
  const touchAreaColorCssVarName = `--miwi-touch-area-color`;
  const style = document.createElement(`style`);
  style.textContent = `
  :root {
    ${touchRadiusCssVarName}: -${muToCss(0.5)}
  }
  .${expandedTouchRadiusClassName}::before {
    content: '';
    position: absolute;
    top: var(${touchRadiusCssVarName});
    right: var(${touchRadiusCssVarName});
    bottom: var(${touchRadiusCssVarName});
    left: var(${touchRadiusCssVarName});
    pointer-events: auto;
    background: var(${touchAreaColorCssVarName});
  }`; //z-index: -1;
  document.body.appendChild(style);

  return {
    touchAreaColorCssVarName,
    applyTouchRadius: (params: {
      parseProp: ParseProp<InteractionSty>;
      element: HTMLElement;
      isClickable: boolean;
    }) => {
      const touchRadiusCss = doNow(() => {
        const touchRadius = params.parseProp(`touchRadius`);
        return exists(touchRadius)
          ? typeof touchRadius === `string`
            ? touchRadius
            : // If touch radius is zero, then don't set it.
              touchRadius === 0
              ? undefined
              : muToCss(touchRadius)
          : params.isClickable
            ? muToCss(0.5)
            : undefined;
      });
      params.element.style.setProperty(
        touchRadiusCssVarName,
        exists(touchRadiusCss) ? `-${touchRadiusCss}` : ``,
      );
      params.element.classList.toggle(expandedTouchRadiusClassName, exists(touchRadiusCss));
      // params.element.style.outline = exists(touchRadiusCss)
      //   ? `${touchRadiusCss} solid rgba(255, 0, 0, 0.125)`
      //   : ``;
    },
  };
});

export function watchBoxInteraction(
  parseProp: ParseProp<InteractionSty>,
  element: Prop<HTMLElement | undefined>,
  context: {
    isScrollable: Prop<boolean>;
  },
) {
  // htmlElement.role = parseProp(`role`) ?? ``

  // Click
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    const onClickListeners = [
      ...parseProp(`onClick`, true).filter(exists),
      ...parseProp(`onclick`, true).filter(exists),
    ];
    const isClickable = onClickListeners.length > 0;
    const preventClickPropagation =
      parseProp(`preventClickPropagation`) ?? (isClickable || context.isScrollable.value);
    element.value.style.pointerEvents = preventClickPropagation ? `auto` : `none`;
    element.value.onclick = preventClickPropagation
      ? (e: MouseEvent) => {
          e.stopPropagation();
          onClickListeners.forEach(listener => listener(e));
        }
      : isClickable
        ? (e: MouseEvent) => onClickListeners.forEach(listener => listener(e))
        : null;
    element.value.style.cursor = parseProp(`cssCursor`) ?? (isClickable ? `pointer` : `default`);
    // applyTouchRadius({ parseProp, element: element.value, isClickable });
  });

  // On Mouse Enter
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    const onMouseEnterListeners = parseProp(`onMouseEnter`, true);
    element.value.onmouseenter =
      onMouseEnterListeners.length > 0
        ? () => onMouseEnterListeners.forEach(listener => listener())
        : null;
  });

  // On Mouse Leave
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    const onMouseLeaveListeners = parseProp(`onMouseLeave`, true);
    element.value.onmouseleave =
      onMouseLeaveListeners.length > 0
        ? () => onMouseLeaveListeners.forEach(listener => listener())
        : null;
  });

  // On Mouse Down
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    const onMouseDownListeners = parseProp(`onMouseDown`, true);
    element.value.onmousedown =
      onMouseDownListeners.length > 0
        ? e => onMouseDownListeners.forEach(listener => listener(e))
        : null;
  });

  // On Mouse Up
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    const onMouseUpListeners = parseProp(`onMouseUp`, true);
    element.value.onmouseup =
      onMouseUpListeners.length > 0
        ? e => onMouseUpListeners.forEach(listener => listener(e))
        : null;
  });

  // On Touch Start
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    const onTouchStartListeners = parseProp(`onTouchStart`, true);
    element.value.ontouchstart =
      onTouchStartListeners.length > 0
        ? e => onTouchStartListeners.forEach(listener => listener(e))
        : null;
  });

  // On Touch End
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    const onTouchEndListeners = parseProp(`onTouchEnd`, true);
    element.value.ontouchend =
      onTouchEndListeners.length > 0
        ? e => onTouchEndListeners.forEach(listener => listener(e))
        : null;
  });
}
