import { BoxProps } from "./Box/Box";
import { Column } from "./Column";
import { theme } from "./theme";

export function Body(props: BoxProps) {
  return (
    <Column
      widthGrows
      maxWidth={30}
      heightGrows
      alignTopCenter
      preventClickPropagation
      stroke={theme.palette.text}
      scale={1}
      pad={1}
      overflowY={$Overflow.scroll}
      overflowX={$Overflow.crop}
      overrideProps={props}
    >
      {props.children}
    </Column>
  );
}
