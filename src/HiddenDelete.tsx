import { sig } from './utils'
import { BoxProps } from './Box/Box'
import { Icon } from './Icon'
import { Modal } from './Modal'
import { Row } from './Row'
import { Txt } from './Txt'
import { mdiClose, mdiDelete, mdiDotsVertical } from '@mdi/js'

export function HiddenDelete(
  props: {
    onDelete?: () => void
  } & BoxProps,
) {
  const scale = props.scale ?? 1
  const isOpen = sig(false)
  return (
    <Modal
      openButton={
        <Icon
          size={scale}
          iconPath={mdiDotsVertical}
          onClick={() => (isOpen.value = !isOpen.value)}
        />
      }
      openButtonWidth={scale}
      openButtonHeight={scale}
      isOpenSig={isOpen}
    >
      <Row scale={scale} alignCenterLeft padBetween={0.25} onClick={() => (isOpen.value = false)}>
        <Txt>Cancel</Txt>
        <Icon iconPath={mdiClose} />
      </Row>
      {props.children}
      <Row
        scale={scale}
        alignCenterLeft
        padBetween={0.25}
        onClick={() => {
          isOpen.value = false
          props.onDelete?.()
        }}
        textColor={$theme.colors.error}
      >
        <Txt>Delete</Txt>
        <Icon iconPath={mdiDelete} />
      </Row>
    </Modal>
  )
}
