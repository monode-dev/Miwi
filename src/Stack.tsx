import { Box, BoxProps } from "./Box";

export function Stack(props: BoxProps & { axis?: never}) {
  return (
    <Box axis={$Axis.stack} {...props}>
      {props.children}
    </Box>
  );
}
