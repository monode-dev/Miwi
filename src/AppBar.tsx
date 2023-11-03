import { JSX, Show } from 'solid-js'
import { Box, BoxProps, grow, parseSty } from './Box'
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
  return (
    <Column widthGrows>
      {/* Notch Spacer */}
      <Box
        widthGrows
        height={`env(safe-area-inset-top)`}
        background={props.background ?? $theme.colors.primary}
        zIndex={2}
      />

      {/* AppBar */}
      <Column
        widthGrows
        shouldLog
        background={props.background ?? $theme.colors.primary}
        shadowSize={1.25}
        shadowDirection={$Align.bottomCenter}
        alignBottomCenter
        textColor={$theme.colors.accent}
        zIndex={1}
        {...props}
      >
        {/* Main Row */}
        <Row widthGrows pad={0.5} scale={1.5}>
          {/* Left */}
          <Row widthGrows alignCenterLeft>
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
          <Row width={grow(3)} alignCenter textIsBold={true}>
            {props.children}
          </Row>

          {/* Right */}
          <Row widthGrows alignCenterRight scale={1.25}>
            {props.right}
          </Row>
        </Row>

        {/* Bottom Row */}
        <Row widthGrows scale={1}>
          {props.bottom}
        </Row>
      </Column>
    </Column>
  )
}
