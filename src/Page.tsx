import { Box, BoxProps } from './Box'

export function Page(props: BoxProps) {
  return (
    <Box
      width={`100%`}
      height={`100%`}
      background={$theme.colors.pageBackground}
      alignTopCenter
      overflowX={$Overflow.crop}
      overflowY={$Overflow.crop}
      {...props}
    >
      {props.children}
    </Box>
  )
}
