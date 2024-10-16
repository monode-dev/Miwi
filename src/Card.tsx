import { BoxProps } from "./Box/Box";
import { Column } from "./Column";
import { theme } from "./theme";

export function Card(props: BoxProps) {
  return (
    <Column
      fill={theme.palette.accent}
      cornerRadius={0.5}
      shadowSize={1.5}
      shadowDirection={$Align.bottomRight}
      alignCenter
      stroke={theme.palette.text}
      scale={1}
      pad={1}
      overrideProps={props}
    >
      {props.children}
    </Column>
  );
}
