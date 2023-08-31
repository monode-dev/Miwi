import { BoxProps } from "./Box";
import { exists } from "miwi/b-x/BoxUtils";
import { signal, Signal, watchDeps } from "@/utils";
import { Field, KeyboardType } from "./Field";

export function NumField(
  props: {
    value?: Signal<number | null>;
    negativesAreAllowed?: boolean;
    hasFocus?: Signal<boolean>;
    hint?: string;
    hintColor?: string;
    icon?: string;
    underlined?: boolean;
    title?: boolean;
    heading?: boolean;
    keyboard?: KeyboardType;
  } & BoxProps,
) {
  const keyboard = props.keyboard ?? "decimal";
  const _stringValue = signal(props.value?.toString() ?? "");

  if (exists(props.value)) {
    watchDeps([props.value], () => {
      const value = props.value?.value;
      if (!exists(value)) {
        _stringValue.value = "";
      } else if (textToNumber(_stringValue.value) !== value) {
        _stringValue.value = value.toString();
      }
    });
    watchDeps([_stringValue], () => {
      if (_stringValue.value === "") {
        props.value!.value = null;
      } else {
        if (!validateInput(_stringValue.value)) return;
        const asNumber = textToNumber(_stringValue.value);
        if (asNumber === props.value!.value) return;
        props.value!.value = asNumber;
      }
    });
  }

  function textToNumber(text: string): number | null {
    const withoutCommas = text.replaceAll(",", "");
    return withoutCommas.length > 0 ? Number(withoutCommas) : null;
  }

  function validateInput(newInput: string) {
    const asNumber = textToNumber(newInput);
    if (!exists(asNumber)) return true;
    if (!props.negativesAreAllowed && asNumber! < 0) return false;
    if (Number.isNaN(asNumber!)) return false;
    return true;
  }

  return (
    <div>
      <Field
        value={_stringValue}
        hasFocus={props.hasFocus}
        hintText={props.hint}
        hintColor={props.hintColor}
        icon={props.icon}
        underlined={props.underlined}
        title={props.title}
        heading={props.heading}
        validateNextInput={validateInput}
        keyboard={keyboard}
      />
    </div>
  );
}
