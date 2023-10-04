import { Box, BoxProps, grow } from './Box'
import { compute, exists } from './utils'
import { Row } from './Row'
import { Txt } from './Txt'

export function Label(
  props: {
    label?: string
    hint?: boolean
  } & BoxProps,
) {
  const shouldShowLabel = compute(() => exists(props.label) && props.label.length > 0)

  return shouldShowLabel.value ? (
    <Box width={grow()} axis={$Axis.row} padBetween={0.25} align={$Align.topLeft} {...props}>
      <Txt hint={props.hint ?? false}>{props.label}:</Txt>
      {props.children}
    </Box>
  ) : (
    props.children
  )
}
