import { Box, BoxProps } from "./Box/Box";
import { AllowOne, useFormula } from "./utils";

/** TODO: Should expand to fill available width by default, but only stretch parent if text
 * is wide enough. */
export function Txt(
  props: AllowOne<{
    h1: boolean;
    h2: boolean;
  }> & {
    hint?: boolean;
  } & {
    singleLine?: boolean;
  } & BoxProps,
) {
  const overflowX = useFormula(
    () => props.overflowX ?? (props.singleLine ?? false ? $Overflow.crop : $Overflow.wrap),
  );

  return (
    <Box
      stroke={props.hint ? $theme.colors.hint : undefined}
      scale={props.scale ?? (props.h1 ? 1.5 : props.h2 ? 1.25 : undefined)}
      alignTopLeft
      overflowY={$Overflow.spill}
      overrideProps={props}
      overrideOverrides={{
        overflowX: overflowX.value,
      }}
      isFlexDisplay={overflowX.value === $Overflow.crop ? false : undefined}
    >
      {props.children}
    </Box>
  );
}
