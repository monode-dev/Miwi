import { Box, BoxProps } from './Box/Box'

export function Page(props: BoxProps) {
  return (
    <Box
      asWideAsParent
      asTallAsParent
      background={$theme.colors.pageBackground}
      alignCenter
      overflowX={$Overflow.crop}
      overflowY={$Overflow.crop}
      preventClickPropagation
      overrideProps={props}
    >
      {props.children}
    </Box>
  )
}
