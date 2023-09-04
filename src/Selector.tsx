import { Sig, compute, exists, injectDefaults, sig, watchDeps } from './utils'
import { BoxProps, grow, parseSty } from './Box'
import { Say } from './Say'
import { Row } from './Row'
import { Icon } from './Icon'
import { Modal } from './Modal'
import { mdiClose, mdiMenuDown } from '@mdi/js'
import { Field } from './Field'

export function Selector<T>(
  props: {
    value: T
    getLabelForData: (data: T) => string | null
    noneLabel?: string
    modalIsOpenSig?: Sig<boolean>
    emptyListText?: string
    filterStringSig?: Sig<string>
    showCancelOptionForFilter?: boolean
    isWide?: boolean
  } & BoxProps,
) {
  props = injectDefaults(props, {
    noneLabel: `None`,
    emptyListText: `No Options`,
    isWide: false,
  })
  const sty = parseSty(props)
  const selectedLabel = compute(() => {
    return props.getLabelForData(props.value) ?? props.noneLabel
  })
  const thereAreNoOptions = compute(() => {
    return !exists(props.children) || (Array.isArray(props.children) && props.children.length === 0)
  })

  //
  const _modalIsOpen = sig(props.modalIsOpenSig?.value ?? false)
  if (exists(props.modalIsOpenSig)) {
    watchDeps([props.modalIsOpenSig], () => {
      if (_modalIsOpen.value === props.modalIsOpenSig!.value) return
      if (props.modalIsOpenSig) {
        openDropDown()
      } else {
        closeDropDown()
      }
    })
    watchDeps([_modalIsOpen], () => {
      if (_modalIsOpen.value === props.modalIsOpenSig!.value) return
      props.modalIsOpenSig!.value = _modalIsOpen.value
    })
  }

  //
  function openDropDown() {
    if (_modalIsOpen.value) return
    _modalIsOpen.value = true
  }
  function closeDropDown() {
    if (!_modalIsOpen.value) return
    _modalIsOpen.value = false
    if (exists(props.filterStringSig)) {
      props.filterStringSig.value = ``
    }
  }
  return (
    <Modal
      openButton={
        <Row
          onClick={() => {
            if (exists(props.filterStringSig)) {
              openDropDown()
            } else {
              if (_modalIsOpen.value) {
                _modalIsOpen.value = false
              } else {
                openDropDown()
              }
            }
          }}
          width={grow()}
          height={sty.scale ?? 1}
          align={$Align.spaceBetween}
        >
          {' '}
          {!exists(props.filterStringSig) || !_modalIsOpen.value ? (
            <Say
              width={grow()}
              overflowX={$Overflow.crop}
              textColor={exists(props.value) ? $theme.colors.text : $theme.colors.hint}
            >
              {selectedLabel.value}
            </Say>
          ) : (
            <Field valueSig={props.filterStringSig} hintText="Search" hasFocusSig={sig(true)} />
          )}
          <Icon
            iconPath={exists(props.filterStringSig) && _modalIsOpen.value ? mdiClose : mdiMenuDown}
            onClick={() => {
              if (_modalIsOpen.value) {
                _modalIsOpen.value = false
              } else {
                openDropDown()
              }
            }}
          />
        </Row>
      }
      openButtonWidth={grow()}
      openButtonHeight={sty.scale ?? 1}
      isOpenSig={_modalIsOpen}
      modalWidth={props.isWide ? `100%` : undefined}
    >
      {/* SECTION: No Options */}
      {thereAreNoOptions.value ? undefined : (
        <Say hint onClick={() => (_modalIsOpen.value = false)} width={grow()}>
          {props.emptyListText}
        </Say>
      )}

      {/* SECTION: Cancel */}
      {exists(props.filterStringSig) && props.showCancelOptionForFilter && !thereAreNoOptions.value ? (
        <Say hint onClick={() => (_modalIsOpen.value = false)} width={grow()}>
          Cancel
        </Say>
      ) : undefined}

      {/* SECTION: Custom Options */}
      {props.children}
    </Modal>
  )
}
