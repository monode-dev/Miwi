import { BoxProps } from "./Box/Box";
import { useProp, Prop, doWatch, exists } from "./utils";
import { EnterKeyHint, Field, KeyboardType } from "./Field";

export function NumField(
  props: {
    value?: Prop<number | null | undefined>;
    onlyWriteOnBlur?: boolean;
    negativesAreAllowed?: boolean;
    hasFocusSig?: Prop<boolean>;
    scale?: number;
    hint?: string;
    hintColor?: string;
    textColor?: string;
    icon?: string;
    underlined?: boolean;
    title?: boolean;
    heading?: boolean;
    keyboard?: KeyboardType;
    onBlur?: () => void;
    enterKeyHint?: EnterKeyHint;
  } & BoxProps,
) {
  const keyboard = props.keyboard ?? "decimal";
  const _stringValue = useProp(props.value?.value?.toString() ?? "");

  if (exists(props.value)) {
    doWatch(
      () => {
        const value = props.value?.value;
        if (!exists(value)) {
          _stringValue.value = "";
        } else if (textToNumber(_stringValue.value) !== value) {
          _stringValue.value = value.toString();
        }
      },
      {
        on: [props.value],
      },
    );
    doWatch(
      () => {
        if (_stringValue.value === "") {
          props.value!.value = null;
        } else {
          if (!validateInput(_stringValue.value)) return;
          const asNumber = textToNumber(_stringValue.value);
          if (asNumber === props.value!.value) return;
          props.value!.value = asNumber;
        }
      },
      {
        on: [_stringValue],
      },
    );
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
        props.onBlur?.();
      }}
      // align={props.align ?? $Align.topLeft}
      value={_stringValue}
      hasFocus={props.hasFocusSig}
      hintText={props.hint}
      hintColor={props.hintColor}
      textColor={props.textColor}
      iconPath={props.icon}
      underlined={props.underlined}
      h2={props.title}
      h1={props.heading}
      validateNextInput={validateInput}
      keyboard={keyboard}
      overrideProps={props}
      formatInput={formatInput}
      onlyWriteOnBlur={props.onlyWriteOnBlur}
      enterKeyHint={props.enterKeyHint}
    />
  );
}
