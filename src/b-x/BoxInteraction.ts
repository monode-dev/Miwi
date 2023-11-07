import { exists } from 'src/utils'
import { textStyler } from './BoxText'

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

export const interactionStyler = textStyler.addStyler<InteractionSty>((rawProps, htmlElement) => {
  htmlElement.role = rawProps.role ?? ``
  const onClick = rawProps.onClick ?? null
  const isClickable = exists(onClick)
  const preventClickPropagation = rawProps.preventClickPropagation ?? isClickable
  htmlElement.style.pointerEvents = preventClickPropagation ? `auto` : `none`
  htmlElement.onclick = preventClickPropagation
    ? (e: MouseEvent) => {
        e.stopPropagation()
        onClick?.(e)
      }
    : onClick
  htmlElement.style.cursor = rawProps.cssCursor ?? isClickable ? `pointer` : `default`
  htmlElement.onmouseenter = rawProps.onMouseEnter ?? null
  htmlElement.onmouseleave = rawProps.onMouseLeave ?? null
  htmlElement.classList.toggle(bonusTouchAreaClassName, rawProps.bonusTouchArea ?? false)
})
