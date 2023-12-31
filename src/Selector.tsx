import { mdiClose, mdiMenuDown } from '@mdi/js'
import { Show } from 'solid-js'
import { BoxProps } from './Box/Box'
import { grow } from './Box/BoxSize'
import { Field } from './Field'
import { Icon } from './Icon'
import { Modal } from './Modal'
import { Row } from './Row'
import { Txt } from './Txt'
import { Sig, compute, sig, exists, watchDeps } from './utils'

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
  // DEFAULT PROPERTIES
  const noneLabel = compute(() => props.noneLabel ?? 'None')
  const emptyListText = compute(() => props.emptyListText ?? 'No Options')
  const isWide = compute(() => props.isWide ?? false)
  const _modalIsOpen = sig(props.modalIsOpenSig?.value ?? false)

  const selectedLabel = compute(() => props.getLabelForData(props.value) ?? noneLabel.value)

  const thereAreNoOptions = compute(() => {
    return !exists(props.children) || (Array.isArray(props.children) && props.children.length === 0)
  })

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

  if (exists(props.modalIsOpenSig)) {
    watchDeps([props.modalIsOpenSig], () => {
      if (!exists(props.modalIsOpenSig)) return
      if (_modalIsOpen.value === props.modalIsOpenSig.value) return
      if (props.modalIsOpenSig.value) {
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
          widthGrows
          height={props.scale ?? 1}
          spaceBetween
        >
          {' '}
          {!exists(props.filterStringSig) || !_modalIsOpen.value ? (
            <Txt
              widthGrows
              overflowX={$Overflow.crop}
              textColor={exists(props.value) ? $theme.colors.text : $theme.colors.hint}
            >
              {selectedLabel.value}
            </Txt>
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
      openButtonHeight={props.scale ?? 1}
      isOpenSig={_modalIsOpen}
      modalWidth={isWide.value ? `100%` : undefined}
    >
      {/* SECTION: No Options */}
      <Show when={thereAreNoOptions.value}>
        <Txt hint onClick={() => (_modalIsOpen.value = false)} widthGrows>
          {emptyListText.value}
        </Txt>
      </Show>

      {/* SECTION: Cancel */}
      {exists(props.filterStringSig) &&
      props.showCancelOptionForFilter &&
      !thereAreNoOptions.value ? (
        <Txt hint onClick={() => (_modalIsOpen.value = false)} widthGrows>
          Cancel
        </Txt>
      ) : undefined}

      {/* SECTION: Custom Options */}
      {props.children}
    </Modal>
  )
}
