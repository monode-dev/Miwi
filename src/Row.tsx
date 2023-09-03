import { Box, BoxProps } from './Box'

export function Row(props: BoxProps & { axis?: never }) {
  return (
    <Box axis={$Axis.row} {...props}>
      {props.children}
    </Box>
  )
}
