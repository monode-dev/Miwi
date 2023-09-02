

import { Box, BoxProps } from "./Box";

export function Column(props: BoxProps) {
  return (
    <Box axis={$Axis.column} {...props}>
      {props.children}
    </Box>
  );
}
