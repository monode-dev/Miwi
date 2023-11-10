import { Box, BoxProps } from './Box'

export function Column(props: BoxProps) {
  return (
    <Box column overrideProps={props}>
      {props.children}
    </Box>
  )
}
