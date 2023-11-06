import { exists } from 'src/utils'
import { textStyler } from './BoxText'

export type InteractionSty = {
  role: string
  bonusTouchArea: boolean
  preventClickPropagation: boolean
  cssCursor: 'pointer' | 'default'
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export const bonusTouchAreaClassName = `b-x-bonus-touch-area`

export const interactionStyler = textStyler.addStyler<InteractionSty>((sty, htmlElement) => {
  htmlElement.role = sty.role ?? ``
  const onClick: null | (() => void) = (sty as any).onClick ?? null
  const isClickable = exists(onClick)
  const preventClickPropagation = sty.preventClickPropagation ?? isClickable
  htmlElement.style.pointerEvents = preventClickPropagation ? `auto` : `none`
  htmlElement.onclick = preventClickPropagation
    ? (e: any) => {
        e.stopPropagation()
        onClick?.()
      }
    : onClick
  htmlElement.style.cursor = sty.cssCursor ?? isClickable ? `pointer` : `default`
  htmlElement.onmouseenter = sty.onMouseEnter ?? null
  htmlElement.onmouseleave = sty.onMouseLeave ?? null
  htmlElement.classList.toggle(bonusTouchAreaClassName, sty.bonusTouchArea ?? false)
  return sty
})
