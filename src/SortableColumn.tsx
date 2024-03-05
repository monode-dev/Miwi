import { onCleanup, onMount } from "solid-js";
import { Column } from "./Column";
import { sig, exists, SigGet, compute } from "./utils";
import { observeElement } from "./Box/BoxUtils";
import { numOpenModals } from "./Modal";

const elementsBeingSorted = sig<HTMLElement[]>([]);

// TODO: Support horizontal and grid sorting
/** Contents can be sorted by long pressing. */
export function SortableColumn(props: {
  onSort: (props: { from: number; to: number }) => void;
  children: any;
  sortingZIndex?: number;
  shouldLog?: boolean;
  // TODO: for: (entry: T) => JSX.Element
}) {
  let columnElement: HTMLElement | null = null;
  const doOnCleanUp = new Set<() => void>();

  // SECTION: Detect Long Press
  function watchForLongPress(event: MouseEvent | TouchEvent) {
    /** NOTE: If a modal is open, the user can scroll in it and accidentally start a drag.
     * Eventually we should be able to track who handles the click, but right now this patch
     * should work. */
    if (numOpenModals.value > 0) return;
    const initialMousePos = getMousePos(event);
    let currentMousePos = initialMousePos;
    const longPressTimeout = setTimeout(() => {
      handleDrag(event.target as HTMLElement, currentMousePos);
    }, 300); // 10

    // Cancel long press if mouse is moved too much
    document.addEventListener("mousemove", ifMoveTooMuchCancelLongPress);
    document.addEventListener("touchmove", ifMoveTooMuchCancelLongPress);
    function ifMoveTooMuchCancelLongPress(event: MouseEvent | TouchEvent) {
      currentMousePos = getMousePos(event);
      const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
      if (
        Math.abs(currentMousePos.x - initialMousePos.x) > 0.5 * remInPx ||
        Math.abs(currentMousePos.y - initialMousePos.y) > 0.5 * remInPx
      ) {
        cancelLongPress();
      }
    }

    // Cancel long press if mouse is released
    document.addEventListener("mouseup", cancelLongPress);
    document.addEventListener("touchend", cancelLongPress);
    doOnCleanUp.add(cancelLongPress);
    function cancelLongPress() {
      clearTimeout(longPressTimeout);
      document.removeEventListener("mousemove", ifMoveTooMuchCancelLongPress);
      document.removeEventListener("touchmove", ifMoveTooMuchCancelLongPress);
      document.removeEventListener("mouseup", cancelLongPress);
      document.removeEventListener("touchend", cancelLongPress);
      doOnCleanUp.delete(cancelLongPress);
    }
  }

  // SECTION: Handle Drag
  // TODO: Handle children being added/removed mid-drag
  function handleDrag(clickTarget: HTMLElement, startMousePos: { x: number; y: number }) {
    const sourceElement = (() => {
      let sourceElement = clickTarget;
      while (sourceElement.parentNode !== columnElement) {
        sourceElement = sourceElement.parentNode as HTMLElement;
      }
      return sourceElement;
    })();
    elementsBeingSorted.value = [...elementsBeingSorted.value, sourceElement];
    const originalRect = sourceElement.getBoundingClientRect();
    const sourceWidth = originalRect.width;
    const sourceHeight = originalRect.height;
    const scrollableContainer = getScrollableParent(columnElement!);
    const { top: dragElementY, left: dragElementX } = getOffset(sourceElement);
    // const dragElementX = originalRect.left
    // const dragElementY = originalRect.top
    function getOffset(element: HTMLElement | null) {
      var offsetTop = 0;
      var offsetLeft = 0;

      while (element) {
        offsetTop += element.offsetTop;
        offsetLeft += element.offsetLeft;

        // Move up in the DOM tree
        element = element.offsetParent as HTMLElement | null;

        // If the current offsetParent is transformed, break the loop
        if (element && window.getComputedStyle(element).transform !== "none") {
          break;
        }
      }

      return {
        top: offsetTop - (scrollableContainer?.scrollTop ?? 0),
        left: offsetLeft - (scrollableContainer?.scrollLeft ?? 0),
      };
    }

    const { mousePos, stopWatchingMousePos } = watchMousePos(startMousePos);
    const originalIndex = Array.from(columnElement!.children).indexOf(sourceElement);

    // Create a placeholder with the same dimensions as the original item
    const placeholderElement = document.createElement("div");
    placeholderElement.style.width = `${sourceWidth}px`;
    placeholderElement.style.height = `${sourceHeight}px`;
    columnElement!.insertBefore(placeholderElement, sourceElement);
    columnElement!.removeChild(sourceElement);

    // Create a floating container and attach to the body
    const dragElement = document.createElement("div");
    dragElement.style.position = "fixed"; //'absolute'
    dragElement.style.top = `${dragElementY}px`;
    dragElement.style.left = `${dragElementX}px`;
    dragElement.style.width = `${sourceWidth}px`;
    dragElement.style.height = `${sourceHeight}px`;
    const dragElementOffsetX = mousePos.x - dragElementX;
    const dragElementOffsetY = mousePos.y - dragElementY;
    dragElement.style.pointerEvents = "none"; // to ensure it doesn't interfere with mouse events
    dragElement.style.zIndex = `${props.sortingZIndex ?? 1000}`; // to ensure it renders on top of everything else
    dragElement.style.scale = "1.025";
    dragElement.appendChild(sourceElement);
    columnElement!.appendChild(dragElement);

    // Initialize animation variables
    let dragAnimator: number | null = null;
    const lastFrameTime = performance.now();

    // Set up event listeners
    requestAnimationFrame(handleDragMoveEachFrame);
    document.addEventListener("mousemove", preventScrollOnMouseMove, {
      passive: false,
    });
    document.addEventListener("touchmove", preventScrollOnMouseMove, {
      passive: false,
    });
    document.addEventListener("mouseup", endDrag, { passive: false });
    document.addEventListener("touchend", endDrag, { passive: false });
    doOnCleanUp.add(endDrag);

    /** TODO: On desktop browsers contents jitter on scroll up. What appears to
     * happen is that the placeholder phases out of existence for a frame
     * sometimes. It might be moving somewhere else, but the rest of the
     * contents seem to behave like it just doesn't exist. This only happens
     * when scrolling up fast. It doesn't seem to happen due to a swap. */
    function handleDragMoveEachFrame(frameTime: number) {
      const timeSinceLastFrame = frameTime - lastFrameTime;

      // Scroll when near the bottom or top.
      if (scrollableContainer !== null) {
        const scrollRect = scrollableContainer.getBoundingClientRect();
        const scrollThreshold = scrollRect.height / 5;
        // TODO: Don't scroll faster if the mouse is over the edge
        const distanceFromTopEdge = Math.max(0, mousePos.y - scrollRect.top);
        const distanceLeftToTop = scrollableContainer.scrollTop;
        const distanceFromBottomEdge = Math.max(0, scrollRect.bottom - mousePos.y);
        const distanceLeftToBottom =
          scrollableContainer.scrollHeight - (scrollableContainer.scrollTop + scrollRect.height);
        const shouldScrollUp = distanceFromTopEdge < scrollThreshold;
        const shouldScrollDown = distanceFromBottomEdge < scrollThreshold;
        // TODO: Make this be based off of timeSinceLastFrame and rem
        let scrollAmount = 0;
        if (shouldScrollUp) {
          scrollAmount = Math.max(
            -distanceLeftToTop,
            -Math.max(0, 0.1 * (scrollThreshold - distanceFromTopEdge)),
          );
        } else if (shouldScrollDown) {
          scrollAmount = Math.min(
            distanceLeftToBottom,
            Math.max(0, 0.1 * (scrollThreshold - distanceFromBottomEdge)),
          );
        }
        scrollableContainer.scrollTop += scrollAmount;
      }

      // Move the dragged element
      dragElement.style.left = `${mousePos.x - dragElementOffsetX}px`;
      dragElement.style.top = `${mousePos.y - dragElementOffsetY}px`;

      // Move the place holder
      // TODO: Animate elements on change.
      // TODO: Calculate position relative to viewport.
      const prevCenter = getYFromChildNode(placeholderElement.previousSibling);
      const nextCenter = getYFromChildNode(placeholderElement.nextSibling);
      const dragPos = dragElement.getBoundingClientRect();
      if (exists(prevCenter) && dragPos.top < prevCenter) {
        // console.log(`Swapping with prev.`);
        placeholderElement.parentNode?.insertBefore(
          placeholderElement,
          placeholderElement.previousSibling,
        );
      } else if (exists(nextCenter) && dragPos.bottom > nextCenter) {
        // console.log(`Swapping with next.`);
        placeholderElement.parentNode?.insertBefore(
          placeholderElement,
          placeholderElement.nextSibling?.nextSibling ?? null,
        );
      }

      // Re-run next frame as well
      dragAnimator = requestAnimationFrame(handleDragMoveEachFrame);
    }

    function preventScrollOnMouseMove(event: Event) {
      event.preventDefault();
    }

    function endDrag() {
      const endIndex = Array.from(columnElement!.children).indexOf(placeholderElement);
      columnElement!.removeChild(dragElement);
      columnElement!.removeChild(placeholderElement);
      // We have to put it pack in the original place so that solid js doesn't get confused
      columnElement!.insertBefore(sourceElement, columnElement!.children[originalIndex] ?? null);
      if (endIndex !== originalIndex) {
        props.onSort({
          from: originalIndex,
          to: endIndex,
        });
      }
      elementsBeingSorted.value = elementsBeingSorted.value.filter(
        element => element !== sourceElement,
      );
      document.removeEventListener("mousemove", preventScrollOnMouseMove);
      document.removeEventListener("touchmove", preventScrollOnMouseMove);
      document.removeEventListener("mouseup", endDrag);
      document.removeEventListener("touchend", endDrag);
      if (dragAnimator !== null) cancelAnimationFrame(dragAnimator);
      stopWatchingMousePos();
      doOnCleanUp.delete(endDrag);
    }
  }

  // SECTION: Handle Top Level Event Listeners
  onMount(() => {
    Array.from(columnElement!.children).forEach(child => {
      child.addEventListener("mousedown", watchForLongPress as any);
      child.addEventListener("touchstart", watchForLongPress as any);
    });
    const childrenObserver = observeElement(
      columnElement!,
      {
        childList: true,
      },
      mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach(child => {
              child.addEventListener("mousedown", watchForLongPress as any);
              child.addEventListener("touchstart", watchForLongPress as any);
            });
            mutation.removedNodes.forEach(child => {
              child.removeEventListener("mousedown", watchForLongPress as any);
              child.removeEventListener("touchstart", watchForLongPress as any);
            });
          }
        });
      },
    );
    doOnCleanUp.add(() => {
      Array.from(columnElement!.children).forEach(child => {
        child.removeEventListener("mousedown", watchForLongPress as any);
        child.removeEventListener("touchstart", watchForLongPress as any);
      });
      childrenObserver.disconnect();
    });
  });
  onCleanup(() => doOnCleanUp.forEach(func => func()));

  // SECTION: Component HTML
  return (
    <Column
      getElement={el => (columnElement = el)}
      classList={{ "miwi-sortable": true }}
      shouldLog={props.shouldLog}
    >
      {props.children}
    </Column>
  );
}

