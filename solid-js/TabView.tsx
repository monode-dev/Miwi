import { gsap } from "gsap";
import { Signal } from "./utils";
import { onMount, createEffect, JSX } from "solid-js";
import { Box, BoxProps, grow } from "./Box";
import { Row } from "./Row";
import { Text } from "./Text";

export function TabView(
  props: BoxProps & {
    selectedTab: Signal<number>;
    tab0?: JSX.Element;
    tab1?: JSX.Element;
    tab2?: JSX.Element;
  },
) {
  function selectTab(newTab: number) {
    if (newTab === props.selectedTab.value) {
      return;
    }
    props.selectedTab.value = newTab;
  }

  // TODO: WHAT IS THIS??
  //const tabBodiesParent = ref<ComponentPublicInstance | null>(null);
  let tabBodiesParent: HTMLElement | undefined = undefined;

  createEffect(() => {
    const newTab = props.selectedTab.value;
    const newTabPosition = [`100vw`, 0, `-100vw`][newTab];
    if (tabBodiesParent) {
      // TODO: UPDATE THIS
      gsap.to(tabBodiesParent, {
        duration: 0.15,
        x: newTabPosition,
        ease: "power1.out",
      });
    }
  });

  // Swipe gesture
  onMount(() => {
    let swipeStartTime = 0;
    let swipeStartX = 0;
    let swipeStartY = 0;
    let lastSwipeX = 0;
    let lastSwipeY = 0;
    tabBodiesParent?.addEventListener("touchstart", (e: TouchEvent) => {
      const touch = e.touches[0];
      swipeStartX = touch.clientX;
      swipeStartY = touch.clientY;
      lastSwipeX = touch.clientX;
      lastSwipeY = touch.clientY;
      swipeStartTime = Date.now();
    });
    tabBodiesParent?.addEventListener("touchmove", (e: TouchEvent) => {
      const touch = e.touches[0];
      lastSwipeX = touch.clientX;
      lastSwipeY = touch.clientY;
    });
    tabBodiesParent?.addEventListener("touchend", (e: TouchEvent) => {
      const deltaX = lastSwipeX - swipeStartX;
      const deltaY = lastSwipeY - swipeStartY;
      const deltaTime = Date.now() - swipeStartTime;
      const velocityX = deltaX / deltaTime;
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > 50 &&
        Math.abs(velocityX) > 0.2
      ) {
        // e.preventDefault();
        if (deltaX > 0) {
          selectTab(Math.max(0, props.selectedTab.value - 1));
        } else {
          selectTab(Math.min(2, props.selectedTab.value + 1));
        }
      }
    });
  });

  return (
    <Row
      ref={tabBodiesParent}
      width="300%"
      onClick={props.onClick}
      sty={{
        height: grow(),
        align: $Align.topCenter,
        overflowX: $Overflow.crop,
        ...props.sty,
      }}
    >
      <Box
        sty={{
          width: grow(),
          height: grow(),
          overflowX: $Overflow.crop,
        }}
      >
        {props.tab0 ?? <Text hint>Tab 0</Text>}
      </Box>
      <Box
        sty={{
          width: grow(),
          height: grow(),
          overflowX: $Overflow.crop,
        }}
      >
        {props.tab1 ?? <Text hint>Tab 1</Text>}
      </Box>
      <Box
        sty={{
          width: grow(),
          height: grow(),
          overflowX: $Overflow.crop,
        }}
      >
        {props.tab2 ?? <Text hint>Tab 2</Text>}
      </Box>
    </Row>
  );
}
