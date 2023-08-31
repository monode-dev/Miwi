import { Box } from "./Box";
export function Stack(props) {
    return (<Box axis={$Axis.stack} {...props}>
      {props.children}
    </Box>);
}
