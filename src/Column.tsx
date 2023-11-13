import { Box, BoxProps } from './Box/Box'

export function Column(props: BoxProps) {
  return (
    <Box column overrideProps={props}>
      {props.children}
    </Box>
  )
}
