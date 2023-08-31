import { grow, Box } from "./Box";
export function Body(props) {
    return (<Box width={grow()} height={grow()} axis={$Axis.column} align={$Align.topCenter} textColor={$theme.colors.text} scale={1} pad={1} overflowY={$Overflow.scroll} overflowX={$Overflow.crop} {...props}>
      {props.children}
    </Box>);
}
