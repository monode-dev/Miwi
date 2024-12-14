import { BoxProps } from "./Box/Box";
import { Body } from "./Body";
import { pagePadding } from "./SimplePage";

export function SimpleBody(props: BoxProps) {
  return (
    <Body
      minWidth={10}
      maxWidth={25}
      padTop={0}
      padAround={pagePadding}
      padBetween={1}
      overrideProps={props}
    >
      {props.children}
    </Body>
  );
}
