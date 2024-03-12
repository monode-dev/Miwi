import { BoxProps } from "./Box/Box";
import { Row } from "./Row";
import { useFormula } from "./utils";

export function Button(
  props: {
    round?: boolean;
    pill?: boolean;
    raised?: boolean;
    outlined?: boolean;
  } & BoxProps,
) {
  const shapeSty = useFormula(() => {
    if (props.round) {
      return { cornerRadius: `100%` };
    } else if (props.pill) {
      return { cornerRadius: 1, pad: 0.5, padAroundX: 0.75 };
    } else {
      return { cornerRadius: 0.25, pad: 0.5 };
    }
  });
  const colorSty = useFormula(() =>
    props.outlined
      ? {
          background: $theme.colors.accent,
          textColor: $theme.colors.primary,
          outlineColor: `currentColor`,
          outlineSize: 0.125,
        }
      : {
          background: $theme.colors.primary,
          textColor: $theme.colors.accent,
        },
  );
  const shadowSty = useFormula(() =>
    props.raised ? { shadowSize: 1, shadowDirection: $Align.bottomRight } : {},
  );
  return (
    <Row
      alignCenter
      {...shapeSty.value}
      {...colorSty.value}
      {...shadowSty.value}
      overrideProps={props}
    >
      {props.children}
    </Row>
  );
}
