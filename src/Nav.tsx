import { Component, For, JSX, Show, onMount } from 'solid-js'
import { computed, signal, sessionStore, Signal, watchDeps, exists } from './utils'
import { gsap } from 'gsap'
import { Box } from './Box'
import { OfflineWarning } from './OfflineWarning'

// SECTION: Transitions
export interface PageTransition {
  enter: (el: Element) => Promise<void>
  leave: (el: Element) => Promise<void>
}
function transitionFrom(options: gsap.TweenVars): PageTransition {
  return {
    enter(el) {
      return new Promise(resolve => {
        gsap.from(el, {
          ...options,
          onComplete: resolve,
        })
      })
    },
    leave(el) {
      return new Promise(resolve => {
        gsap.to(el, {
          ...options,
          onComplete: resolve,
        })
      })
    },
  }
}
export const pageTransitions = {
  from: transitionFrom,
  slideUp: (options: gsap.TweenVars = {}) =>
    transitionFrom({
      duration: 0.15,
      opacity: 0,
      y: `50vh`,
      ease: 'power1.out',

      // Allow overrides
      ...options,
    }),
  fadeIn: (options: gsap.TweenVars = {}) =>
    transitionFrom({
      duration: 0.15,
      opacity: 0,
      ease: 'power1.out',

      // Allow overrides
      ...options,
    }),
  none: {
    enter() {
      return new Promise(resolve => resolve())
    },
    leave() {
      return new Promise(resolve => resolve())
    },
  } satisfies PageTransition,
}
type PageComponent<T> = Component<T> & { readonly transitions?: PageTransition }
export function setPageTransitions<T>(
  page: Component<T>,
  transitions: PageTransition,
): PageComponent<T> {
  Object.defineProperties(page, {
    transitions: {
      value: transitions,
      writable: false,
    },
  })
  return page as PageComponent<T>
}

// SECTION: Nav
type PageToOpen<T = any> = {
  component: Component<T>
  props: T
  transitions: PageTransition
}
type PageTransitionRecord =
  | {
      page: PageToOpen
      inOrOut: `in`
    }
  | {
      page: undefined
      inOrOut: `out`
    }
export const useNav = sessionStore('navigator', () => {
  const _pagesInTransitions = signal<PageTransitionRecord[]>([])

  return {
    openedPages: signal<PageToOpen[]>([]),
    _pagesInTransitions,
    pagesAreTransitioning: computed(() => _pagesInTransitions.value.length > 0),
    pushPage<T>(newPage: PageComponent<T>, props: T) {
      _pagesInTransitions.value = [
        ..._pagesInTransitions.value,
        {
          page: {
            component: newPage,
            props,
            transitions: newPage.transitions ?? pageTransitions.none,
          },
          inOrOut: `in`,
        },
      ]
    },
    popPage() {
      _pagesInTransitions.value = [
        ..._pagesInTransitions.value,
        {
          page: undefined,
          inOrOut: `out`,
        },
      ]
      // openedPages.value = openedPages.value.slice(0, -1)
    },
  }
})

export function pushPage<T>(newPage: PageComponent<T>, props: T) {
  const nav = useNav()
  nav.pushPage(newPage, props)
}

export function popPage() {
  const nav = useNav()
  nav.popPage()
}

// SECTION: UI
const pageIdTag = `_miwi_page_`
function pageWrapperStyle(zIndex: number): JSX.CSSProperties {
  return {
    background: 'transparent',
    width: '100%',
    height: '100%',
    top: '0px',
    left: '0px',
    position: 'absolute',
    [`z-index`]: zIndex,
  }
}
export function Nav(props: { isOnline: Signal<boolean> }) {
  // let pageHasAnimatedIn: boolean[] = []
  const nav = useNav()
  let aPageTransitionIsRunning = false
  watchDeps([nav._pagesInTransitions], async () => {
    if (aPageTransitionIsRunning) return
    aPageTransitionIsRunning = true
    await pageTransitioner()
    aPageTransitionIsRunning = false
  })
  async function pageTransitioner() {
    while (nav._pagesInTransitions.value.length > 0) {
      const transition = nav._pagesInTransitions.value[0]!
      if (transition.inOrOut === `in`) {
        // pageHasAnimatedIn.push(false)
        nav.openedPages.value = [...nav.openedPages.value, transition.page]
        // await run transition
      } else {
        // await run transition
        nav.openedPages.value = nav.openedPages.value.slice(0, -1)
        // pageHasAnimatedIn.pop()
      }
      nav._pagesInTransitions.value = nav._pagesInTransitions.value.slice(1)
    }
  }
  return (
    <Box
      sty={{
        width: `100%`,
        height: `100%`,
      }}
    >
      {/* Openned Pages */}
      <For each={nav.openedPages.value}>
        {(page, index) => (
          <div id={`${pageIdTag}${index()}`} style={pageWrapperStyle(10 + index() * 10)}>
            <_PageWrapper transitions={page.transitions}>
              <page.component {...page.props} />
            </_PageWrapper>
          </div>
        )}
      </For>

      {/* Offline warning is infront of all pages. */}
      <OfflineWarning isOnline={props.isOnline} />

      {/* Disable interaction durring page transitions */}
      <Show when={nav.pagesAreTransitioning.value}>
        <div
          style={{
            width: `100%`,
            height: `100%`,
            position: `absolute`,
            'pointer-events': `none`,
            'z-index': 999999999,
          }}
        />
      </Show>
    </Box>
  )
}

function _PageWrapper(props: { children: JSX.Element; transitions: PageTransition }) {
  let element: HTMLDivElement | undefined = undefined
  onMount(() => {
    if (exists(element)) {
      props.transitions.enter(element)
    }
  })
  return (
    <div
      ref={el => (element = el)}
      style={{
        width: `100%`,
        height: `100%`,
      }}
    >
      {props.children}
    </div>
  )
}
