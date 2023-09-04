import { BoxProps } from './Box'
import { compute, exists } from './utils'
import { Row } from './Row'
import { Say } from './Say'

export function Label(
  props: {
    label?: string
    hint?: boolean
  } & BoxProps,
) {
  const shouldShowLabel = compute(() => exists(props.label) && props.label.length > 0)

  return shouldShowLabel.value ? (
    <Row
      sty={{
        width: `1f`,
        padBetween: 0.25,
        align: $Align.topLeft,
        ...props.sty,
      }}
    >
      <Say hint={props.hint ?? false}>{props.label}:</Say>
      {props.children}
    </Row>
  ) : (
    props.children
  )
}
