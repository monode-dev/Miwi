import { gsap } from 'gsap'
import { Sig } from './utils'
import { onMount, createEffect, JSX } from 'solid-js'
import { Box, BoxProps, grow } from './Box'
import { Txt } from './Txt'
import { Row } from './Row'

export function TabView(
  props: BoxProps & {
    selectedTabSig: Sig<number>
    tab0?: JSX.Element
    tab1?: JSX.Element
    tab2?: JSX.Element
  },
) {
  function selectTab(newTab: number) {
    if (newTab === props.selectedTabSig.value) {
      return
    }
    props.selectedTabSig.value = newTab
  }

  // TODO: WHAT IS THIS??
  //const tabBodiesParent = ref<ComponentPublicInstance | null>(null);
  let tabBodiesParent: HTMLElement | undefined = undefined

  createEffect(() => {
    const newTab = props.selectedTabSig.value
    const newTabPosition = [`100vw`, 0, `-100vw`][newTab]
    if (tabBodiesParent) {
      // TODO: UPDATE THIS
      gsap.to(tabBodiesParent, {
        duration: 0.15,
        x: newTabPosition,
        ease: 'power1.out',
      })
    }
  })

  // Swipe gesture
  onMount(() => {
    let swipeStartTime = 0
    let swipeStartX = 0
    let swipeStartY = 0
    let lastSwipeX = 0
    let lastSwipeY = 0
    tabBodiesParent?.addEventListener('touchstart', (e: TouchEvent) => {
      const touch = e.touches[0]
      swipeStartX = touch!.clientX
      swipeStartY = touch!.clientY
      lastSwipeX = touch!.clientX
      lastSwipeY = touch!.clientY
      swipeStartTime = Date.now()
    })
    tabBodiesParent?.addEventListener('touchmove', (e: TouchEvent) => {
      const touch = e.touches[0]
      lastSwipeX = touch!.clientX
      lastSwipeY = touch!.clientY
    })
    tabBodiesParent?.addEventListener('touchend', (e: TouchEvent) => {
      const deltaX = lastSwipeX - swipeStartX
      const deltaY = lastSwipeY - swipeStartY
      const deltaTime = Date.now() - swipeStartTime
      const velocityX = deltaX / deltaTime
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > 50 &&
        Math.abs(velocityX) > 0.2
      ) {
        // e.preventDefault();
        if (deltaX > 0) {
          selectTab(Math.max(0, props.selectedTabSig.value - 1))
        } else {
          selectTab(Math.min(2, props.selectedTabSig.value + 1))
        }
      }
    })
  })

  return (
    <Row
      ref={tabBodiesParent}
      width="300%"
      onClick={props.onClick}
      heightGrows
      alignTopCenter
      overflowX={$Overflow.crop}
      overrideProps={props}
    >
      <Box widthGrows heightGrows overflowX={$Overflow.crop}>
        {props.tab0 ?? <Txt hint>Tab 0</Txt>}
      </Box>
      <Box widthGrows heightGrows overflowX={$Overflow.crop}>
        {props.tab1 ?? <Txt hint>Tab 1</Txt>}
      </Box>
      <Box widthGrows heightGrows overflowX={$Overflow.crop}>
        {props.tab2 ?? <Txt hint>Tab 2</Txt>}
      </Box>
    </Row>
  )
}
