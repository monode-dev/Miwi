import { Show, batch, onCleanup, onMount } from "solid-js";
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
import { Label } from "./Label";
import { findPageInAncestors } from "./Nav";

let mobileBrowserIsGoingToAddAnExtraNewlineForNoReason = false;

const autoTabGroupIdKey = 'auto-tab-group-id';
/** Finds the next input or textarea in this page in the same group that doesn't have some text
 * in it already. */
function getNextEmptyFieldInGroup(inputElement: HTMLInputElement | HTMLTextAreaElement) {
  // If the field is not part of a group, then there can't be a next field
  if (!inputElement.hasAttribute(autoTabGroupIdKey)) return;
  const groupId = inputElement.getAttribute(autoTabGroupIdKey);

  // Try to find the next field in the group
  let nextInputElInGroup: HTMLInputElement | HTMLTextAreaElement | undefined = undefined;
  let haveFoundCurrentField = false;
  const pageElement = (findPageInAncestors(inputElement) ?? document);
  for (const _el of pageElement.querySelectorAll('input, textarea')) {
    const el = _el as HTMLInputElement | HTMLTextAreaElement; 
    // Skip fields before the current field.
    if (el === inputElement) {
      haveFoundCurrentField = true;
      continue;
    }
    if (!haveFoundCurrentField) continue;

    // Skip fields that are not part of the group.
    if (el.getAttribute('auto-tab-group-id') !== groupId) continue;

    // Skip if the field has content in it.
    if (el.value.trim() !== '') continue;

    // Skip if the field is not visible.
    if (el.offsetParent === null) continue;

    // If we have found the next field, return it.
    nextInputElInGroup = el;
    break;
  }
  return nextInputElInGroup;
}

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
export type EnterKeyHint = `enter` | `done` | `go` | `next` | `previous` | `search` | `send`;
export type FieldInputType = `password` | `text` | `email` | `number` | `tel` | `url`;
/** Use enterKeyHint to control what happens when the done button is pressed. */
export function Field(
  props: {
    value?: Prop<string>;
    getValue?: () => string;
    setValue?: (value: string) => void;
    /* We use to use this to let people track the value before blur, but now that we
     * have "setValueOnEveryKeyStroke" I don't think we need it. */
    // tempValue?: Prop<string>;
    // TODO: Once we debounce mufasa writes, this should be reworked to be `onlyWriteOnBlur` and should default to false.
    setValueOnEveryKeyStroke?: boolean;
    hasFocus?: Prop<boolean>;
    hintText?: string;
    hintColor?: string;
    textColor?: string;
    maxLines?: number;
    multiline?: boolean;
    underlined?: boolean;
    scale?: number;
    iconPath?: string;
    keyboard?: KeyboardType;
    h1?: boolean;
    h2?: boolean;
    capitalize?: FieldCapitalization;
    inputType?: FieldInputType;
    onBlur?: () => void;
    validateNextInput?: (nextInput: string) => boolean;
    formatInput?: FormatFieldInput;
    enterKeyHint?: EnterKeyHint;
    label?: string;
    labelStyle?: BoxProps
    autoTabGroupId?: string;
  } & BoxProps,
) {
  // Parse Props
  let inputElement: HTMLInputElement | HTMLTextAreaElement | undefined = undefined;
  const parseProp: (...args: any[]) => any = makePropParser(props as any);

  const enterKeyHint: Prop<EnterKeyHint> = useFormula(() => props.enterKeyHint ?? props.multiline ? `enter` : `done`);

  const maxLines = useFormula(() =>
    props.multiline
      ? Infinity
      : props.maxLines === undefined
        ? 1
        : props.maxLines <= 0
          ? 1
          : props.maxLines,
  );

  // Input focus
  const externalHasFocus = props.hasFocus ?? useProp(false);
  onMount(() => {
    if (externalHasFocus.value) {
      // Focus on next frame
      const frameId = requestAnimationFrame(() => tryFocus());
      onCleanup(() => cancelAnimationFrame(frameId));
    }
  });
  doWatch(() => {
    if (externalHasFocus.value !== (inputElement === document.activeElement)) {
      if (externalHasFocus.value) {
        tryFocus();
      } else {
        inputElement?.blur();
      }
    }
  });
  function tryFocus() {
    // We need to do this on tryFocus before the keyboard is opened.
    setUpEnterKeyHintForAutoTab();
    inputElement?.focus();
  }
  function setUpEnterKeyHintForAutoTab(el?: HTMLInputElement | HTMLTextAreaElement) {
    el = el ?? inputElement;
    // If there is a field to auto-tab to, then use the "next" enter key hint.
    // We need to do this on tryFocus before the keyboard is opened.
    if (!exists(props.enterKeyHint) && exists(el)) {
      const nextEmptyFieldInGroup = getNextEmptyFieldInGroup(el);
      if (exists(getNextEmptyFieldInGroup(el))) el.enterKeyHint = `next`;
      const keyboardIsOpenning = el === document.activeElement;
    }
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

  // Internal Value, External Value, and Focus Change
  const _externalValue = exists(props.getValue)
    // We want this to throw if props.setValue is undefined.
    ? useFormula(props.getValue, props.setValue!)
    : exists(props.value)
      ? props.value
      : useProp(``);
  const internalValue = !props.setValueOnEveryKeyStroke ? useProp(_externalValue.value) : _externalValue;
  if (!props.setValueOnEveryKeyStroke) {
    doWatch(
      () => {
        if (!externalHasFocus.value) {
          internalValue.value = _externalValue.value;
        }
      },
      { on: [_externalValue] },
    );
  }
  let internalValueOnFocus = ``;
  const handleFocus = () => {
    internalValueOnFocus = internalValue.value;
    externalHasFocus.value = true;
    // Sometimes mobile browsers add an extra newline when we focus on a text area. This lets us fix that.
    if (inputElement! instanceof HTMLTextAreaElement && mobileBrowserIsGoingToAddAnExtraNewlineForNoReason) {
      mobileBrowserIsGoingToAddAnExtraNewlineForNoReason = false;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          internalValue.value = internalValueOnFocus;
        });
      });
    }
  };
  const handleBlur = () => {
    batch(() => {
      if (!props.setValueOnEveryKeyStroke) {
        if (internalValue.value !== internalValueOnFocus) {
          // If an internal change happened overwrite any external changes.
          _externalValue.value = internalValue.value;
        } else if (internalValue.value !== _externalValue.value) {
          // Only apply external changes if there were no internal changes.
          internalValue.value = _externalValue.value;
        }
      }
      externalHasFocus.value = false;
    })
    props.onBlur?.();
  };

  // Validate & format input
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

    internalValue.value = newInput ?? ``;

    if (position !== null) {
      (event.target as any).setSelectionRange(position, position);
    }
  }
  function handleBackspace(event: KeyboardEvent) {
    if (event.key !== `Backspace` && event.key !== `Delete`) return;
    validateInput(event, ``, event.key);
  }
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === `Enter` && (maxLines.value === 1 || enterKeyHint.value !== `enter`)) {
      externalHasFocus.value = false;
      // If this input is in an auto-tab group and there is a field to auto-tab to, then focus it.
      const nextInputInGroup = getNextEmptyFieldInGroup(inputElement!);
      if (exists(nextInputInGroup)) {
        // We need to set this up before the keyboard is opened.
        setUpEnterKeyHintForAutoTab(nextInputInGroup)
        /** At-least in safari, when we focus on a text area via an enter key press, it adds an extra newline.
         * We need to tell the next field to ignore this. */
        if (nextInputInGroup instanceof HTMLTextAreaElement) {
          mobileBrowserIsGoingToAddAnExtraNewlineForNoReason = true;
        }
        nextInputInGroup.focus();
      }
      return;
    }
    validateInput(event, event.key === `Enter` ? `\n`: event.key);
  }

  function handlePaste(event: ClipboardEvent) {
    validateInput(event, event.clipboardData?.getData("text") ?? ``);
  }
  function validateInput(event: Event, newText: string, deletion?: `Backspace` | `Delete`) {
    const nextInput = predictNextInput(newText, deletion);
    if (!exists(nextInput)) return;
    // TODO: Maybe crop instead of prevent input?
    // We want to check line count first, so that `validateNextInput` can depend on it.
    if (nextInput.split("\n").length > maxLines.value) event.preventDefault();
    const nextInputIsValid = props.validateNextInput?.(nextInput) ?? true;
    if (!nextInputIsValid) event.preventDefault();
  }
  function predictNextInput(newText: string, deletion?: `Backspace` | `Delete`) {
    if (!exists(inputElement)) return;
    const selectionStart = inputElement.selectionStart! + (deletion === `Backspace` ? -1 : 0);
    const selectionEnd = inputElement.selectionEnd! + (deletion === `Delete` ? 1 : 0);
    return (
      inputElement.value.slice(0, selectionStart) +
      newText +
      inputElement.value.slice(selectionEnd)
    );
  }

  // Visuals
  const detailColor = useFormula(() =>
    externalHasFocus.value
      ? $theme.colors.primary
      : internalValue.value === `` || !exists(internalValue.value)
        ? $theme.colors.hint
        : props.stroke ?? $theme.colors.text,
  );

  // Height Calcs
  const scale = useFormula(() => props.scale ?? (props.h1 ? 1.5 : props.h2 ? 1.25 : 1));
  const underlineHeight = useFormula(() => (props.underlined ? 0.5 * scale.value : 0));
  const textHeight = useFormula(() => {
    const heightFromProps = parseSize(`height`, parseProp);
    if (!exists(heightFromProps)) {
      const offsetBetweenLineHeightAndScaleHeight = 1.18;
      return maxLines.value === Infinity
        ? SIZE_SHRINKS
        : maxLines.value * scale.value * offsetBetweenLineHeightAndScaleHeight;
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

  // TODO: At one point in time, tapping on the field did not move the cursor.
  function _InputOrTextArea(_inputProps: { value: string }) {
    const getInputProps = () => ({
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
      // Handles only printable characters
      onKeyPress: handleKeyPress,
      onkeydown: handleBackspace,
      onPaste: handlePaste,
      class: "field",
      rows: maxLines.value === Infinity ? undefined : maxLines.value,
      wrap: maxLines.value > 1 ? (`soft` as const) : undefined,
      ["auto-capitalize"]: props.capitalize ?? "none",
      enterkeyhint: enterKeyHint.value,
      [autoTabGroupIdKey]: props.autoTabGroupId,
      /** We do this here to make sure auto-tab groups can pick the right enter key hint before the keyboard
       * is opened. It has to be onmousedown on onclick so that it fires before the keyboard is opened. */
      onmousedown: () => setUpEnterKeyHintForAutoTab(),
      style: {
        minHeight: `100%`,
        height: `100%`,
        maxHeight: `100%`,
        border: "none",
        "background-color": "transparent",
        outline: "none",
        "font-family": "inherit",
        "font-size": "inherit",
        "font-weight": "inherit",
        "pointer-events": "auto",
        color: props.textColor ?? "inherit",
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
    });
    return maxLines.value > 1 ? <textarea {...getInputProps()} /> : <input {...getInputProps()} />;
  }
  return (
    <Label label={props.label} overrideProps={props.labelStyle}>
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
            /* <_Input/> specifically is "overflowYSpills" ignoring. If Input is outside of
            * Stack, it works. If Stack's height is set to SIZE_SHRINKS it works. If we
            * use a <Txt/> instead of <_Input/>. If we use a Column instead of a stack
            * it works. This seems to be some specific css issue with the way <input> or
            * <textarea> behave when in a fixed height <div>. Asked AI and Google, neither
            * had any idea. */
            overflowYSpills
            overflowXWraps
          >
            <Show when={textHeight.value === SIZE_SHRINKS}>
              <Txt stroke={`transparent`} widthGrows>
                {internalValue.value == ``
                  ? `a`
                  : internalValue.value.endsWith(`\n`)
                    ? internalValue.value.trim() === ``
                      ? internalValue.value + `a\n`
                      : internalValue.value + `\n`
                    : internalValue.value}
              </Txt>
            </Show>
            <_InputOrTextArea value={internalValue.value} />
          </Stack>

          {/* Underline */}
          <Show when={props.underlined}>
            <Box height={underlineHeight.value} alignBottom>
              <Box widthGrows height={1 / 16} fill={detailColor.value} />
            </Box>
          </Show>
        </Column>
      </Row>
    </Label>
  );
}
