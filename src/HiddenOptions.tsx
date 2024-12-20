import { mdiClose, mdiDotsVertical, mdiTrashCanOutline } from "@mdi/js";
import { Prop } from "mosa-js";
import { JSXElement, Show } from "solid-js";
import { Icon } from "./Icon";
import { Modal, closeParentModal } from "./Modal";
import { Row } from "./Row";
import { Txt } from "./Txt";
import { doNow, useProp, useFormula, exists, getActualChildrenProp } from "./utils";
import { BoxProps } from "./Box/Box";
import { Size } from "./Box/BoxSize";
import { theme } from "./theme";

export function HiddenOptions(
  props: {
    openIcon?: string;
    openButton?: JSXElement;
    hideCancel?: boolean;
    cancelOptions?: Partial<Parameters<typeof HiddenOption>[0]>;
    isOpen?: Prop<boolean>;
    cardStyle?: BoxProps;
    dropDownWidth?: Size;
    noAvailableOptionsHint?: string;
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
  const actualChildren  = getActualChildrenProp(() => props.children);
  const hasChildren = useFormula(() => actualChildren.value.length > 0);
  return (
    <Modal
      openButton={
        <Show
          when={exists(props.openButton)}
          fallback={
            <Icon
              scale={scale}
              icon={props.openIcon ?? mdiDotsVertical}
              onClick={() => (isOpen.value = !isOpen.value)}
            />
          }
        >
          {props.openButton}
        </Show>
      }
      isOpen={isOpen}
      cardStyle={props.cardStyle}
      dropDownWidth={props.dropDownWidth}
    >
      {/* Cancel */}
      <Show when={!props.hideCancel && hasChildren.value}>
        <HiddenOption
          {...{
            text: `Cancel`,
            icon: mdiClose,
            autoHide: true,
            singleLine: true,
            ...props.cancelOptions,
          }}
        />
      </Show>

      {/* No Options Hint */}
      <Show when={!hasChildren.value}>
        <Txt hint onClick={() => (isOpen.value = false)} widthGrows>
          {props.noAvailableOptionsHint ?? `No Options`}
        </Txt>
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
    doNotAutoHide?: boolean;
    singleLine?: boolean;
  } & BoxProps,
) {
  return (
    <HiddenOption
      text={props.text ?? `Delete`}
      icon={props.icon ?? mdiTrashCanOutline}
      doNotAutoHide={props.doNotAutoHide}
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
    // TODO: autoHide is the default, so we should replace this with the opposite like "doNotAutoHide"
    doNotAutoHide?: boolean;
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
        if (props.doNotAutoHide ?? false) return;
        if (!exists(optionElement)) return;
        closeParentModal(optionElement);
      }}
      overrideProps={props}
      asWideAsParent
      minWidth={`fit-content`}
    >
      {props.children}
      <Show when={exists(props.icon)}>
        <Icon icon={props.icon!} />
      </Show>
      <Show when={exists(props.text)}>
        <Txt singleLine={props.singleLine}>{props.text}</Txt>
      </Show>
    </Row>
  );
}
