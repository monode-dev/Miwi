import { Box, BoxProps } from './Box'
import { compute } from './utils'

export function Button(
  props: {
    round?: boolean
    pill?: boolean
    raised?: boolean
    outlined?: boolean
  } & BoxProps,
) {
  const shapeSty = compute(() => {
    if (props.round) {
      return { cornerRadius: `100%` }
    } else if (props.pill) {
      return { cornerRadius: 1, pad: 0.5, padAroundX: 0.75 }
    } else {
      return { cornerRadius: 0.25, pad: 0.5 }
    }
  })
  const colorSty = compute(() =>
    props.outlined
      ? {
          background: $theme.colors.accent,
          textColor: $theme.colors.primary,
          outlineColor: `currentColor`,
          outlineSize: 0.125,
        }
      : {
          background: $theme.colors.primary,
          textColor: $theme.colors.accent,
        },
  )
  const shadowSty = compute(() =>
    props.raised ? { shadowSize: 1, shadowDirection: $Align.bottomRight } : {},
  )
  return (
    <Box
      align={$Align.center}
      axis={$Axis.row}
      {...shapeSty.value}
      {...colorSty.value}
      {...shadowSty.value}
      {...props}
    >
      {props.children}
    </Box>
  )
}
