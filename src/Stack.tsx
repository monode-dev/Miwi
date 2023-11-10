import { Box, BoxProps } from './Box'

export function Stack(props: BoxProps) {
  return (
    <Box axis={$Axis.stack} overrideProps={props}>
      {props.children}
    </Box>
  )
}
