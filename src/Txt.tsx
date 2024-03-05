import { Box, BoxProps } from "./Box/Box";
import { AllowOne, compute, doNow } from "./utils";

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
  const overflowX = compute(
    () => props.overflowX ?? (props.singleLine ?? false ? $Overflow.crop : $Overflow.wrap),
  );
  const children = compute(() => {
    const lastChildIfString = doNow(() => {
      if (typeof props.children === "string") props.children;
      if (Array.isArray(props.children)) {
        const lastChild = props.children[props.children.length - 1];
        if (typeof lastChild === "string") return lastChild;
      }
      return undefined;
    });
    const children = [...(Array.isArray(props.children) ? props.children : [props.children])];
    if (overflowX.value === $Overflow.wrap && lastChildIfString?.endsWith(`\n`)) {
      children.push(`\n`);
    }
    return children;
  });

  return (
    <Box
      textColor={props.hint ? $theme.colors.hint : undefined}
      scale={props.scale ?? (props.h1 ? 1.5 : props.h2 ? 1.25 : undefined)}
      alignTopLeft
      overflowY={$Overflow.spill}
      overrideProps={props}
      overrideOverrides={{
        overflowX: overflowX.value,
      }}
      isFlexDisplay={overflowX.value === $Overflow.crop ? false : undefined}
    >
      {children.value}
    </Box>
  );
}
