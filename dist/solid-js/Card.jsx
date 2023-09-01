import { Box } from "./Box";
export function Card(props) {
    return (<Box background={$theme.colors.accent} cornerRadius={0.5} shadowSize={1.5} shadowDirection={$Align.bottomRight} axis={$Axis.column} align={$Align.center} textColor={$theme.colors.text} scale={1} pad={1} {...props}>
      {props.children}
    </Box>);
}
