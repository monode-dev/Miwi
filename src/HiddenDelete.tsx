import { Prop, doNow, exists, useProp } from "./utils";
import { BoxProps } from "./Box/Box";
import { Icon } from "./Icon";
import { Modal } from "./Modal";
import { Row } from "./Row";
import { Txt } from "./Txt";
import { mdiClose, mdiDelete, mdiDotsVertical } from "@mdi/js";
import { Size } from "./Box/BoxSize";

export function HiddenDelete(
  props: {
    onDelete: () => void;
    isOpen?: Prop<boolean>;
    deleteText?: string;
    deleteIcon?: string;
    cardStyle?: BoxProps;
    modalWidth?: Size;
  } & BoxProps,
) {
  const scale = props.scale ?? 1;
  const isOpen = doNow(() => {
    const _fallbackIsOpen = useProp(false);
    return {
      get value() {
        return props.isOpen?.value ?? _fallbackIsOpen.value;
      },
      set value(v) {
        if (exists(props.isOpen)) {
          props.isOpen.value = v;
        } else {
          _fallbackIsOpen.value = v;
        }
      },
    };
  });
  return (
    <Modal
      openButton={
        <Icon
          scale={scale}
          iconPath={mdiDotsVertical}
          onClick={() => (isOpen.value = !isOpen.value)}
        />
      }
      openButtonWidth={scale}
      openButtonHeight={scale}
      isOpen={isOpen}
      cardStyle={props.cardStyle}
      modalWidth={props.modalWidth}
    >
      <Row
        stroke={$theme.colors.text}
        scale={scale}
        alignCenterLeft
        padBetween={0.25}
        onClick={() => (isOpen.value = false)}
      >
        <Txt>Cancel</Txt>
        <Icon iconPath={mdiClose} />
      </Row>
      {props.children}
      <Row
        scale={scale}
        alignCenterLeft
        padBetween={0.25}
        onClick={() => {
          isOpen.value = false;
          props.onDelete();
        }}
        stroke={$theme.colors.error}
      >
        <Txt>{props.deleteText ?? `Delete`}</Txt>
        <Icon iconPath={props.deleteIcon ?? mdiDelete} />
      </Row>
    </Modal>
  );
}
