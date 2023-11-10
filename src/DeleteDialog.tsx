import { Box, BoxProps } from './Box'
import { Card } from './Card'
import { Button } from './Button'
import { Row } from './Row'
import { Txt } from './Txt'
import { pageTransitions, popPage } from './Nav'

// export default {
//   transitions: pageTransitions.fadeIn(),
// };

export function DeleteDialog(props: BoxProps & { onDelete?: () => void; message: string }) {
  let cardRef: HTMLElement | undefined = undefined

  function closePopUp() {
    popPage()
  }
  function handleYes() {
    closePopUp()
    props.onDelete?.()
  }

  // Close the pop up when the user clicks outside of it
  function popOnClickOutside(e: MouseEvent) {
    if (cardRef?.contains(e.target as any)) {
      return
    }
    closePopUp()
    e.stopPropagation()
  }

  return (
    <>
      <Box onClick={popOnClickOutside} widthGrows heightGrows background={`#00000099`}>
        <Card ref={cardRef} width={`75%`} shadowSize={0}>
          <Txt height={-1} widthGrows overflowX={$Overflow.wrap}>
            {props.message}
          </Txt>
          <Row widthGrows spaceEvenly>
            <Button outlined onClick={handleYes}>
              Yes
            </Button>
            <Button onClick={closePopUp}>No</Button>
          </Row>
        </Card>
      </Box>
      ;
    </>
  )
}
