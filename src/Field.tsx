import { Show, onCleanup, onMount } from "solid-js";
import { Box, BoxProps } from "./Box/Box";
import { Row } from "./Row";
import { Icon } from "./Icon";
import { useFormula, useProp, Prop, doWatch, exists } from "./utils";
import { Column } from "./Column";
import { makePropParser } from "./Box/BoxUtils";
import { Align, AlignSingleAxis, Overflow, parseAlignProps, parseOverflowX } from "./Box/BoxLayout";
import { watchBoxText } from "./Box/BoxText";
// import { sizeToCss } from './Box/BoxUtils'

export type KeyboardType =
  | "none"
  | "text"
  | "tel"
  | "url"
  | "email"
  | "numeric"
  | "decimal"
  | "search";
export type FieldCapitalization = "none" | "sentences" | "words" | "characters";
export type FormatFieldInput = (
  nextInput: string,
  event: InputEvent,
) => {
  input: string;
  caret: number;
};
export function Field(
  props: {
    valueSig?: Prop<string>;
    tempValueSig?: Prop<string>;
    hasFocusSig?: Prop<boolean>;
    hintText?: string;
    hintColor?: string;
    lineCount?: number;
    limitLines?: boolean;
    underlined?: boolean;
    scale?: number;
    iconPath?: string;
    keyboard?: KeyboardType;
    h1?: boolean;
    h2?: boolean;
    capitalize?: FieldCapitalization;
    inputType?: `password` | `text` | `email` | `number` | `tel` | `url`;
    onBlur?: () => void;
    validateNextInput?: (nextInput: string) => boolean;
    formatInput?: FormatFieldInput;
    enterKeyHint?: `enter` | `done` | `go` | `next` | `previous` | `search` | `send`;
  } & BoxProps,
) {
  const value = props.valueSig ?? useProp(``);
  let inputElement: HTMLInputElement | HTMLTextAreaElement | undefined = undefined;
  const inputElementHasFocus = props.hasFocusSig ?? useProp(false);
  const scale = useFormula(() => props.scale ?? (props.h1 ? 1.5 : props.h2 ? 1.25 : 1));

  // Input
  function setTempValue(newValue: string | undefined | null) {
    const stringValue = newValue ?? ``;
    if (exists(props.tempValueSig)) {
      props.tempValueSig.value = stringValue;
    } else {
      value.value = stringValue;
    }
    if (exists(inputElement)) {
      inputElement.value = stringValue;
    }
  }
  function getTempValue() {
    return props.tempValueSig?.value ?? value.value;
  }
  doWatch(
    () => {
      if (!inputElementHasFocus.value) {
        // console.log(`Setting temp value to ${value.value}`);
        setTempValue(value.value);
      }
    },
    {
      on: [value],
    },
  );
  function handleInput(uncastEvent: Event) {
    const event = uncastEvent as InputEvent;
    let newInput = (event.target as any)?.value ?? "";
    let position = null;

    if (exists(props.formatInput)) {
      const formattedResult = props.formatInput(newInput, event);
      newInput = formattedResult.input;
      position = formattedResult.caret;
    }

    (event.target as any).value = newInput;

    setTempValue(newInput);

    if (position !== null) {
      (event.target as any).setSelectionRange(position, position);
    }
  }
  function handleKeyPress(event: KeyboardEvent) {
    if (lineCount <= 1 && event.key === `Enter`) {
      inputElementHasFocus.value = false;
      return;
    }
    validateInput(event, event.key === `Enter` ? `\n` : event.key);
  }
  function handlePaste(event: ClipboardEvent) {
    validateInput(event, event.clipboardData?.getData("text") ?? ``);
  }
  function validateInput(event: Event, newText: string) {
    const nextInput = predictNextInput(newText);
    if (exists(nextInput) && (props.limitLines ?? true)) {
      if (nextInput.split("\n").length > (props.lineCount ?? 1)) {
        event.preventDefault();
      }
    }
    if (exists(nextInput) && exists(props.validateNextInput)) {
      if (!props.validateNextInput(nextInput)) {
        event.preventDefault();
      }
    }
  }
  function predictNextInput(newText: string) {
    const input = inputElement;
    if (!exists(input)) return;
    return (
      input.value.slice(0, input.selectionStart!) + newText + input.value.slice(input.selectionEnd!)
    );
  }

  // Focus
  let valueOnFocus = value.value;
  const handleFocus = () => {
    if (getTempValue() !== value.value) {
      setTempValue(value.value);
    }
    valueOnFocus = value.value;
    inputElementHasFocus.value = true;
  };

  const handleBlur = () => {
    const tempValueIsDifferentThanProp = getTempValue() !== value.value;
    const haveTypedSomething = getTempValue() !== valueOnFocus;
    if (haveTypedSomething && tempValueIsDifferentThanProp) {
      value.value = getTempValue();
    } else if (!haveTypedSomething && tempValueIsDifferentThanProp) {
      // If someone else changed the value, and we didn't, then get the new value.
      setTempValue(value.value);
    }
    inputElementHasFocus.value = false;
    props.onBlur?.();
  };
  doWatch(() => {
    if (inputElementHasFocus.value !== (inputElement === document.activeElement)) {
      if (inputElementHasFocus.value) {
        tryFocus();
      } else {
        inputElement?.blur();
      }
    }
  });

  const underlineHeight = useFormula(() => (props.underlined ? 0.5 * scale.value : 0));

  const detailColor = useFormula(() =>
    inputElementHasFocus.value
      ? $theme.colors.primary
      : value.value === `` || !exists(value.value)
        ? $theme.colors.hint
        : props.foreground ?? $theme.colors.text,
  );

  onMount(() => {
    if (inputElementHasFocus.value) {
      // Focus on next frame
      const frameId = requestAnimationFrame(() => inputElement?.focus());
      onCleanup(() => cancelAnimationFrame(frameId));
    }
  });

  function tryFocus() {
    console.log(`Trying to focus`);
    if (inputElementHasFocus.value) return;
    inputElement?.focus();
  }

  // Apply text style to input element
  const parseProp: (...args: any[]) => any = makePropParser(props as any);
  function startWatchingTextStyle(inputElement: HTMLInputElement | HTMLTextAreaElement) {
    const alignX = useProp<AlignSingleAxis>(Align.topLeft.alignX);
    doWatch(() => {
      const { alignX: _alignX } = parseAlignProps(parseProp, false, Align.topLeft.alignX);
      alignX.value = _alignX;
    });
    const overflowX = useProp<Overflow>(Overflow.crop);
    doWatch(() => {
      overflowX.value = parseOverflowX(parseProp);
    });
    watchBoxText(parseProp, useProp(inputElement), {
      alignX,
      overflowX,
    });
  }

  // TODO: Tapping on the field does not move the cursor.
  const lineCount = props.lineCount ?? 1;
  function _Input(_inputProps: { value: string }) {
    const inputProps = {
      ref: (el: HTMLInputElement | HTMLTextAreaElement) => {
        inputElement = el;
        startWatchingTextStyle(el);
      },
      // type="text"
      type: props.inputType ?? `text`,
      inputmode: props.keyboard,
      value: _inputProps.value,
      onInput: handleInput,
      onFocus: handleFocus,
      onBlur: handleBlur,
      placeholder: props.hintText,
      onKeyPress: handleKeyPress,
      onPaste: handlePaste,
      class: "field",
      rows: exists(lineCount) ? lineCount : undefined,
      wrap: lineCount !== 1 ? (`soft` as const) : undefined,
      ["auto-capitalize"]: props.capitalize ?? "none",
      enterkeyhint: props.enterKeyHint ?? `done`,
      style: {
        border: "none",
        "background-color": "transparent",
        outline: "none",
        "font-family": "inherit",
        "font-size": "inherit",
        "font-weight": "inherit",
        "pointer-events": "auto",
        color: "inherit",
        padding: "0px",
        margin: "0px",
        width: "100%",
        overflow: "visible",
        resize: "none" as const,
        [`overflow-y`]: `visible` as const,
        // [`line-height`]: sizeToCss(scale.value),
        [`caret-color`]: $theme.colors.primary,
        "--miwi-placeholder-color": props.hintColor ?? $theme.colors.hint,
        "-webkit-user-select": "text" /* Safari */,
        "-ms-user-select": "text" /* IE 10 and IE 11 */,
        "user-select": "text" /* Standard syntax */,
      } as any,
    };
    return lineCount > 1 ? <textarea {...inputProps} /> : <input {...inputProps} />;
  }
  return (
    <Row
      // onClick={() => tryFocus()}
      widthGrows
      height={exists(lineCount) ? scale.value * lineCount + underlineHeight.value : undefined}
      foreground={$theme.colors.text}
      padBetweenX={0.25}
      padBetweenY={0}
      overflowY={$Overflow.spill}
      alignTopLeft
      overrideProps={props}
      overrideOverrides={{
        scale: scale.value,
      }}
    >
      {/* Icon */}
      <Show when={exists(props.iconPath) && props.iconPath !== ``}>
        <Icon iconPath={props.iconPath!} foreground={detailColor.value} scale={scale.value} />
      </Show>

      <Show when={props.underlined} fallback={<_Input value={value.value} />}>
        <Column>
          {/* Underlined Input */}
          <Row
            widthGrows
            alignTopLeft
            height={exists(lineCount) ? scale.value * lineCount : undefined}
          >
            <_Input value={value.value} />
            {/* <Box width={0.25} />
            <Box widthGrows>
              <_Input />
            </Box>
            <Box width={0.25} /> */}
          </Row>

          {/* Underline */}
          <Box height={underlineHeight.value} alignBottomLeft>
            <Box widthGrows height={0.0625} fill={detailColor.value} />
          </Box>
        </Column>
      </Show>
    </Row>
  );
}
