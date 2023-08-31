import { Box } from "./Box";
export function Column(props) {
    return (<Box axis={$Axis.column} {...props}>
      {props.children}
    </Box>);
}
