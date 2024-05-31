import { Box, BoxProps } from "./Box/Box";
import { useFormula, exists } from "./utils";
import { Row } from "./Row";
import { Txt } from "./Txt";
import { Match, Switch } from "solid-js";
import { Icon } from "./Icon";

export function Label(
  props: {
    label?: string;
    icon?: string;
    hint?: boolean;
    labelBackground?: string;
    labelWidth?: number | string;
  } & BoxProps,
) {
  const shouldShowLabel = useFormula(() => exists(props.label) && props.label.length > 0);

  return shouldShowLabel.value ? (
    <Row
      widthGrows
      padBetween={0.25}
      alignTopLeft
      stroke={props.hint ? $theme.colors.hint : undefined}
      overrideProps={props}
    >
      <Switch>
        <Match when={exists(props.icon)}>
          <Box fill={props.labelBackground}>
            <Icon iconPath={props.icon!} scale={props.labelWidth ?? undefined} />
          </Box>
        </Match>
        <Match when={exists(props.label)}>
          <Txt singleLine width={props.labelWidth ?? `fit-content`} fill={props.labelBackground}>
            {props.label}:
          </Txt>
        </Match>
      </Switch>
      {props.children}
    </Row>
  ) : (
    props.children
  );
}
