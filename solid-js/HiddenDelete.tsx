import { signal } from "./utils";
import { BoxProps, grow, parseSty } from "./Box";
import { Icon } from "./Icon";
import { Modal } from "./Modal";
import { Row } from "./Row";
import { Text } from "./Text";

export function HiddenDelete(
  props: {
    onDelete: () => void;
  } & BoxProps,
) {
  const sty = parseSty(props);
  const scale = sty.scale ?? 1;
  const isOpen = signal(false);
  return (
    <Modal
      openButton={
        <Icon icon="dots-vertical" onClick={() => (isOpen.value = true)} />
      }
      openButtonWidth={scale}
      openButtonHeight={scale}
      isOpen={isOpen}
    >
      <Row scale={scale} onClick={() => (isOpen.value = false)} width={grow()}>
        <Text width={grow()}>Cancel</Text>
        <Icon icon="close" />
      </Row>
      {props.children}
      <Row
        scale={scale}
        onClick={() => {
          isOpen.value = false;
          props.onDelete?.();
        }}
        textColor={$theme.colors.error}
      >
        <Text width={grow()}>Delete</Text>
        <Icon icon="delete" />
      </Row>
    </Modal>
  );
}
