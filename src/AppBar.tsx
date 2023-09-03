import { JSX, Show } from 'solid-js'
import { Box, BoxProps, grow, parseSty } from './Box'
import { computed } from './utils'
import { useNav } from './Nav'
import { Icon } from './Icon'
import { mdiArrowLeft } from '@mdi/js'
import { Row } from './Row'
import { Column } from './Column'

export function AppBar(
  props: {
    left?: JSX.Element
    right?: JSX.Element
    bottom?: JSX.Element
  } & {
    shouldShowBackArrowWhenApplicable?: boolean
  } & BoxProps,
) {
  const nav = useNav()
  const sty = computed(() =>
    parseSty(props, {
      background: $theme.colors.primary,
    }),
  )
  return (
    <Column width={grow()}>
      {/* Notch Spacer */}
      <Box
        width={grow()}
        height={`env(safe-area-inset-top)`}
        background={sty.value.background}
        zIndex={2}
      />

      {/* AppBar */}
      <Column
        width={grow()}
        background={sty.value.background}
        shadowSize={1.25}
        shadowDirection={$Align.bottomCenter}
        align={$Align.bottomCenter}
        textColor={$theme.colors.accent}
        zIndex={1}
        sty={sty.value}
      >
        {/* Main Row */}
        <Row width={grow()} pad={0.5} scale={1.5} shouldLog>
          {/* Left */}
          <Row width={grow()} align={$Align.centerLeft}>
            <Show
              when={
                (props.shouldShowBackArrowWhenApplicable ?? true) &&
                nav.openedPages.value.length > 1
              }
            >
              <Icon onClick={nav.popPage} size={1.25} iconPath={mdiArrowLeft} />
            </Show>
            {props.left}
          </Row>

          {/* Title / Center */}
          <Row width={grow(3)} align={$Align.center} textIsBold={true}>
            {props.children}
          </Row>

          {/* Right */}
          <Row width={grow()} align={$Align.centerRight}>
            {props.right}
          </Row>
        </Row>

        {/* Bottom Row */}
        <Row width={grow()} scale={1}>
          {props.bottom}
        </Row>
      </Column>
    </Column>
  )
}
