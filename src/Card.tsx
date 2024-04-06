import { BoxProps } from "./Box/Box";
import { Column } from "./Column";

export function Card(props: BoxProps) {
  return (
    <Column
      fill={$theme.colors.accent}
      cornerRadius={0.5}
      shadowSize={1.5}
      shadowDirection={$Align.bottomRight}
      alignCenter
      foreground={$theme.colors.text}
      scale={1}
      pad={1}
      overrideProps={props}
    >
      {props.children}
    </Column>
  );
}
