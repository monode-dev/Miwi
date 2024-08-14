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
    noOptionsText?: string;
    isOpen?: Prop<boolean>;
    filterString?: Prop<string>;
    stillShowInlineCancelOptionWhenFiltering?: boolean;
    isWide?: boolean;
    actionButtons?: JSXElement;
    cancelOptions?: Parameters<typeof HiddenOptions>[0][`cancelOptions`];
  } & BoxProps,
) {
  // DEFAULT PROPERTIES
  const noneLabel = useFormula(() => props.noneLabel ?? "None");
  const isWide = useFormula(() => props.isWide ?? false);
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
              {props.getLabelForData(props.value) ?? noneLabel.value}
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
      // modalWidth={isWide.value ? `100%` : undefined}
      hideCancel={isFiltering.value && !props.stillShowInlineCancelOptionWhenFiltering}
      noOptionsText={props.noOptionsText}
      cancelOptions={props.cancelOptions}
    >
      {/* SECTION: Custom Options */}
      {props.children}
    </HiddenOptions>
  );
}
