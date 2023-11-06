import { Box, BoxProps } from './Box'

export function Page(props: BoxProps) {
  return (
    <Box
      asWideAsParent
      asTallAsParent
      background={$theme.colors.pageBackground}
      alignTopCenter
      overflowX={$Overflow.crop}
      overflowY={$Overflow.crop}
      preventClickPropagation
      {...props}
    >
      {props.children}
    </Box>
  )
}