// SECTION: Utils
/** Finds the closest sortable ancestor, and returns a sig for if this component is being sorted. */
export function watchThisComponentIsBeingSorted(
  element: SigGet<HTMLElement | null>,
): SigGet<boolean> {
  return compute(() => {
    if (!element.value) return false;
    // Find the closest sortable ancestor
    let sortableAncestor = element.value;
    while (
      sortableAncestor.parentElement !== null &&
      !sortableAncestor.parentElement.classList.contains("miwi-sortable")
    ) {
      sortableAncestor = sortableAncestor.parentElement!;
    }

    // Watch if this component is being sorted
    return elementsBeingSorted.value.includes(sortableAncestor);
  });
}

function getScrollableParent(element: HTMLElement): HTMLElement | null {
  let currentElement = element.parentElement;
  while (currentElement) {
    if (
      currentElement.scrollHeight > currentElement.clientHeight &&
      (getComputedStyle(currentElement).overflowY === "auto" ||
        getComputedStyle(currentElement).overflowY === "scroll")
    ) {
      return currentElement;
    }
    currentElement = currentElement.parentElement;
  }
  return null;
}

function watchMousePos(startMousePos: { x: number; y: number }) {
  const mousePos = { ...startMousePos };
  document.addEventListener("mousemove", updateMousePos);
  document.addEventListener("touchmove", updateMousePos);
  function updateMousePos(event: MouseEvent | TouchEvent) {
    const newMousePos = getMousePos(event);
    mousePos.x = newMousePos.x;
    mousePos.y = newMousePos.y;
  }

  // Return a dispose function
  return {
    mousePos,
    stopWatchingMousePos: () => {
      document.removeEventListener("mousemove", updateMousePos);
      document.removeEventListener("touchmove", updateMousePos);
    },
  };
}

function getMousePos(event: MouseEvent | TouchEvent) {
  const anyEvent = event as any;
  return {
    x: anyEvent.clientX ?? anyEvent.touches[0].clientX,
    y: anyEvent.clientY ?? anyEvent.touches[0].clientY,
  };
}

function getYFromChildNode(childNode: Node | null): number | null {
  if (!childNode) return null;

  // Ensure the node is an instance of Element as only Elements have the `getBoundingClientRect` method.
  if (
    childNode instanceof Element &&
    ![`absolute`, `fixed`].includes(getComputedStyle(childNode).position)
  ) {
    const rect = childNode.getBoundingClientRect();
    const rectRelativeToViewport = {
      top: rect.top + window.scrollY,
      left: rect.left,
      bottom: rect.bottom + window.scrollY,
      right: rect.right,
    };
    return (rectRelativeToViewport.top + rectRelativeToViewport.bottom) / 2;
  }

  return null;
}
