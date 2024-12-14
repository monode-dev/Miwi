import { Box, BoxProps, theme } from "./miwi";

export function HorizontalDivider(props: BoxProps) {
  return (
    <Box
      widthGrows
      height={0.125}
      fill={theme.palette.hint}
      overrideProps={props}
    />
  );
}
