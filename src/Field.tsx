import { Show, onCleanup, onMount } from 'solid-js'
import { Box, BoxProps } from './Box/Box'
import { Row } from './Row'
import { Icon } from './Icon'
import { compute, sig, Sig, watchDeps, watchEffect, exists } from './utils'
import { Column } from './Column'
// import { sizeToCss } from './Box/BoxUtils'

export type KeyboardType =
  | 'none'
  | 'text'
  | 'tel'
  | 'url'
  | 'email'
  | 'numeric'
  | 'decimal'
  | 'search'
type FormattedResult = {
  input: string
  caret: number
}
export function Field(
  props: {
    valueSig?: Sig<string>
    tempValueSig?: Sig<string>
    hasFocusSig?: Sig<boolean>
    hintText?: string
    hintColor?: string
    lineCount?: number
    limitLines?: boolean
    underlined?: boolean
    scale?: number
    iconPath?: string
    keyboard?: KeyboardType
    heading?: boolean
    title?: boolean
    validateNextInput?: (nextInput: string) => boolean
    formatInput?: (nextInput: string, event: InputEvent) => FormattedResult
  } & BoxProps,
) {
  const value = props.valueSig ?? sig(``)
  let inputElement: HTMLInputElement | HTMLTextAreaElement | undefined = undefined
  const inputElementHasFocus = props.hasFocusSig ?? sig(false)
  const scale = compute(() => props.scale ?? (props.heading ? 1.5 : props.title ? 1.25 : 1))

  // Input
  function setTempValue(newValue: string | undefined | null) {
    const stringValue = newValue ?? ``
    if (exists(props.tempValueSig)) {
      props.tempValueSig.value = stringValue
    } else {
      value.value = stringValue
    }
  }
  function getTempValue() {
    return props.tempValueSig?.value ?? value.value
  }
  watchDeps([value], () => {
    if (!inputElementHasFocus.value) {
      setTempValue(value.value)
    }
  })
  function handleInput(uncastEvent: Event) {
    const event = uncastEvent as InputEvent
    let newInput = (event.target as any)?.value ?? ''
    let position = null

    if (exists(props.formatInput)) {
      const formattedResult = props.formatInput(newInput, event)
      newInput = formattedResult.input
      position = formattedResult.caret
    }

    ;(event.target as any).value = newInput

    setTempValue(newInput)

    if (position !== null) {
      ;(event.target as any).setSelectionRange(position, position)
    }
  }
  function handleKeyPress(event: KeyboardEvent) {
    validateInput(event, event.key === `Enter` ? `\n` : event.key)
  }
  function handlePaste(event: ClipboardEvent) {
    validateInput(event, event.clipboardData?.getData('text') ?? ``)
  }
  function validateInput(event: Event, newText: string) {
    const nextInput = predictNextInput(newText)
    console.log(nextInput)
    if (exists(nextInput) && (props.limitLines ?? true)) {
      if (nextInput.split('\n').length > (props.lineCount ?? 1)) {
        event.preventDefault()
      }
    }
    if (exists(nextInput) && exists(props.validateNextInput)) {
      if (!props.validateNextInput(nextInput)) {
        event.preventDefault()
      }
    }
  }
  function predictNextInput(newText: string) {
    const input = inputElement
    if (!exists(input)) return
    return (
      input.value.slice(0, input.selectionStart!) + newText + input.value.slice(input.selectionEnd!)
    )
  }

  // Focus
  let valueOnFocus = value.value
  const handleFocus = () => {
    if (getTempValue() !== value.value) {
      setTempValue(value.value)
    }
    valueOnFocus = value.value
    inputElementHasFocus.value = true
  }

  const handleBlur = () => {
    const tempValueIsDifferentThanProp = getTempValue() !== value.value
    const haveTypedSomething = getTempValue() !== valueOnFocus
    if (haveTypedSomething && tempValueIsDifferentThanProp) {
      value.value = getTempValue()
    } else if (!haveTypedSomething && tempValueIsDifferentThanProp) {
      // If someone else changed the value, and we didn't, then get the new value.
      setTempValue(value.value)
    }
    inputElementHasFocus.value = false
  }
  watchEffect(() => {
    if (inputElementHasFocus.value !== (inputElement === document.activeElement)) {
      if (inputElementHasFocus.value) {
        tryFocus()
      } else {
        inputElement?.blur()
      }
    }
  })

  const underlineHeight = compute(() => (props.underlined ? 0.5 * scale.value : 0))

  const detailColor = compute(() =>
    inputElementHasFocus.value
      ? $theme.colors.primary
      : value.value === `` || !exists(value.value)
      ? $theme.colors.hint
      : props.textColor ?? $theme.colors.text,
  )

  onMount(() => {
    if (inputElementHasFocus.value) {
      // Focus on next frame
      const frameId = requestAnimationFrame(() => inputElement?.focus())
      onCleanup(() => cancelAnimationFrame(frameId))
    }
  })

  function tryFocus() {
    inputElement?.focus()
  }

  // TODO: Tapping on the field does not move the cursor.
  const lineCount = props.lineCount ?? 1
  function _Input(_inputProps: { value: string }) {
    const inputProps = {
      ref: (el: HTMLInputElement | HTMLTextAreaElement) => (inputElement = el),
      // type="text"
      inputmode: props.keyboard,
      value: _inputProps.value,
      onInput: handleInput,
      onFocus: handleFocus,
      onBlur: handleBlur,
      placeholder: props.hintText,
      onKeyPress: handleKeyPress,
      onPaste: handlePaste,
      class: 'field',
      rows: exists(lineCount) ? lineCount : undefined,
      wrap: lineCount !== 1 ? (`soft` as const) : undefined,
      style: {
        border: 'none',
        'background-color': 'transparent',
        outline: 'none',
        'font-family': 'inherit',
        'font-size': 'inherit',
        'font-weight': 'inherit',
        color: 'inherit',
        padding: '0px',
        margin: '0px',
        width: '100%',
        overflow: 'visible',
        resize: 'none' as const,
        [`overflow-y`]: `visible` as const,
        // [`line-height`]: sizeToCss(scale.value),
        [`caret-color`]: $theme.colors.primary,
        '--miwi-placeholder-color': props.hintColor ?? $theme.colors.hint,
      },
    }
    return lineCount > 1 ? <textarea {...inputProps} /> : <input {...inputProps} />
  }
  return (
    <Row
      onClick={() => tryFocus()}
      widthGrows
      height={exists(lineCount) ? scale.value * lineCount + underlineHeight.value : undefined}
      textColor={$theme.colors.text}
      padBetweenX={0.25}
      padBetweenY={0}
      overflowY={$Overflow.forceStretchParent}
      alignTopLeft
      overrideProps={props}
      overrideOverrides={{
        scale: scale.value,
      }}
    >
      {/* Icon */}
      <Show when={exists(props.iconPath) && props.iconPath !== ``}>
        <Icon iconPath={props.iconPath!} color={detailColor.value} size={scale.value} />
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
            <Box widthGrows height={0.0625} background={detailColor.value} />
          </Box>
        </Column>
      </Show>
    </Row>
  )
}
