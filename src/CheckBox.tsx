import { mdiCheck } from "@mdi/js";
import { Show } from "solid-js";
import { Icon } from "./Icon";
import { Box, Label, strokeTexture, theme } from "./miwi";

export function Checkbox(props: {
  getValue: () => boolean;
  setValue: (value: boolean) => void;
  stroke?: string;
  label?: string;
}) {
  return (
    <Label label={props.label}>
      <Box
        /* We want the check box to be vertically centered with a single line of
        * text. However, the text is not vertically centered in its bounding box.
        * So we apply a slight offset here to vertically align the check box with
        * the first line of the description text. */
        padTop={0.045}
      >
        <Box
          onClick={() => props.setValue(!props.getValue())}
          width={1}
          height={1}
          outlineSize={1 / 8}
          stroke={props.stroke ?? theme.palette.primary}
          outlineColor={strokeTexture}
          cornerRadius={1 / 7}
          fill={
            props.getValue() ? strokeTexture : undefined
          }
        >
          <Show when={props.getValue()}>
            <Icon icon={mdiCheck} scale={0.85} stroke={theme.palette.accent} />
          </Show>
        </Box>
      </Box>
    </Label>);
}