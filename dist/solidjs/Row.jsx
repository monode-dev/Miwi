import { Box } from "./Box";
export function Row(props) {
    return (<Box axis={$Axis.row} {...props}>
      {props.children}
    </Box>);
}
