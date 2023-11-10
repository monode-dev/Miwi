import { Box, BoxProps } from './Box'

export function Row(props: BoxProps) {
  return (
    <Box row overrideProps={props}>
      {props.children}
    </Box>
  )
}
