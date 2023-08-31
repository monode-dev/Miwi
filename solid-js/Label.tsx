import { BoxProps } from "./Box";
import { computed, exists } from "./utils";
import { Row } from "./Row";
import { Text } from "./Text";

export function Label(
  props: {
    label?: string;
    hint?: boolean;
  } & BoxProps,
) {
  const shouldShowLabel = computed(
    () => exists(props.label) && props.label.length > 0,
  );

  return shouldShowLabel.value ? (
    <Row
      sty={{
        width: `1f`,
        padBetween: 0.25,
        align: $Align.topLeft,
        ...props.sty,
      }}
    >
      <Text hint={props.hint ?? false}>{props.label}:</Text>
      {props.children}
    </Row>
  ) : (
    props.children
  );
}
