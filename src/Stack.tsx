import { Box, BoxProps } from './Box/Box'

export function Stack(props: BoxProps) {
  return (
    <Box stack overrideProps={props}>
      {props.children}
    </Box>
  )
}
