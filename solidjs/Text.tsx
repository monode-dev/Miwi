import { createMemo } from "solid-js";
import { Box, BoxProps, grow, parseSty } from "./Box";
import { computed } from "@/utils";

// {
//   heading?: boolean;
//   title?: boolean;
//   hint?: boolean;
// }
export function Text(
  props: (
    | {
        heading?: undefined;
        title?: undefined;
        hint?: undefined;
      }
    | {
        heading: boolean;
        title?: undefined;
        hint?: undefined;
      }
    | {
        heading?: undefined;
        title: boolean;
        hint?: undefined;
      }
    | {
        heading?: undefined;
        title?: undefined;
        hint: boolean;
      }
  ) &
    BoxProps,
) {
  const sty = parseSty(props, {
    overflowX: $Overflow.wrap,
  });
  const scale = computed(
    () => sty.scale ?? (props.heading ? 1.5 : props.title ? 1.25 : 1),
  );

  return (
    <Box
      textColor={props.hint ? $theme.colors.hint : undefined}
      scale={scale.value}
      align={$Align.topLeft}
      overflowY={$Overflow.forceStretchParent}
      overflowX={
        sty.overflowX === $Overflow.crop
          ? $Overflow.forceStretchParent
          : sty.overflowX ?? $Overflow.wrap
      }
      {...props}
    >
      {sty.overflowX === $Overflow.crop ? (
        <div
          style="
          position: absolute;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;"
        >
          {props.children}
        </div>
      ) : (
        props.children
      )}
    </Box>
  );
}
