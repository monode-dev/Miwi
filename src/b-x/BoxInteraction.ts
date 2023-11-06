import { exists } from 'src/utils'
import { textStyler } from './BoxText'

export type InteractionSty = {
  role: string
  captureClicks: boolean
  bonusTouchArea: boolean
  cssCursor: 'pointer' | 'default'
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export const bonusTouchAreaClassName = `b-x-bonus-touch-area`

export const interactionStyler = textStyler.addStyler<InteractionSty>((sty, htmlElement) => {
  htmlElement.role = sty.role ?? ``
  const captureClicks =
    sty.captureClicks ?? (exists((sty as any).background) || exists((sty as any).onClick))
  htmlElement.style.pointerEvents = captureClicks ? `auto` : `none`
  htmlElement.onclick = captureClicks
    ? (e: any) => {
        e.stopPropagation()
        ;(sty as any).onClick?.()
      }
    : null
  htmlElement.style.cursor = sty.cssCursor ?? ``
  htmlElement.onmouseenter = sty.onMouseEnter ?? null
  htmlElement.onmouseleave = sty.onMouseLeave ?? null
  htmlElement.classList.toggle(bonusTouchAreaClassName, sty.bonusTouchArea ?? false)
  return sty
})
