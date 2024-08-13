import { mdiClose, mdiDotsVertical, mdiTrashCanOutline } from "@mdi/js";
import { Prop } from "mosa-js";
import { JSXElement, Show } from "solid-js";
import { Icon } from "./Icon";
import { Modal, closeParentModal } from "./Modal";
import { Row } from "./Row";
import { Txt } from "./Txt";
import { doNow, useProp, useFormula, exists } from "./utils";
import { BoxProps } from "./Box/Box";
import { Size } from "./Box/BoxSize";
import { theme } from "./Theme";

export function HiddenOptions(
  props: {
    openIcon?: string;
    openButton?: JSXElement;
    hideCancel?: boolean;
    cancelOption?: Partial<Parameters<typeof HiddenOption>[0]>;
    isOpen?: Prop<boolean>;
    cardStyle?: BoxProps;
    modalWidth?: Size;
    noOptionsText?: string;
  } & BoxProps,
) {
  const scale = props.scale ?? 1;
  const isOpen = doNow(() => {
    const _fallbackIsOpen = useProp(false);
    return useFormula(
      () => props.isOpen?.value ?? _fallbackIsOpen.value,
      v => (exists(props.isOpen) ? (props.isOpen.value = v) : (_fallbackIsOpen.value = v)),
    );
  });
  const thereAreNoOptions = useFormula(() => {
    return (
      !exists(props.children) || (Array.isArray(props.children) && props.children.length === 0)
    );
  });
  return (
    <Modal
      openButton={
        <Show
          when={exists(props.openButton)}
          fallback={
            <Icon
              scale={scale}
              iconPath={props.openIcon ?? mdiDotsVertical}
              onClick={() => (isOpen.value = !isOpen.value)}
            />
          }
        >
          {props.openButton}
        </Show>
      }
      isOpen={isOpen}
      cardStyle={{
        cornerRadius: 0.5,
        zIndex: 2,
        ...props.cardStyle,
      }}
      modalWidth={props.modalWidth}
    >
      {/* No Options Hint */}
      <Show when={thereAreNoOptions.value}>
        <Txt hint onClick={() => (isOpen.value = false)} widthGrows>
          {props.noOptionsText ?? `No Options`}
        </Txt>
      </Show>

      {/* Cancel */}
      <Show when={!props.hideCancel}>
        <HiddenOption
          {...{
            text: `Cancel`,
            icon: mdiClose,
            autoHide: true,
            singleLine: true,
            ...props.cancelOption,
          }}
        />
      </Show>

      {/* Other Options */}
      {props.children}
    </Modal>
  );
}

export function DeleteOption(
  props: {
    text?: string;
    icon?: string;
    autoHide?: boolean;
    singleLine?: boolean;
  } & BoxProps,
) {
  return (
    <HiddenOption
      text={props.text ?? `Delete`}
      icon={props.icon ?? mdiTrashCanOutline}
      autoHide={props.autoHide}
      singleLine={props.singleLine}
      stroke={theme.palette.error}
      overrideProps={props}
    />
  );
}

export function HiddenOption(
  props: {
    text?: string;
    icon?: string;
    autoHide?: boolean;
    singleLine?: boolean;
  } & BoxProps,
) {
  let optionElement: HTMLElement | null = null;
  return (
    <Row
      alignCenterLeft
      padBetween={0.25}
      getElement={el => (optionElement = el)}
      onClick={() => {
        if (!(props.autoHide ?? true)) return;
        if (!exists(optionElement)) return;
        closeParentModal(optionElement);
      }}
      overrideProps={props}
      asWideAsParent
      minWidth={`fit-content`}
    >
      {props.children}
      <Show when={exists(props.icon)}>
        <Icon iconPath={props.icon!} />
      </Show>
      <Show when={exists(props.text)}>
        <Txt singleLine={props.singleLine}>{props.text}</Txt>
      </Show>
    </Row>
  );
}