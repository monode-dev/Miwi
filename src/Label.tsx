import { BoxProps } from "./Box/Box";
import { useFormula, exists } from "./utils";
import { Row } from "./Row";
import { Txt } from "./Txt";

export function Label(
  props: {
    label?: string;
    hint?: boolean;
    labelBackground?: string;
    labelWidth?: number | string;
  } & BoxProps,
) {
  const shouldShowLabel = useFormula(() => exists(props.label) && props.label.length > 0);

  return shouldShowLabel.value ? (
    <Row widthGrows padBetween={0.25} alignTopLeft overrideProps={props}>
      <Txt
        singleLine
        hint={props.hint ?? false}
        width={props.labelWidth ?? `fit-content`}
        background={props.labelBackground}
      >
        {props.label}:
      </Txt>
      {props.children}
    </Row>
  ) : (
    props.children
  );
}
