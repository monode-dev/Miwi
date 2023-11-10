import { Box, BoxProps } from './Box'

export function Row(props: BoxProps) {
  return (
    <Box axis={$Axis.row} overrideProps={props}>
      {props.children}
    </Box>
  )
}
