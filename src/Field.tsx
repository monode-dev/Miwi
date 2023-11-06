import { Show, onMount } from 'solid-js'
import { Box, BoxProps, parseSty } from './Box'
import { Row } from './Row'
import { Icon } from './Icon'
import { compute, sig, Sig, watchDeps, watchEffect, exists } from './utils'
import { Column } from './Column'
import { sizeToCss } from './b-x/BoxUtils'

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
  const sty = parseSty(props)

  const value = props.valueSig ?? sig(``)
  let inputElement: HTMLInputElement | HTMLTextAreaElement | undefined = undefined
  const inputElementHasFocus = sig(props.hasFocusSig ?? false)
  const scale = compute(
    () => (sty.scale ?? (props.heading ? 1.5 : props.title ? 1.25 : 1)) as number,
  )

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
    if (!props.hasFocusSig) {
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
    const nextInput = predictNextInput(event.key)
    if (exists(nextInput) && exists(props.validateNextInput)) {
      return props.validateNextInput(nextInput)
    } else {
      return true
    }
  }
  function handlePaste(event: ClipboardEvent) {
    const nextInput = predictNextInput(event.clipboardData?.getData('text') ?? ``)
    if (exists(nextInput) && exists(props.validateNextInput)) {
      return props.validateNextInput(nextInput)
    } else {
      return true
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
    valueOnFocus = value.value
    inputElementHasFocus.value = true
    if (exists(props.hasFocusSig)) {
      props.hasFocusSig.value = true
    }
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
    if (exists(props.hasFocusSig)) {
      props.hasFocusSig.value = false
    }
  }
  watchEffect(() => {
    if (props.hasFocusSig?.value !== (inputElement === document.activeElement)) {
      if (props.hasFocusSig) {
        inputElement?.focus()
      } else {
        inputElement?.blur()
      }
    }
  })

  const underlineHeight = compute(() => (props.underlined ? 0.25 * scale.value : 0))

  const detailColor = compute(() =>
    inputElementHasFocus.value
      ? $theme.colors.primary
      : value.value === `` || !exists(value.value)
      ? $theme.colors.hint
      : props.textColor ?? $theme.colors.text,
  )

  onMount(() => {
    if (props.hasFocusSig) {
      inputElement?.focus()
    }
  })

  function tryFocus() {
    inputElement?.focus()
  }

  const lineCount = props.lineCount ?? 1
  function _Input() {
    const inputProps = {
      ref: (el: HTMLInputElement | HTMLTextAreaElement) => (inputElement = el),
      // type="text"
      inputmode: props.keyboard,
      value: value.value,
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
        [`line-height`]: sizeToCss(scale.value),
        [`caret-color`]: $theme.colors.primary,
        '--miwi-placeholder-color': props.hintColor ?? $theme.colors.hint,
      },
    }
    return lineCount > 1 ? <textarea {...inputProps} /> : <input {...inputProps} />
  }
  console.log(props.onClick)
  return (
    <Row
      background="red"
      onClick={
        props.onClick ??
        (() => {
          tryFocus()
          // console.log(`Field clicked!`)
        })
      }
      widthGrows
      height={exists(lineCount) ? scale.value * lineCount + underlineHeight.value : undefined}
      textColor={$theme.colors.text}
      padBetween={0.25}
      overflowY={$Overflow.forceStretchParent}
      alignTopLeft
      {...sty}
      scale={scale.value}
    >
      <Show when={exists(props.iconPath) && props.iconPath !== ``}>
        <Icon iconPath={props.iconPath!} color={detailColor.value} size={scale.value} />
      </Show>

      <Show when={props.underlined} fallback={<_Input />}>
        <Box widthGrows height={exists(lineCount) ? scale.value * lineCount : undefined}>
          <Column widthGrows>
            <Row widthGrows>
              <Box width={0.25} />
              <Box widthGrows>
                <_Input />
              </Box>
              <Box width={0.25} />
            </Row>
          </Column>

          {/* Underline */}
          <Box widthGrows height={underlineHeight.value} alignBottomLeft>
            <Box widthGrows height={0.0625} background={detailColor.value} />
          </Box>
        </Box>
      </Show>
    </Row>
  )
}
