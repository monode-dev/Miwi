import { sig } from './utils'
import { Box, BoxProps, parseSty } from './Box'
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
  const sty = parseSty(props)
  const scale = sty.scale ?? 1
  const isOpen = sig(false)
  return (
    <Modal
      openButton={
        <Icon
          iconPath={mdiDotsVertical}
          onClick={() => {
            console.log(`clicked`)
            isOpen.value = !isOpen.value
          }}
        />
      }
      openButtonWidth={scale}
      openButtonHeight={scale}
      isOpenSig={isOpen}
    >
      <Row widthGrows scale={scale} onClick={() => (isOpen.value = false)}>
        <Txt widthGrows>Cancel</Txt>
        <Icon iconPath={mdiClose} />
      </Row>
      {props.children}
      <Row
        scale={scale}
        onClick={() => {
          isOpen.value = false
          props.onDelete?.()
        }}
        textColor={$theme.colors.error}
      >
        <Txt widthGrows>Delete</Txt>
        <Icon iconPath={mdiDelete} />
      </Row>
    </Modal>
  )
}
