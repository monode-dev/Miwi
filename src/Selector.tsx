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
    value: T;
    getLabelForData: (data: T) => string | null;
    noneLabel?: string;
    modalIsOpenSig?: Prop<boolean>;
    emptyListText?: string;
    filterStringSig?: Prop<string>;
    showCancelOptionForFilter?: boolean;
    isWide?: boolean;
  } & BoxProps,
) {
  // DEFAULT PROPERTIES
  const noneLabel = useFormula(() => props.noneLabel ?? "None");
  const emptyListText = useFormula(() => props.emptyListText ?? "No Options");
  const isWide = useFormula(() => props.isWide ?? false);
  const isOpen = props.modalIsOpenSig ?? useProp(false);
  doWatch(() => {
    if (!exists(props.filterStringSig)) return;
    if (!isOpen.value) {
      props.filterStringSig.value = ``;
    }
  });

  const selectedLabel = useFormula(() => props.getLabelForData(props.value) ?? noneLabel.value);

  const thereAreNoOptions = useFormula(() => {
    console.log(`props.children`);
    console.log(props.children);
    return (
      !exists(props.children) || (Array.isArray(props.children) && props.children.length === 0)
    );
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
              stroke={exists(props.value) ? $theme.colors.text : $theme.colors.hint}
            >
              {selectedLabel.value}
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
      {/* SECTION: No Options */}
      <Show when={thereAreNoOptions.value}>
        <Txt hint onClick={() => (isOpen.value = false)} widthGrows>
          {emptyListText.value}
        </Txt>
      </Show>

      {/* SECTION: Cancel */}
      <Show
        when={
          exists(props.filterStringSig) &&
          props.showCancelOptionForFilter &&
          !thereAreNoOptions.value
        }
      >
        <Txt hint onClick={() => (isOpen.value = false)} widthGrows>
          Cancel
        </Txt>
      </Show>

      {/* SECTION: Custom Options */}
      {props.children}
    </Modal>
  );
}
