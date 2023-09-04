import { gsap } from 'gsap'
import { Box, BoxProps, grow } from './Box'
import { Row } from './Row'
import { createEffect } from 'solid-js'
import { Sig, exists } from './utils'
import { Column } from './Column'

export function TabButtons(
  props: BoxProps & {
    selectedTabSig: Sig<number>
    labels?: [string, string, string]
  },
) {
  const labels = props.labels ?? ['Tab 0', 'Tab 1', 'Tab 2']
  const tabButtonWidth = 5
  let tab0Ref: HTMLElement | undefined = undefined
  let tab1Ref: HTMLElement | undefined = undefined
  let tab2Ref: HTMLElement | undefined = undefined
  let tabUnderline: HTMLElement | undefined = undefined

  function selectTab(newTab: number) {
    if (newTab === props.selectedTabSig.value) return
    props.selectedTabSig.value = newTab
  }

  createEffect(() => {
    if (exists(tabUnderline)) {
      // Find new position
      const newUnderlinePosition = [
        (tab1Ref?.offsetLeft ?? 0) - (tab2Ref?.offsetLeft ?? 0),
        0,
        (tab2Ref?.offsetLeft ?? 0) - (tab1Ref?.offsetLeft ?? 0),
      ][props.selectedTabSig.value]

      // console.log(getComputedStyle(tabUnderline));

      // Animate
      gsap.to(tabUnderline, {
        duration: 0.15,
        x: newUnderlinePosition,
        ease: 'power1.out',
      })
    }
  })
  return (
    <Column>
      <Row
        onClick={props.onClick}
        sty={{
          width: grow(),
          alignX: $Align.spaceAround,
          ...props.sty,
        }}
      >
        <Box width={tabButtonWidth} ref={el => (tab0Ref = el)} onClick={() => selectTab(0)}>
          {labels[0]}
        </Box>
        <Box width={tabButtonWidth} ref={el => (tab1Ref = el)} onClick={() => selectTab(1)}>
          {labels[1]}
        </Box>
        <Box width={tabButtonWidth} ref={el => (tab2Ref = el)} onClick={() => selectTab(2)}>
          {labels[2]}
        </Box>
      </Row>
      <Box
        sty={{
          width: grow(),
          height: 0.375,
          axis: $Axis.stack,
        }}
      >
        <Box
          sty={{
            width: grow(),
            height: 0.375,
            axis: $Axis.row,
            alignX: $Align.spaceAround,
            alignY: $Align.end,
          }}
        >
          <Box sty={{ width: tabButtonWidth }} />
          <Box
            ref={el => (tabUnderline = el)}
            sty={{
              width: tabButtonWidth,
              height: 0.125,
              background: $theme.colors.sameAsText,
            }}
          />
          <Box sty={{ width: tabButtonWidth }} />
        </Box>
        <Box
          sty={{
            width: grow(),
            height: 0.375,
            axis: $Axis.row,
            alignX: $Align.spaceAround,
            alignY: $Align.end,
          }}
        >
          <Box onClick={() => selectTab(0)} sty={{ width: tabButtonWidth, height: grow() }} />
          <Box onClick={() => selectTab(1)} sty={{ width: tabButtonWidth, height: grow() }} />
          <Box onClick={() => selectTab(2)} sty={{ width: tabButtonWidth, height: grow() }} />
        </Box>
      </Box>
    </Column>
  )
}
