import { mdiClose, mdiMenuDown } from "@mdi/js";
import { JSXElement, Show } from "solid-js";
import { BoxProps } from "./Box/Box";
import { Field } from "./Field";
import { Icon } from "./Icon";
import { Row } from "./Row";
import { Txt } from "./Txt";
import { Prop, useFormula, useProp, exists, doWatch } from "./utils";
import { HiddenOptions } from "./HiddenOptions";

export function Selector<T>(
  props: {
    value: T;
    getLabelForData: (data: T) => string | null;
    noneLabel?: string;
    isOpen?: Prop<boolean>;
    filterStringSig?: Prop<string>;
    isWide?: boolean;
    actionButtons?: JSXElement;
  } & BoxProps,
) {
  // DEFAULT PROPERTIES
  const noneLabel = useFormula(() => props.noneLabel ?? "None");
  const isWide = useFormula(() => props.isWide ?? false);
  const isOpen = props.isOpen ?? useProp(false);
  doWatch(() => {
    if (!exists(props.filterStringSig)) return;
    if (!isOpen.value) {
      props.filterStringSig.value = ``;
    }
  });

  return (
    <HiddenOptions
      openButton={
        <Row
          onClick={() => {
            if (exists(props.filterStringSig) && isOpen.value) return;
            isOpen.value = !isOpen.value;
          }}
          widthGrows
          height={props.scale ?? 1}
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
              {props.getLabelForData(props.value) ?? noneLabel.value}
            </Txt>
          </Show>
          <Icon
            iconPath={exists(props.filterStringSig) && isOpen.value ? mdiClose : mdiMenuDown}
            onClick={() => (isOpen.value = !isOpen.value)}
          />
          {props.actionButtons}
        </Row>
      }
      isOpen={isOpen}
      modalWidth={isWide.value ? `100%` : undefined}
    >
      {/* SECTION: Custom Options */}
      {props.children}
    </HiddenOptions>
  );
}
