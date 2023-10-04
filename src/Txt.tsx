import { Box, BoxProps } from './Box'
import { AllowOne, compute } from './utils'

export function Txt(
  props: AllowOne<{
    heading: boolean
    title: boolean
  }> & {
    hint?: boolean
  } & {
    singleLine?: boolean
  } & BoxProps,
) {
  const scale = compute(() => props.scale ?? (props.heading ? 1.5 : props.title ? 1.25 : undefined))
  const overflowX = props.overflowX ?? (props.singleLine ?? false ? $Overflow.crop : $Overflow.wrap)

  return (
    <Box
      textColor={props.hint ? $theme.colors.hint : undefined}
      scale={scale.value}
      align={$Align.topLeft}
      overflowY={$Overflow.forceStretchParent}
      {...props}
      overflowX={overflowX === $Overflow.crop ? $Overflow.forceStretchParent : overflowX}
    >
      {overflowX === $Overflow.crop ? (
        <div
          style="
          position: absolute;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;"
        >
          {props.children}
        </div>
      ) : (
        props.children
      )}
    </Box>
  )
}
