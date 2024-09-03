import { mdiClose, mdiMenuDown } from "@mdi/js";
import { JSXElement, Show } from "solid-js";
import { BoxProps } from "./Box/Box";
import { Field } from "./Field";
import { Icon } from "./Icon";
import { Row } from "./Row";
import { Txt } from "./Txt";
import { Prop, useFormula, useProp, exists, doWatch } from "./utils";
import { HiddenOptions } from "./HiddenOptions";
import { Size } from "./Box/BoxSize";

export function Selector<T>(
  props: {
    value: T;
    getLabelForData: (data: T) => string | null;
    hintText?: string;
    noOptionsText?: string;
    isOpen?: Prop<boolean>;
    filterString?: Prop<string>;
    stillShowInlineCancelOptionWhenFiltering?: boolean;
    actionButtons?: JSXElement;
    cancelOptions?: Parameters<typeof HiddenOptions>[0][`cancelOptions`];
    dropDownWidth?: Size;
    rightActions?: JSXElement;
  } & BoxProps,
) {
  // DEFAULT PROPERTIES
  const isOpen = props.isOpen ?? useProp(false);
  const isFiltering = useFormula(
    () => exists(props.filterString) && props.filterString.value !== ``,
  );
  doWatch(() => {
    if (!exists(props.filterString)) return;
    if (!isOpen.value) {
      props.filterString.value = ``;
    }
  });

  return (
    <HiddenOptions
      openButton={
        <Row
          onClick={() => {
            if (exists(props.filterString) && isOpen.value) return;
            isOpen.value = !isOpen.value;
          }}
          widthGrows
          height={props.scale ?? 1}
          padBetween={0.5}
          alignTopLeft
        >
          <Show
            when={!exists(props.filterString) || !isOpen.value}
            fallback={
              <Field value={props.filterString} hintText="Search" hasFocus={useProp(true)} />
            }
          >
            <Txt
              widthGrows
              overflowX={$Overflow.crop}
              stroke={exists(props.value) ? $theme.colors.text : $theme.colors.hint}
            >
              {props.getLabelForData(props.value) ?? props.hintText ?? "None"}
            </Txt>
          </Show>
          <Icon
            iconPath={exists(props.filterString) && isOpen.value ? mdiClose : mdiMenuDown}
            onClick={() => (isOpen.value = !isOpen.value)}
          />
          {props.actionButtons}
        </Row>
      }
      isOpen={isOpen}
      dropDownWidth={props.dropDownWidth ?? `100%`}
      hideCancel={isFiltering.value && !props.stillShowInlineCancelOptionWhenFiltering}
      noOptionsText={props.noOptionsText}
      cancelOptions={props.cancelOptions}
    >
      {/* SECTION: Custom Options */}
      {props.children}
    </HiddenOptions>
  );
}
