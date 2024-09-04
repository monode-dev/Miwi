import { Prop, exists } from "src/utils";
import { ParseProp } from "./BoxUtils";
import { createRenderEffect } from "solid-js";

export type InteractionSty = Partial<{
  // role: string
  bonusTouchArea: boolean;
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

const bonusTouchAreaClassName = `miwi-bonus-touch-area`;
const style = document.createElement(`style`);
// TODO: Use bonus touch radius to control the size of the touch area.
/* We tried to prevent clip from affecting touch radius since that seemed like a good
 * idea, but clip needs to effect touch radius to some degree. Imagine a scrollable
 * body, withe a bottom nav bar. Components under the bottom nav bar should not be
 * interactable. */
// Use background: rgba(255, 0, 0, 0.125); for debugging.
style.textContent = `
:root {
  --miwi-bonus-touch-radius: -0.5rem
}
.${bonusTouchAreaClassName}::before {
  content: '';
  position: absolute;
  top: var(--miwi-bonus-touch-radius);
  right: var(--miwi-bonus-touch-radius);
  bottom: var(--miwi-bonus-touch-radius);
  left: var(--miwi-bonus-touch-radius);
  pointer-events: auto;
  background: rgba(255, 0, 0, 0.125);
}`; //z-index: -1;
document.body.appendChild(style);

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
    // NOTE: This seems to be adding extra padding to layouts when a full-screen dialog and keyboard are open.
    // element.value.classList.toggle(
    //   bonusTouchAreaClassName,
    //   parseProp(`bonusTouchArea`) ?? isClickable,
    // );
    element.value.style.outline = isClickable ? `0.5rem solid rgba(255, 0, 0, 0.125)` : ``;
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
