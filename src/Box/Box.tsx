import { type JSX, type ParentProps, onCleanup, createEffect, on } from "solid-js";
import { Sig, exists, sig, watchDeps, watchEffect } from "../utils";
import { makePropParser, observeElement } from "./BoxUtils";
import {
  _FlexAlign,
  watchBoxLayout,
  LayoutSty,
  stackClassName,
  Axis,
  columnClassName,
} from "./BoxLayout";
import { SizeSty, heightGrowsClassName, watchBoxSize, widthGrowsClassName } from "./BoxSize";
import { DecorationSty, watchBoxDecoration } from "./BoxDecoration";
import { TextSty, watchBoxText } from "./BoxText";
import { InteractionSty, watchBoxInteraction } from "./BoxInteraction";

// SECTION: Box Component
export type BoxProps = BoxStyleProps & ParentProps & JSX.DOMAttributes<HTMLDivElement>;
export type BoxStyleProps = Partial<
  LayoutSty &
    SizeSty &
    DecorationSty &
    TextSty &
    InteractionSty & {
      overrideProps: Partial<BoxStyleProps>;
      overrideOverrides: Partial<Omit<BoxStyleProps, `overrideProps` | `overrideOverrides`>>;
      getElement: (e: HTMLElement) => void;
      shouldLog?: boolean;
    }
>;
export function Box(props: BoxProps) {
  const parseProp: (...args: any[]) => any = makePropParser(props);
  // TODO: Eventually we want a "tag" prop, and to use document.createElement here.
  const element = sig<HTMLElement | undefined>(undefined);

  // Observe Parent
  const {
    parentAxis,
    parentPaddingLeft,
    parentPaddingTop,
    parentPaddingRight,
    parentPaddingBottom,
  } = _watchParent(element);

  // Observe Children
  const {
    hasMoreThanOneChild,
    aChildsWidthGrows,
    aChildsHeightGrows,
    maxChildWidthPx,
    maxChildHeightPx,
  } = _watchChildren(element);

  // Compute Layout
  const isScrollable = sig(false);
  const { alignX, overflowX, axis, padTop, padRight, padLeft, padBottom } = watchBoxLayout(
    parseProp,
    element,
    {
      hasMoreThanOneChild,
      isScrollable,
    },
  );
  /** TODO: provide a second element sig for a contentWrapperElement. This will be the same as
   * element, but can be changed by watchLayout if a content wrapper is introduced. */

  // Compute Size
  watchBoxSize(parseProp, element, {
    myAxis: axis,
    padTop,
    padRight,
    padLeft,
    padBottom,
    parentAxis,
    parentPaddingLeft,
    parentPaddingRight,
    parentPaddingTop,
    parentPaddingBottom,
    aChildsWidthGrows,
    aChildsHeightGrows,
    maxChildWidthPx,
    maxChildHeightPx,
    shouldLog: parseProp(`shouldLog`),
  });

  // Compute Decoration
  watchBoxDecoration(parseProp, element);

  // Compute Text Styling
  watchBoxText(parseProp, element, {
    alignX,
    overflowX,
  });

  // Computer Interactivity
  watchBoxInteraction(parseProp, element, { isScrollable });

  // TODO: Toggle element type based on "tag" prop.
  return (
    <div
      {...props}
      ref={el => {
        element.value = el;
        // Notify element getters
        parseProp(`getElement`, true).forEach((getter: any) => {
          if (typeof getter !== `function`) return;
          getter(element.value);
        });
      }}
    />
  );
}

/** SECTION: Helper function to watch parent for Box */
function _watchParent(element: Sig<HTMLElement | undefined>) {
  const parentAxis = sig<Axis>(Axis.column);
  const parentPaddingLeft = sig(`0px`);
  const parentPaddingTop = sig(`0px`);
  const parentPaddingRight = sig(`0px`);
  const parentPaddingBottom = sig(`0px`);
  // watchDeps([element], () => {
  watchEffect(() => {
    if (!exists(element.value)) return;
    if (!exists(element.value.parentElement)) return;
    const parentClassObserver = observeElement(
      element.value.parentElement,
      {
        attributes: true,
        attributeFilter: [`class`],
      },
      () => {
        if (!exists(element.value)) return;
        const parentElement = element.value.parentElement;
        if (!exists(parentElement)) return;
        // Parent Axis
        const newParentAxis = parentElement.classList.contains(stackClassName)
          ? Axis.stack
          : parentElement.classList.contains(columnClassName)
            ? Axis.column
            : Axis.row;
        if (parentAxis.value !== newParentAxis) {
          parentAxis.value = newParentAxis;
        }
      },
    );
    const parentStyleObserver = observeElement(
      element.value.parentElement,
      {
        attributes: true,
        attributeFilter: [`style`],
      },
      () => {
        if (!exists(element.value)) return;
        const parentElement = element.value.parentElement;
        if (!exists(parentElement)) return;
        const parentStyle = getComputedStyle(parentElement);
        const newParentPaddingLeft = parentStyle.paddingLeft;
        if (parentPaddingLeft.value !== newParentPaddingLeft) {
          parentPaddingLeft.value = newParentPaddingLeft;
        }
        const newParentPaddingTop = parentStyle.paddingTop;
        if (parentPaddingTop.value !== newParentPaddingTop) {
          parentPaddingTop.value = newParentPaddingTop;
        }
        const newParentPaddingRight = parentStyle.paddingRight;
        if (parentPaddingRight.value !== newParentPaddingRight) {
          parentPaddingRight.value = newParentPaddingRight;
        }
        const newParentPaddingBottom = parentStyle.paddingBottom;
        if (parentPaddingBottom.value !== newParentPaddingBottom) {
          parentPaddingBottom.value = newParentPaddingBottom;
        }
      },
    );
    onCleanup(() => {
      parentClassObserver.disconnect();
      parentStyleObserver.disconnect();
    });
  });

  return {
    parentAxis,
    parentPaddingLeft,
    parentPaddingTop,
    parentPaddingRight,
    parentPaddingBottom,
  };
}

