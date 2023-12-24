import { Box, BoxProps } from './Box/Box'
import { sizeScaleCssVarName } from './theme'
import { AllowOne, compute } from './utils'

export function Txt(
  props: AllowOne<{
    h1: boolean
    h2: boolean
  }> & {
    hint?: boolean
  } & {
    singleLine?: boolean
  } & BoxProps,
) {
  const overflowX = compute(
    () => props.overflowX ?? (props.singleLine ?? false ? $Overflow.crop : $Overflow.wrap),
  )

  return (
    <Box
      textColor={props.hint ? $theme.colors.hint : undefined}
      scale={props.scale ?? (props.h1 ? 1.5 : props.h2 ? 1.25 : undefined)}
      alignTopLeft
      overflowY={$Overflow.forceStretchParent}
      overrideProps={props}
      overrideOverrides={{
        overflowX: overflowX.value,
      }}
      // isFlexDisplay={overflowX.value === $Overflow.crop ? false : undefined}
    >
      {props.children}
    </Box>
  )
}
