import { type JSX, type ParentProps, onCleanup, createEffect, on, onMount } from "solid-js";
import { Sig, SigGet, compute, exists, sig, watchDeps, watchEffect } from "../utils";
import { makePropParser, observeElement } from "./BoxUtils";
import {
  _FlexAlign,
  watchBoxLayout,
  LayoutSty,
  stackClassName,
  Axis,
  getAxisSig,
  nonStackClassName,
  columnClassName,
  rowClassName,
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
  const shouldLog = parseProp(`shouldLog`);

  // Axis
  // NOTE: We do this here so that children can now our axis right away. Everything else can wait till onMount.
  const axis = getAxisSig(parseProp);

  onMount(() => {
    // Compute Layout
    const isScrollable = sig(false);
    const hasMoreThanOneChild = _watchHasMoreThanOneChild(element.value!);
    const { alignX, overflowX, padTop, padRight, padLeft, padBottom } = watchBoxLayout(
      parseProp,
      element,
      {
        hasMoreThanOneChild,
        isScrollable,
        axis,
      },
    );
    /** TODO: provide a second element sig for a contentWrapperElement. This will be the same as
     * element, but can be changed by watchLayout if a content wrapper is introduced. */

    // Observe Relatives
    const { maxChildWidthPx, maxChildHeightPx } = _watchMaxChildSize(element.value!, shouldLog);
    const aChildsWidthGrows = _findClassInChildren(element.value!, widthGrowsClassName);
    const aChildsHeightGrows = _findClassInChildren(element.value!, heightGrowsClassName);
    const parentAxis = _watchParentAxis(element.value!);
    const { parentPaddingLeft, parentPaddingTop, parentPaddingRight, parentPaddingBottom } =
      _watchParentPadding(
        element.value!,
        compute(() => axis.value === Axis.stack),
      );

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

    // The element is set up so we can give it to anyone who asked for it now
    parseProp(`getElement`, true).forEach((getter: any) => {
      if (typeof getter !== `function`) return;
      getter(element.value);
    });
  });

  // TODO: Toggle element type based on "tag" prop.
  return (
    <div
      {...props}
      classList={{
        [columnClassName]: axis.value === Axis.column,
        [rowClassName]: axis.value === Axis.row,
        [stackClassName]: axis.value === Axis.stack,
        [nonStackClassName]: axis.value !== Axis.stack,
      }}
      ref={el => {
        element.value = el;
        // Notify element getters
        // parseProp(`getElement`, true).forEach((getter: any) => {
        //   if (typeof getter !== `function`) return;
        //   getter(element.value);
        // });
      }}
    />
  );
}

/** SECTION: Helper function to watch parent for Box */
function _watchParentAxis(element: HTMLElement) {
  const parentAxis = sig<Axis>(Axis.column);
  const parentClassObserver = observeElement(
    element.parentElement!,
    {
      attributeFilter: [`class`],
    },
    () => {
      if (!exists(element)) return;
      if (!exists(element.parentElement)) return;
      parentAxis.value = element.parentElement.classList.contains(stackClassName)
        ? Axis.stack
        : element.parentElement.classList.contains(columnClassName)
          ? Axis.column
          : Axis.row;
    },
  );
  onCleanup(() => {
    parentClassObserver.disconnect();
  });
  return parentAxis;
}
function _watchParentPadding(element: HTMLElement, shouldWatch: SigGet<boolean>) {
  const parentPaddingLeft = sig(`0px`);
  const parentPaddingTop = sig(`0px`);
  const parentPaddingRight = sig(`0px`);
  const parentPaddingBottom = sig(`0px`);

  watchEffect(() => {
    if (!shouldWatch.value) return;
    const parentStyleObserver = observeElement(
      element.parentElement!,
      {
        attributes: true,
        attributeFilter: [`style`],
      },
      () => {
        const parentStyle = getComputedStyle(element.parentElement!);
        parentPaddingLeft.value = parentStyle.paddingLeft;
        parentPaddingTop.value = parentStyle.paddingTop;
        parentPaddingRight.value = parentStyle.paddingRight;
        parentPaddingBottom.value = parentStyle.paddingBottom;
      },
    );
    onCleanup(() => {
      parentStyleObserver.disconnect();
    });
  });

  return {
    parentPaddingLeft,
    parentPaddingTop,
    parentPaddingRight,
    parentPaddingBottom,
  };
}

/** SECTION: Helper function to watch children for Box */
function _watchHasMoreThanOneChild(element: HTMLElement) {
  const hasMoreThanOneChild = sig(false);
  const observer = observeElement(element, { childList: true }, () => {
    hasMoreThanOneChild.value = element.childNodes.length > 1;
  });
  onCleanup(() => {
    observer.disconnect();
  });
  return hasMoreThanOneChild;
}
function _findClassInChildren(element: HTMLElement, className: string) {
  const foundClass = sig(false);
  let childObserver = new MutationObserver(() => {});
  const observer = observeElement(element, { childList: true }, () => {
    const childElements = Array.from(element.childNodes).filter(
      child => child instanceof HTMLElement,
    ) as HTMLElement[];
    childObserver.disconnect();
    childObserver = new MutationObserver(watchAttr);
    watchAttr();
    childElements.forEach(child => {
      childObserver.observe(child, { attributeFilter: [`class`] });
    });
    function watchAttr() {
      foundClass.value = childElements.some(childElement =>
        childElement.classList.contains(className),
      );
    }
  });
  onCleanup(() => {
    observer.disconnect();
    childObserver.disconnect();
  });
  return foundClass;
}
function _watchMaxChildSize(element: HTMLElement, shouldLog = false) {
  const maxChildWidthPx = sig(0);
  const maxChildHeightPx = sig(0);
  let resizeObserver = new ResizeObserver(() => {});
  const childListObserver = observeElement(element, { childList: true }, () => {
    const childElements = Array.from(element.childNodes).filter(
      child => child instanceof HTMLElement,
    ) as HTMLElement[];
    resizeObserver.disconnect();
    resizeObserver = new ResizeObserver(checkGrows);
    childElements.forEach(child => {
      resizeObserver.observe(child);
    });
    function checkGrows() {
      [maxChildWidthPx.value, maxChildHeightPx.value] = childElements.reduce(
        (max, child) => {
          const { width, height } = child.getBoundingClientRect();
          if (shouldLog) console.log(`watchMaxChildSize`);
          return [Math.max(width, max[0]), Math.max(height, max[1])];
        },
        [0, 0],
      );
    }
  });
  onCleanup(() => {
    childListObserver.disconnect();
    resizeObserver.disconnect();
  });
  return {
    element,
    maxChildWidthPx,
    maxChildHeightPx,
  };
}
