import { type JSX, type ParentProps, onCleanup, createEffect, on, onMount } from "solid-js";
import { Sig, SigGet, compute, exists, sig, watchDeps, watchEffect } from "../utils";
import { makePropParser, observeElement } from "./BoxUtils";
import {
  _FlexAlign,
  watchBoxLayout,
  LayoutSty,
  stackClassName,
  Axis,
  columnAttrName,
  getAxisSig,
  rowAttrName,
  nonStackClassName,
  stackAttrName,
} from "./BoxLayout";
import { SizeSty, heightGrowsAttrName, watchBoxSize, widthGrowsAttrName } from "./BoxSize";
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
    const { maxChildWidthPx, maxChildHeightPx } = _watchChildren(element, shouldLog);
    const aChildsWidthGrows = _findAttrInChildren(element.value!, widthGrowsAttrName);
    const aChildsHeightGrows = _findAttrInChildren(element.value!, heightGrowsAttrName);
    const { parentAxis } = _watchParentAxis(element);
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
    // parseProp(`getElement`, true).forEach((getter: any) => {
    //   if (typeof getter !== `function`) return;
    //   getter(element.value);
    // });
  });

  // TODO: Toggle element type based on "tag" prop.
  return (
    <div
      {...props}
      {...{ [columnAttrName]: axis.value === Axis.column }}
      {...{ [rowAttrName]: axis.value === Axis.row }}
      {...{ [stackAttrName]: axis.value === Axis.stack }}
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
function _watchParentAxis(element: Sig<HTMLElement | undefined>) {
  const parentAxis = sig<Axis>(Axis.column);
  createEffect(
    on(
      () => element.value,
      () => {
        if (!exists(element.value)) return;
        if (!exists(element.value.parentElement)) return;
        const parentClassObserver = observeElement(
          element.value.parentElement,
          {
            attributes: true,
            attributeFilter: [columnAttrName, rowAttrName, stackAttrName],
          },
          () => {
            if (!exists(element.value)) return;
            if (!exists(element.value.parentElement)) return;
            // const classList = element.value.parentElement.classList;
            parentAxis.value = (element.value.parentElement as any)[stackAttrName]
              ? Axis.stack
              : (element.value.parentElement as any)[columnAttrName]
                ? Axis.column
                : Axis.row;
          },
        );
        onCleanup(() => {
          parentClassObserver.disconnect();
        });
      },
    ),
  );

  return {
    parentAxis,
  };
}
function _watchParentPadding(element: HTMLElement, shouldWatch: SigGet<boolean>) {
  const parentPaddingLeft = sig(`0px`);
  const parentPaddingTop = sig(`0px`);
  const parentPaddingRight = sig(`0px`);
  const parentPaddingBottom = sig(`0px`);

  createEffect(
    on(
      () => shouldWatch.value,
      () => {
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
      },
    ),
  );

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
  const observer = observeElement(
    element,
    {
      childList: true,
    },
    () => {
      hasMoreThanOneChild.value = element.childNodes.length > 1;
    },
  );
  onCleanup(() => {
    observer.disconnect();
  });
  return hasMoreThanOneChild;
}
function _findAttrInChildren(element: HTMLElement, attr: string) {
  const foundAttr = sig(false);
  const childObservers: MutationObserver[] = [];
  const observer = observeElement(
    element,
    {
      childList: true,
    },
    () => {
      while (childObservers.length > 0) childObservers.pop()?.disconnect();
      const childElementsArray = Array.from(element.childNodes).filter(
        child => child instanceof HTMLElement,
      ) as HTMLElement[];
      function watchAttr() {
        foundAttr.value = childElementsArray.some(
          childElement => (childElement as any)[attr] === true,
        );
      }
      watchAttr();
      childElementsArray.forEach(child => {
        const childObserver = new MutationObserver(watchAttr);
        childObserver.observe(child, {
          attributes: true,
          attributeFilter: [attr],
        });
        childObservers.push(childObserver);
      });
    },
  );
  onCleanup(() => {
    observer.disconnect();
    childObservers.forEach(observer => observer.disconnect());
  });
  return foundAttr;
}
function _watchChildren(element: Sig<HTMLElement | undefined>, shouldLog = false) {
  const maxChildWidthPx = sig(0);
  const maxChildHeightPx = sig(0);
  const maxChildSizeObservers: MutationObserver[] = [];
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

            // Child observers
            maxChildSizeObservers.forEach(observer => observer.disconnect());
            maxChildSizeObservers.splice(0, maxChildSizeObservers.length);

            if (shouldLog) console.log(`childElementsArray.length`, childElementsArray.length);
            watchMaxChildSize();
            function watchMaxChildSize() {
              let maxWidth = 0;
              let maxHeight = 0;
              for (const child of childElementsArray) {
                if (shouldLog) console.log(`watchMaxChildSize`);
                const { width, height } = child.getBoundingClientRect();
                maxWidth = Math.max(maxWidth, width);
                maxHeight = Math.max(maxHeight, height);
              }
              maxChildWidthPx.value = maxWidth;
              maxChildHeightPx.value = maxHeight;
            }
            childElementsArray.forEach(child => {
              const maxSizeObserver = new MutationObserver(watchMaxChildSize);
              maxSizeObserver.observe(child, {
                attributes: true,
                attributeFilter: [`style`],
              });
              maxChildSizeObservers.push(maxSizeObserver);
            });
          },
        );
        onCleanup(() => {
          childListObserver.disconnect();
          maxChildSizeObservers.forEach(observer => observer.disconnect());
          maxChildSizeObservers.splice(0, maxChildSizeObservers.length);
        });
      },
    ),
  );
  return {
    element,
    maxChildWidthPx,
    maxChildHeightPx,
  };
}
