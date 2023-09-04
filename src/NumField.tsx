import { BoxProps } from './Box'
import { sig, Sig, watchDeps, exists } from './utils'
import { Field, KeyboardType } from './Field'

export function NumField(
  props: {
    valueSig?: Sig<number | null>
    negativesAreAllowed?: boolean
    hasFocusSig?: Sig<boolean>
    hint?: string
    hintColor?: string
    icon?: string
    underlined?: boolean
    title?: boolean
    heading?: boolean
    keyboard?: KeyboardType
  } & BoxProps,
) {
  const keyboard = props.keyboard ?? 'decimal'
  const _stringValue = sig(props.valueSig?.toString() ?? '')

  if (exists(props.valueSig)) {
    watchDeps([props.valueSig], () => {
      const value = props.valueSig?.value
      if (!exists(value)) {
        _stringValue.value = ''
      } else if (textToNumber(_stringValue.value) !== value) {
        _stringValue.value = value.toString()
      }
    })
    watchDeps([_stringValue], () => {
      if (_stringValue.value === '') {
        props.valueSig!.value = null
      } else {
        if (!validateInput(_stringValue.value)) return
        const asNumber = textToNumber(_stringValue.value)
        if (asNumber === props.valueSig!.value) return
        props.valueSig!.value = asNumber
      }
    })
  }

  function textToNumber(text: string): number | null {
    const withoutCommas = text.replaceAll(',', '')
    return withoutCommas.length > 0 ? Number(withoutCommas) : null
  }

  function validateInput(newInput: string) {
    const asNumber = textToNumber(newInput)
    if (!exists(asNumber)) return true
    if (!props.negativesAreAllowed && asNumber! < 0) return false
    if (Number.isNaN(asNumber!)) return false
    return true
  }

  return (
    <div>
      <Field
        valueSig={_stringValue}
        hasFocusSig={props.hasFocusSig}
        hintText={props.hint}
        hintColor={props.hintColor}
        iconPath={props.icon}
        underlined={props.underlined}
        title={props.title}
        heading={props.heading}
        validateNextInput={validateInput}
        keyboard={keyboard}
      />
    </div>
  )
}
