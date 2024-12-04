import { Box, BoxProps } from "./Box/Box";
import { exists } from "./utils";
import { Row } from "./Row";
import { Txt } from "./Txt";
import { Match, Show, Switch } from "solid-js";
import { Icon } from "./Icon";
import { SIZE_SHRINKS } from "./Box/BoxSize";

/** Label won't use any elements if the label is empty, so feel free to just use this all over the place, and only
 * use it if you need to. */
export function Label(
  props: {
    label?: string;
    icon?: string;
    hint?: boolean;
    labelBackground?: string;
    labelWidth?: number | string;
  } & BoxProps,
) {
  return (
    <Show when={(exists(props.label) && props.label.length > 0) || exists(props.icon)} fallback={props.children}>
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
            <Icon icon={props.icon!} scale={props.labelWidth ?? undefined} />
          </Box>
        </Match>
        <Match when={exists(props.label)}>
          <Txt singleLine width={props.labelWidth ?? SIZE_SHRINKS} fill={props.labelBackground}>
            {props.label}:
          </Txt>
        </Match>
      </Switch>
      {props.children}
    </Row>
    </Show>
  );
}
