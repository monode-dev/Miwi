import { Show, onMount } from "solid-js";
import { Box, grow, parseSty } from "./Box";
import { Row } from "./Row";
import { Icon } from "./Icon";
import { computed, signal, watchDeps, watchEffect, exists, } from "./utils";
import { sizeToCss } from "../b-x";
import "./Field.css";
import { Column } from "./Column";
export function Field(props) {
    const sty = parseSty(props);
    const value = props.value ?? signal(``);
    let inputElement = undefined;
    const inputElementHasFocus = signal(props.hasFocus ?? false);
    const scale = computed(() => sty.scale ?? (props.heading ? 1.5 : props.title ? 1.25 : 1));
    // Input
    function setTempValue(newValue) {
        const stringValue = newValue ?? ``;
        if (exists(props.tempValue)) {
            props.tempValue.value = stringValue;
        }
        else {
            value.value = stringValue;
        }
    }
    function getTempValue() {
        return props.tempValue?.value ?? value.value ?? ``;
    }
    watchDeps([value], () => {
        if (!props.hasFocus) {
            setTempValue(value.value);
        }
    });
    function handleInput(uncastEvent) {
        const event = uncastEvent;
        let newInput = event.target?.value ?? "";
        let position = null;
        if (exists(props.formatInput)) {
            let formattedResult = props.formatInput(newInput, event);
            newInput = formattedResult.input;
            position = formattedResult.caret;
        }
        event.target.value = newInput;
        setTempValue(newInput);
        if (position !== null) {
            event.target.setSelectionRange(position, position);
        }
    }
    function handleKeyPress(event) {
        const nextInput = predictNextInput(event.key);
        if (exists(nextInput) && exists(props.validateNextInput)) {
            return props.validateNextInput(nextInput);
        }
        else {
            return true;
        }
    }
    function handlePaste(event) {
        const nextInput = predictNextInput(event.clipboardData?.getData("text") ?? ``);
        if (exists(nextInput) && exists(props.validateNextInput)) {
            return props.validateNextInput(nextInput);
        }
        else {
            return true;
        }
    }
    function predictNextInput(newText) {
        const input = inputElement;
        if (!exists(input))
            return;
        return (input.value.slice(0, input.selectionStart) +
            newText +
            input.value.slice(input.selectionEnd));
    }
    // Focus
    let valueOnFocus = value.value;
    const handleFocus = (e) => {
        valueOnFocus = value.value;
        inputElementHasFocus.value = true;
        if (exists(props.hasFocus)) {
            props.hasFocus.value = true;
        }
    };
    const handleBlur = (e) => {
        const tempValueIsDifferentThanProp = getTempValue() !== value.value;
        const haveTypedSomething = getTempValue() !== valueOnFocus;
        if (haveTypedSomething && tempValueIsDifferentThanProp) {
            value.value = getTempValue();
        }
        else if (!haveTypedSomething && tempValueIsDifferentThanProp) {
            // If someone else changed the value, and we didn't, then get the new value.
            setTempValue(value.value);
        }
        inputElementHasFocus.value = false;
        if (exists(props.hasFocus)) {
            props.hasFocus.value = false;
        }
    };
    watchEffect(() => {
        if (props.hasFocus?.value !== (inputElement === document.activeElement)) {
            if (props.hasFocus) {
                inputElement?.focus();
            }
            else {
                inputElement?.blur();
            }
        }
    });
    const underlineHeight = computed(() => props.underlined ? 0.25 * scale.value : 0);
    const detailColor = computed(() => inputElementHasFocus.value
        ? $theme.colors.primary
        : value.value === `` || !exists(value.value)
            ? $theme.colors.hint
            : props.sty?.textColor ?? $theme.colors.text);
    onMount(() => {
        if (props.hasFocus) {
            inputElement?.focus();
        }
    });
    function tryFocus() {
        inputElement?.focus();
    }
    function _Input() {
        const inputProps = {
            ref: (el) => (inputElement = el),
            // type="text"
            inputmode: props.keyboard,
            value: value.value,
            onInput: handleInput,
            onFocus: handleFocus,
            onBlur: handleBlur,
            placeholder: props.hintText,
            onKeyPress: handleKeyPress,
            onPaste: handlePaste,
            class: "field",
            rows: exists(props.lineCount) ? props.lineCount : undefined,
            wrap: props.lineCount !== 1 ? `soft` : undefined,
            style: {
                padding: `0px`,
                margin: `0px`,
                [`overflow-y`]: `visible`,
                [`line-height`]: sizeToCss(scale.value),
                [`--placeholder-color`]: props.hintColor,
                [`caret-color`]: $theme.colors.primary,
            },
        };
        return (props.lineCount ?? 1) > 1 ? (<textarea {...inputProps}/>) : (<input {...inputProps}/>);
    }
    return (<Row onClick={props.onClick ?? (() => tryFocus())} width={grow()} height={exists(props.lineCount)
            ? scale.value * props.lineCount + underlineHeight.value
            : undefined} textColor={$theme.colors.text} padBetween={0.25} overflowY={$Overflow.forceStretchParent} align={$Align.topLeft} {...sty} scale={scale.value}>
      <Show when={exists(props.icon) && props.icon !== ``}>
        <Icon icon={props.icon} color={detailColor.value} size={scale.value}/>
      </Show>

      <Show when={props.underlined} fallback={<_Input />}>
        <Box width={grow()} height={exists(props.lineCount) ? scale.value * props.lineCount : undefined}>
          <Column width={grow()}>
            <Row width={grow()}>
              <Box width={0.25}/>
              <Box width={grow()}>
                <_Input />
              </Box>
              <Box width={0.25}/>
            </Row>
          </Column>

          {/* Underline */}
          <Box width={grow()} height={underlineHeight.value} align={$Align.bottomLeft}>
            <Box width={grow()} height={0.0625} background={detailColor.value}/>
          </Box>
        </Box>
      </Show>
    </Row>);
}
