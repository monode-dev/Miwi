import { Box, BoxProps } from "./Box/Box";
import { Card } from "./Card";
import { popPage } from "./Nav";

/** The Dialog component in Miwi is a modal-like feature that displays content in a layer above the main application..
 * ```
 * ```
 * Docs: https://miwi.dev/components/dialog.html */

export function Dialog(
  props: {
    doNotCloseOnClickOutside?: boolean;
  } & BoxProps,
) {
  return (
    <Box
      widthGrows
      heightGrows
      padAround={1}
      fill={`#00000099`}
      onClick={() => (props.doNotCloseOnClickOutside ? {} : popPage())}
    >
      <Card width={`75%`} preventClickPropagation overrideProps={props} shadowSize={1.25}>
        {props.children}
      </Card>
    </Box>
  );
}