/** SECTION: Helper function to watch children for Box */
function _watchChildren(element: Sig<HTMLElement | undefined>) {
  const aChildsWidthGrows = sig(false);
  const aChildsHeightGrows = sig(false);
  const maxChildWidthPx = sig(0);
  const maxChildHeightPx = sig(0);
  const hasMoreThanOneChild = sig(false);
  const childSizeGrowsObservers: MutationObserver[] = [];
  const maxChildSizeObservers: MutationObserver[] = [];
  // watchDeps([element], () => {
  // watchEffect(() => {
  createEffect(
    on(
      () => element.value,
      () => {
        if (!exists(element.value)) return;
        const childListObserver = observeElement(
          element.value,
          {
            childList: true,
          },
          () => {
            if (!exists(element.value)) return;
            const childElementsArray = Array.from(element.value.childNodes).filter(
              child => child instanceof HTMLElement,
            ) as HTMLElement[];
            // Has More Than One Child
            const newHasMoreThanOneChild = childElementsArray.length > 1;
            if (hasMoreThanOneChild.value !== newHasMoreThanOneChild) {
              hasMoreThanOneChild.value = newHasMoreThanOneChild;
            }

            // Child observers
            childSizeGrowsObservers.forEach(observer => observer.disconnect());
            childSizeGrowsObservers.splice(0, childSizeGrowsObservers.length);
            maxChildSizeObservers.forEach(observer => observer.disconnect());
            maxChildSizeObservers.splice(0, maxChildSizeObservers.length);
            childElementsArray.forEach(child => {
              // Observe Child Size Grows
              const sizeGrosObserver = new MutationObserver(watchChildSizeGrows);
              sizeGrosObserver.observe(child, {
                attributes: true,
                attributeFilter: [`class`],
              });
              childSizeGrowsObservers.push(sizeGrosObserver);
              watchChildSizeGrows();
              function watchChildSizeGrows() {
                if (!exists(element.value)) return;
                const childElementsArray = Array.from(element.value.childNodes).filter(
                  child => child instanceof HTMLElement,
                ) as HTMLElement[];
                const newAChildsWidthGrows = childElementsArray.some(childElement =>
                  childElement.classList.contains(widthGrowsClassName),
                );
                if (aChildsWidthGrows.value !== newAChildsWidthGrows) {
                  aChildsWidthGrows.value = newAChildsWidthGrows;
                }
                const newAChildsHeightGrows = childElementsArray.some(childElement =>
                  childElement.classList.contains(heightGrowsClassName),
                );
                if (aChildsHeightGrows.value !== newAChildsHeightGrows) {
                  aChildsHeightGrows.value = newAChildsHeightGrows;
                }
              }

              // Observer Max Child Size
              const maxSizeObserver = new MutationObserver(watchMaxChildSize);
              maxSizeObserver.observe(child, {
                attributes: true,
                attributeFilter: [`style`],
              });
              maxChildSizeObservers.push(maxSizeObserver);
              watchMaxChildSize();
              function watchMaxChildSize() {
                if (!exists(element.value)) return;
                const childElementsArray = Array.from(element.value.childNodes).filter(
                  child => child instanceof HTMLElement,
                ) as HTMLElement[];
                let newMaxChildWidthPx = 0;
                childElementsArray.forEach(childElement => {
                  newMaxChildWidthPx = Math.max(
                    newMaxChildWidthPx,
                    childElement.getBoundingClientRect().width,
                  );
                });
                if (maxChildWidthPx.value !== newMaxChildWidthPx) {
                  maxChildWidthPx.value = newMaxChildWidthPx;
                }
                let newMaxChildHeightPx = 0;
                childElementsArray.forEach(childElement => {
                  newMaxChildHeightPx = Math.max(
                    newMaxChildHeightPx,
                    childElement.getBoundingClientRect().height,
                  );
                });
                if (maxChildHeightPx.value !== newMaxChildHeightPx) {
                  maxChildHeightPx.value = newMaxChildHeightPx;
                }
              }
            });
          },
        );
        onCleanup(() => {
          childListObserver.disconnect();
          childSizeGrowsObservers.forEach(observer => observer.disconnect());
          maxChildSizeObservers.forEach(observer => observer.disconnect());
        });
      },
    ),
  );
  return {
    element,
    hasMoreThanOneChild,
    aChildsWidthGrows,
    aChildsHeightGrows,
    maxChildWidthPx,
    maxChildHeightPx,
  };
}
