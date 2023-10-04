import { sig } from './utils'
import { Box, BoxProps, grow, parseSty } from './Box'
import { Icon } from './Icon'
import { Modal } from './Modal'
import { Row } from './Row'
import { Txt } from './Txt'
import { mdiClose, mdiDotsVertical } from '@mdi/js'

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
      openButton={<Icon iconPath={mdiDotsVertical} onClick={() => (isOpen.value = true)} />}
      openButtonWidth={scale}
      openButtonHeight={scale}
      isOpenSig={isOpen}
    >
      <Row scale={scale} onClick={() => (isOpen.value = false)} width={grow()}>
        <Txt width={grow()}>Cancel</Txt>
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
        <Txt width={grow()}>Delete</Txt>
        {/* <Icon icon="delete" /> */}
      </Row>
    </Modal>
  )
}
