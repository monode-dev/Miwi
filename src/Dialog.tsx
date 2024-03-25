import { Box, BoxProps } from "./Box/Box";
import { Card } from "./Card";
import { popPage } from "./Nav";

export function Dialog(
  props: {
    doNotCloseOnClickOutside?: boolean;
  } & BoxProps,
) {
  return (
    <Box
      widthGrows
      heightGrows
      background={`#00000099`}
      onClick={() => (props.doNotCloseOnClickOutside ? {} : popPage())}
    >
      <Card width={`75%`} preventClickPropagation overrideProps={props}>
        {props.children}
      </Card>
    </Box>
  );
}
