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

export const interactionStyler = textStyler.addStyler<InteractionSty>((attributes, htmlElement) => {
  htmlElement.role = attributes.role ?? ``
  const onClick = attributes.onClick ?? null
  const isClickable = exists(onClick)
  const preventClickPropagation = attributes.preventClickPropagation ?? isClickable
  htmlElement.style.pointerEvents = preventClickPropagation ? `auto` : `none`
  htmlElement.onclick = preventClickPropagation
    ? (e: MouseEvent) => {
        e.stopPropagation()
        onClick?.(e)
      }
    : onClick
  htmlElement.style.cursor = attributes.cssCursor ?? isClickable ? `pointer` : `default`
  htmlElement.onmouseenter = attributes.onMouseEnter ?? null
  htmlElement.onmouseleave = attributes.onMouseLeave ?? null
  htmlElement.classList.toggle(bonusTouchAreaClassName, attributes.bonusTouchArea ?? false)
})
