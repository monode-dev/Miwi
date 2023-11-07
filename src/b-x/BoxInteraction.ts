import { exists } from 'src/utils'

export type InteractionSty = {
  role: string
  bonusTouchArea: boolean
  preventClickPropagation: boolean
  cssCursor: 'pointer' | 'default'
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: (e: MouseEvent) => void
}

export const bonusTouchAreaClassName = `b-x-bonus-touch-area`

export function applyInteractionStyle(props: Partial<InteractionSty>, htmlElement: HTMLElement) {
  htmlElement.role = props.role ?? ``
  const onClick = props.onClick ?? null
  const isClickable = exists(onClick)
  const preventClickPropagation = props.preventClickPropagation ?? isClickable
  htmlElement.style.pointerEvents = preventClickPropagation ? `auto` : `none`
  htmlElement.onclick = preventClickPropagation
    ? (e: MouseEvent) => {
        e.stopPropagation()
        onClick?.(e)
      }
    : onClick
  htmlElement.style.cursor = props.cssCursor ?? isClickable ? `pointer` : `default`
  htmlElement.onmouseenter = props.onMouseEnter ?? null
  htmlElement.onmouseleave = props.onMouseLeave ?? null
  htmlElement.classList.toggle(bonusTouchAreaClassName, props.bonusTouchArea ?? false)
}
