import { BoxProps } from "./Box/Box";
import { sig, Sig, watchDeps, exists } from "./utils";
import { Field, KeyboardType } from "./Field";

export function NumField(
  props: {
    valueSig?: Sig<number | null | undefined>;
    negativesAreAllowed?: boolean;
    hasFocusSig?: Sig<boolean>;
    scale?: number;
    hint?: string;
    hintColor?: string;
    icon?: string;
    underlined?: boolean;
    title?: boolean;
    heading?: boolean;
    keyboard?: KeyboardType;
    onBlur?: () => void;
  } & BoxProps,
) {
  const keyboard = props.keyboard ?? "decimal";
  const _stringValue = sig(props.valueSig?.value?.toString() ?? "");

  if (exists(props.valueSig)) {
    watchDeps([props.valueSig], () => {
      const value = props.valueSig?.value;
      if (!exists(value)) {
        _stringValue.value = "";
      } else if (textToNumber(_stringValue.value) !== value) {
        _stringValue.value = value.toString();
      }
    });
    watchDeps([_stringValue], () => {
      if (_stringValue.value === "") {
        props.valueSig!.value = null;
      } else {
        if (!validateInput(_stringValue.value)) return;
        const asNumber = textToNumber(_stringValue.value);
        if (asNumber === props.valueSig!.value) return;
        props.valueSig!.value = asNumber;
      }
    });
  }

  function textToNumber(text: string): number | null {
    const withoutCommas = text.replaceAll(",", "").trim();
    const withoutTrailingDot = withoutCommas.endsWith(".")
      ? withoutCommas.slice(0, -1)
      : withoutCommas;
    const padded = withoutTrailingDot.startsWith(".")
      ? `0${withoutTrailingDot}`
      : withoutTrailingDot;
    return padded.length > 0 ? Number(padded) : null;
  }

  // Original Version
  // function validateInput(newInput: string) {
  //   const asNumber = textToNumber(newInput)
  //   if (!exists(asNumber)) return true
  //   if (!props.negativesAreAllowed && asNumber < 0) return false
  //   if (Number.isNaN(asNumber)) return false
  //   return true
  // }

  // REVIEW: Updated version with support for leading negative sign
  function validateInput(newInput: string) {
    const asNumber = textToNumber(newInput);
    if (!exists(asNumber)) return true;
    if (!props.negativesAreAllowed && asNumber < 0) return false;
    if (props.negativesAreAllowed && newInput === "-") {
      return true;
    } else if (Number.isNaN(asNumber)) {
      return false;
    }

    return true;
  }

  function formatFinishedInput(text: string) {
    text = text.trim();
    text = text.endsWith(".") ? text.slice(0, -1) : text;
    text = text.startsWith(".") ? `0${text}` : text;
    return text;
  }

  function formatInput(text: string, event: any) {
    // Track original text for comparison against formatted text
    const ogText = text;
    // Format Text for only numbers, decimals, and negatives
    text = text.replace(/[^0-9\.\-]+/g, "");

    // Remove extra decimal points
    if (text.includes(".")) {
      const indexOfDot = text.indexOf(".");
      text = text.slice(0, indexOfDot + 1) + text.slice(indexOfDot).replaceAll(".", "");
    }

    // Remove extra negative signs
    if (text.includes("-")) {
      text = props.negativesAreAllowed
        ? text.slice(0, 1) + text.slice(1).replaceAll("-", "")
        : text.replaceAll("-", "");
    }

    // Compare against original text to adjust selection
    const adjustSelection = ogText.length == text.length ? 0 : -1;

    return {
      input: text,
      caret: event.target?.selectionStart + adjustSelection,
    };
  }

  return (
    <Field
      {...props}
      onBlur={() => {
        _stringValue.value = formatFinishedInput(_stringValue.value);
        console.log(_stringValue.value);
        props.onBlur?.();
      }}
      align={props.align ?? $Align.centerLeft}
      valueSig={_stringValue}
      hasFocusSig={props.hasFocusSig}
      hintText={props.hint}
      hintColor={props.hintColor}
      iconPath={props.icon}
      underlined={props.underlined}
      h2={props.title}
      h1={props.heading}
      validateNextInput={validateInput}
      keyboard={keyboard}
      padBetweenX={props.padBetweenX ?? 0.0}
      padBetweenY={props.padBetweenY ?? 0.0}
      formatInput={formatInput}
    />
  );
}
