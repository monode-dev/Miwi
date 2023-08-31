import { Box } from "./Box";
export function Page(props) {
    return (<Box width={`100%`} height={`100%`} background={$theme.colors.pageBackground} align={$Align.topCenter} overflowX={$Overflow.crop} overflowY={$Overflow.crop} {...props}>
      {props.children}
    </Box>);
}
