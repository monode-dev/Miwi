import { gsap } from 'gsap'
import { Box, BoxProps } from './Box/Box'
import { Row } from './Row'
import { createEffect, onMount } from 'solid-js'
import { Sig, exists } from './utils'
import { Column } from './Column'
import { Stack } from './Stack'

export function TabButtons(
  props: BoxProps & {
    selectedTab: Sig<number>
    labels?: [string, string, string]
  },
) {
  const tabButtonWidth = 5
  let tab1Ref: HTMLElement | undefined = undefined
  let tab2Ref: HTMLElement | undefined = undefined
  let tabUnderline: HTMLElement | undefined = undefined

  function selectTab(newTab: number) {
    if (newTab === props.selectedTab.value) return
    props.selectedTab.value = newTab
  }

  // Animate Underline
  onMount(() => {
    createEffect(() => {
      if (exists(tabUnderline)) {
        // Find new position
        const newUnderlinePosition = [
          (tab1Ref?.offsetLeft ?? 0) - (tab2Ref?.offsetLeft ?? 0),
          0,
          (tab2Ref?.offsetLeft ?? 0) - (tab1Ref?.offsetLeft ?? 0),
        ][props.selectedTab.value]

        // Animate
        gsap.to(tabUnderline, {
          duration: 0.15,
          x: newUnderlinePosition,
          ease: 'power1.out',
        })
      }
    })
  })

  // Render
  return (
    <Column>
      <Row onClick={props.onClick} widthGrows spaceAroundX overrideProps={props}>
        <Box width={tabButtonWidth} onClick={() => selectTab(0)}>
          {props.labels?.[0] ?? 'Tab 0'}
        </Box>
        <Box width={tabButtonWidth} getElement={el => (tab1Ref = el)} onClick={() => selectTab(1)}>
          {props.labels?.[1] ?? 'Tab 1'}
        </Box>
        <Box width={tabButtonWidth} getElement={el => (tab2Ref = el)} onClick={() => selectTab(2)}>
          {props.labels?.[2] ?? 'Tab 2'}
        </Box>
      </Row>
      <Stack widthGrows height={0.375}>
        <Row widthGrows height={0.375} spaceAroundX alignBottom>
          <Box width={tabButtonWidth} />
          <Box
            getElement={el => {
              tabUnderline = el
              console.log('tabUnderline', el)
            }}
            width={tabButtonWidth}
            height={0.125}
            background={$theme.colors.sameAsText}
          />
          <Box width={tabButtonWidth} />
        </Row>
        <Row widthGrows height={0.375} spaceAroundX alignBottom>
          <Box onClick={() => selectTab(0)} width={tabButtonWidth} heightGrows />
          <Box onClick={() => selectTab(1)} width={tabButtonWidth} heightGrows />
          <Box onClick={() => selectTab(2)} width={tabButtonWidth} heightGrows />
        </Row>
      </Stack>
    </Column>
  )
}
