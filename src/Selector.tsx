import { mdiClose, mdiMenuDown } from "@mdi/js";
import { Show } from "solid-js";
import { BoxProps } from "./Box/Box";
import { grow } from "./Box/BoxSize";
import { Field } from "./Field";
import { Icon } from "./Icon";
import { Modal } from "./Modal";
import { Row } from "./Row";
import { Txt } from "./Txt";
import { Prop, useFormula, useProp, exists, doWatch } from "./utils";

export function Selector<T>(
  props: {
    selected: T;
    getLabelForData: (data: T) => string | null;
    noneLabel?: string;
    modalIsOpenSig?: Prop<boolean>;
    filterStringSig?: Prop<string>;
    showCancelOptionForFilter?: boolean;
    isWide?: boolean;
  } & BoxProps,
) {
  // DEFAULT PROPERTIES
  const noneLabel = useFormula(() => props.noneLabel ?? "None");
  const isWide = useFormula(() => props.isWide ?? false);
  const isOpen = props.modalIsOpenSig ?? useProp(false);
  doWatch(() => {
    if (!exists(props.filterStringSig)) return;
    if (!isOpen.value) {
      props.filterStringSig.value = ``;
    }
  });

  return (
    <Modal
      openButton={
        <Row
          onClick={() => {
            if (exists(props.filterStringSig) && isOpen.value) return;
            isOpen.value = !isOpen.value;
          }}
          widthGrows
          height={props.scale ?? 1}
          spaceBetween
        >
          <Show
            when={!exists(props.filterStringSig) || !isOpen.value}
            fallback={
              <Field value={props.filterStringSig} hintText="Search" hasFocus={useProp(true)} />
            }
          >
            <Txt
              widthGrows
              overflowX={$Overflow.crop}
              stroke={exists(props.selected) ? $theme.colors.text : $theme.colors.hint}
            >
              {props.getLabelForData(props.selected) ?? noneLabel.value}
            </Txt>
          </Show>
          <Icon
            iconPath={exists(props.filterStringSig) && isOpen.value ? mdiClose : mdiMenuDown}
            onClick={() => (isOpen.value = !isOpen.value)}
          />
        </Row>
      }
      openButtonWidth={grow()}
      openButtonHeight={props.scale ?? 1}
      isOpen={isOpen}
      modalWidth={isWide.value ? `100%` : undefined}
    >
      {/* SECTION: Cancel */}
      <Show when={exists(props.filterStringSig) && props.showCancelOptionForFilter}>
        <Txt hint onClick={() => (isOpen.value = false)} widthGrows>
          Cancel
        </Txt>
      </Show>

      {/* SECTION: Custom Options */}
      {props.children}
    </Modal>
  );
}
