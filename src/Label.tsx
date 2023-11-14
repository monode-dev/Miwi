import { BoxProps } from './Box/Box'
import { compute, exists } from './utils'
import { Row } from './Row'
import { Txt } from './Txt'

export function Label(
  props: {
    label?: string
    hint?: boolean
  } & BoxProps,
) {
  const shouldShowLabel = compute(() => exists(props.label) && props.label.length > 0)

  return shouldShowLabel.value ? (
    <Row widthGrows padBetween={0.25} alignTopLeft overrideProps={props}>
      <Txt hint={props.hint ?? false}>{props.label}:</Txt>
      {props.children}
    </Row>
  ) : (
    props.children
  )
}
