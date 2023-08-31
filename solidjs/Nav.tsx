import { Component, For, JSX } from "solid-js";
import { computed, signal, sessionStore } from "./utils";
import { gsap } from "gsap";
import { Box } from "./Box";
import { OfflineWarning } from "./OfflineWarning";

// SECTION: Transitions
export interface PageTransition {
  enter: (el: Element, done: () => void) => void;
  leave: (el: Element, done: () => void) => void;
}
function transitionFrom(options: gsap.TweenVars): PageTransition {
  return {
    enter(el, done) {
      gsap.from(el, {
        ...options,
        onComplete: done,
      });
    },
    leave(el, done) {
      gsap.to(el, {
        ...options,
        onComplete: done,
      });
    },
  };
}
export const pageTransitions = {
  from: transitionFrom,
  slideUp: (options: gsap.TweenVars = {}) =>
    transitionFrom({
      duration: 0.15,
      opacity: 0,
      y: `50vh`,
      ease: "power1.out",

      // Allow overrides
      ...options,
    }),
  fadeIn: (options: gsap.TweenVars = {}) =>
    transitionFrom({
      duration: 0.15,
      opacity: 0,
      ease: "power1.out",

      // Allow overrides
      ...options,
    }),
  none: {
    enter(el, done) {
      done();
    },
    leave(el, done) {
      done();
    },
  } satisfies PageTransition,
};

// SECTION: Nav
export interface NavPage<T> {
  component: Component<T>;
  transitions: PageTransition;
}
export const useNav = sessionStore("navigator", () => {
  const openedPages = signal<(NavPage<any> & { props: any })[]>([]);
  function popPage() {
    openedPages.value = openedPages.value.slice(0, -1);
  }

  return {
    notchHeight: signal(`0px`),
    openedPages: computed(() => openedPages.value),
    pushPage<T>(newPage: Component<T>, props: T | {} = {}) {
      openedPages.value = [
        ...openedPages.value,
        {
          component: newPage,
          transitions: (newPage as any).transitions ?? pageTransitions.none,
          props,
        },
      ];
    },
    popPage,
    currentPage: computed(
      () => openedPages.value[openedPages.value.length - 1],
    ),
  };
});

export function pushPage<T>(newPage: Component<T>, props: T | {} = {}) {
  const nav = useNav();
  nav.pushPage(newPage, props);
}

export function popPage() {
  const nav = useNav();
  nav.popPage();
}

// SECTION: UI
const pageIdTag = `_miwi_page_`;
function pageWrapperStyle(zIndex: number): JSX.CSSProperties {
  return {
    background: "transparent",
    width: "100%",
    height: "100%",
    top: "0px",
    left: "0px",
    position: "absolute",
    [`z-index`]: zIndex,
  };
}
export function Nav() {
  const nav = useNav();
  return (
    <Box
      sty={{
        width: `100%`,
        height: `100%`,
      }}
    >
      {/* Openned Pages */}
      {/* <transition-group
        appear
        :css="false"
        @enter="onPageEnter"
        @leave="onPageLeave"
      > */}
      <For each={nav.openedPages.value}>
        {(page, index) => (
          <div
            id={`${pageIdTag}${index()}`}
            style={pageWrapperStyle(10 + index() * 10)}
          >
            <page.component {...page.props} />
          </div>
        )}
      </For>
      {/* </transition-group> */}

      {/* Offline warning is infront of all pages. */}
      <OfflineWarning />
    </Box>
  );
}
