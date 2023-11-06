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
  const isClickable = exists((sty as any).onClick)
  htmlElement.style.pointerEvents = isClickable || sty.preventClickPropagation ? `auto` : `none`
  htmlElement.onclick = sty.preventClickPropagation
    ? (e: any) => {
        e.stopPropagation()
        ;(sty as any).onClick?.()
      }
    : (sty as any).onClick ?? null
  htmlElement.style.cursor = sty.cssCursor ?? isClickable ? `pointer` : `default`
  htmlElement.onmouseenter = sty.onMouseEnter ?? null
  htmlElement.onmouseleave = sty.onMouseLeave ?? null
  htmlElement.classList.toggle(bonusTouchAreaClassName, sty.bonusTouchArea ?? false)
  return sty
})
