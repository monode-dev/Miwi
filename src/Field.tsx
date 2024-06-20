import { Show, onCleanup, onMount } from "solid-js";
import { Box, BoxProps } from "./Box/Box";
import { Row } from "./Row";
import { Icon } from "./Icon";
import { useFormula, useProp, Prop, doWatch, exists } from "./utils";
import { Column } from "./Column";
import { makePropParser } from "./Box/BoxUtils";
import { Align, AlignSingleAxis, Overflow, parseAlignProps, parseOverflowX } from "./Box/BoxLayout";
import { watchBoxText } from "./Box/BoxText";
import { SIZE_SHRINKS, parseSize } from "./Box/BoxSize";
import { Stack } from "./Stack";
import { Txt } from "./Txt";

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
    value?: Prop<string>;
    tempValue?: Prop<string>;
    hasFocus?: Prop<boolean>;
    hintText?: string;
    hintColor?: string;
    maxLines?: number;
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
  const parseProp: (...args: any[]) => any = makePropParser(props as any);
  const value = props.value ?? useProp(``);
  let inputElement: HTMLInputElement | HTMLTextAreaElement | undefined = undefined;
  const inputElementHasFocus = props.hasFocus ?? useProp(false);
  const scale = useFormula(() => props.scale ?? (props.h1 ? 1.5 : props.h2 ? 1.25 : 1));
  const maxLines = useFormula(() =>
    props.maxLines === undefined ? 1 : props.maxLines <= 0 ? 1 : props.maxLines,
  );
  const underlineHeight = useFormula(() => (props.underlined ? 0.5 * scale.value : 0));
  const textHeight = useFormula(() => {
    const heightFromProps = parseSize(`height`, parseProp);
    if (!exists(heightFromProps)) {
      return maxLines.value === Infinity ? SIZE_SHRINKS : maxLines.value * scale.value;
    } else if (typeof heightFromProps === `number`) {
      return heightFromProps - underlineHeight.value;
    } else {
      return heightFromProps;
    }
  });
  const fieldHeight = useFormula(() =>
    typeof textHeight.value === `number`
      ? textHeight.value + underlineHeight.value
      : textHeight.value,
  );

  // Input
  function setTempValue(newValue: string | undefined | null) {
    const stringValue = newValue ?? ``;
    if (exists(props.tempValue)) {
      props.tempValue.value = stringValue;
    } else {
      value.value = stringValue;
    }
    if (exists(inputElement)) {
      inputElement.value = stringValue;
    }
  }
  function getTempValue() {
    return props.tempValue?.value ?? value.value;
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
    if (maxLines.value === 1 && event.key === `Enter`) {
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
    if (!exists(nextInput)) return;
    // TODO: Maybe crop instead of prevent input?
    // We want to check line count first, so that `validateNextInput` can depend on it.
    if (nextInput.split("\n").length > maxLines.value) event.preventDefault();
    const nextInputIsValid = props.validateNextInput?.(nextInput) ?? true;
    if (!nextInputIsValid) event.preventDefault();
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

  const detailColor = useFormula(() =>
    inputElementHasFocus.value
      ? $theme.colors.primary
      : value.value === `` || !exists(value.value)
        ? $theme.colors.hint
        : props.stroke ?? $theme.colors.text,
  );

  onMount(() => {
    if (inputElementHasFocus.value) {
      // Focus on next frame
      const frameId = requestAnimationFrame(() => inputElement?.focus());
      onCleanup(() => cancelAnimationFrame(frameId));
    }
  });

  function tryFocus() {
    if (inputElementHasFocus.value) return;
    inputElement?.focus();
  }

  // Apply text style to input element
  function startWatchingTextStyle(inputElement: HTMLInputElement | HTMLTextAreaElement) {
    const alignX = useProp<AlignSingleAxis>(Align.topLeft.alignX);
    doWatch(() => {
      const { alignX: _alignX } = parseAlignProps(parseProp, false, Align.topLeft.alignX);
      alignX.value = _alignX;
    });
    const overflowX = useFormula<Overflow>(() =>
      maxLines.value == 1 ? parseOverflowX(parseProp) : Overflow.wrap,
    );
    watchBoxText(parseProp, useProp(inputElement), {
      alignX,
      overflowX,
    });
  }

  // TODO: Tapping on the field does not move the cursor.
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
      // TODO: 100 -> undefined
      rows: maxLines.value === Infinity ? 100 : maxLines.value,
      wrap: maxLines.value > 1 ? (`soft` as const) : undefined,
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
        [`text-wrap`]: `normal`,
        [`flex-wrap`]: `wrap`,
        [`caret-color`]: $theme.colors.primary,
        "--miwi-placeholder-color": props.hintColor ?? $theme.colors.hint,
        "-webkit-user-select": "text" /* Safari */,
        "-ms-user-select": "text" /* IE 10 and IE 11 */,
        "user-select": "text" /* Standard syntax */,
      } as any,
    };
    return maxLines.value > 1 ? <textarea {...inputProps} /> : <input {...inputProps} />;
  }
  return (
    <Row
      onClick={() => tryFocus()}
      widthGrows
      height={fieldHeight.value}
      stroke={$theme.colors.text}
      padBetweenX={0.25}
      padBetweenY={0}
      overflowY={$Overflow.spill}
      alignTopLeft
      overrideProps={props}
      overrideOverrides={{
        scale: scale.value,
        overflowX: Overflow.crop,
      }}
    >
      {/* Icon */}
      <Show when={exists(props.iconPath) && props.iconPath !== ``}>
        <Icon iconPath={props.iconPath!} stroke={detailColor.value} scale={scale.value} />
      </Show>

      <Column>
        {/* Input */}
        <Stack
          widthGrows
          height={textHeight.value}
          pad={0}
          alignTopLeft
          overflowYCrops
          overflowXWraps
        >
          <Show when={textHeight.value === SIZE_SHRINKS}>
            <Txt
              underlineText
              alignTopLeft
              stroke={`transparent`}
              overflowXWraps
              widthGrows
              overflowYCrops
            >
              {value.value == ``
                ? `a`
                : value.value.endsWith(`\n`)
                  ? value.value + `\n`
                  : value.value}
            </Txt>
          </Show>
          <_Input value={value.value} />
        </Stack>

        {/* Underline */}
        <Show when={props.underlined}>
          <Box height={underlineHeight.value} alignBottom>
            <Box widthGrows height={1 / 16} fill={detailColor.value} />
          </Box>
        </Show>
      </Column>
    </Row>
  );
}
