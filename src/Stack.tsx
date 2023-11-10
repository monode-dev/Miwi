import { Box, BoxProps } from './Box'

export function Stack(props: BoxProps) {
  return (
    <Box stack overrideProps={props}>
      {props.children}
    </Box>
  )
}
