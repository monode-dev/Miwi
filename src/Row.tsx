import { Box, BoxProps } from './Box/Box'

export function Row(props: BoxProps) {
  return (
    <Box row overrideProps={props}>
      {props.children}
    </Box>
  )
}
