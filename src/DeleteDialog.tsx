import { BoxProps } from "./Box/Box";
import { Button } from "./Button";
import { Row } from "./Row";
import { Txt } from "./Txt";
import { popPage } from "./Nav";
import { Dialog } from "./Dialog";

export function DeleteDialog(props: BoxProps & { onDelete?: () => void; message: string }) {
  return (
    <Dialog>
      <Txt widthGrows overflowX={$Overflow.wrap}>
        {props.message}
      </Txt>
      <Row widthGrows spaceEvenly>
        <Button
          outlined
          onClick={() => {
            popPage();
            props.onDelete?.();
          }}
        >
          Yes
        </Button>
        <Button onClick={() => popPage()}>No</Button>
      </Row>
    </Dialog>
  );
}
