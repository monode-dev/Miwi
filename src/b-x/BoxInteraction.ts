import { exists } from 'src/utils'
import { ParseProp } from './BoxUtils'

export type InteractionSty = {
  role: string
  bonusTouchArea: boolean
  preventClickPropagation: boolean
  cssCursor: 'pointer' | 'default'
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: (e: MouseEvent) => void
}

const bonusTouchAreaClassName = `b-x-bonus-touch-area`
const style = document.createElement(`style`)
style.textContent = `
.${bonusTouchAreaClassName}::before {
  content: '';
  position: absolute;
  top: -1rem;
  right: -1rem;
  bottom: -1rem;
  left: -1rem;
  z-index: -1;
}
`
document.body.appendChild(style)

export function applyInteractionStyle(
  parseProp: ParseProp<InteractionSty>,
  htmlElement: HTMLElement,
) {
  htmlElement.role = parseProp(`role`) ?? ``
  const onClick = parseProp(`onClick`) ?? null
  const isClickable = exists(onClick)
  const preventClickPropagation = parseProp(`preventClickPropagation`) ?? isClickable
  htmlElement.style.pointerEvents = preventClickPropagation ? `auto` : `none`
  htmlElement.onclick = preventClickPropagation
    ? (e: MouseEvent) => {
        e.stopPropagation()
        onClick?.(e)
      }
    : onClick
  htmlElement.style.cursor = parseProp(`cssCursor`) ?? isClickable ? `pointer` : `default`
  htmlElement.onmouseenter = parseProp(`onMouseEnter`) ?? null
  htmlElement.onmouseleave = parseProp(`onMouseLeave`) ?? null
  htmlElement.classList.toggle(bonusTouchAreaClassName, parseProp(`bonusTouchArea`) ?? false)
}
