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
  const onClickListeners = parseProp(`onClick`, true)
  const isClickable = exists(onClickListeners.length > 0)
  const preventClickPropagation = parseProp(`preventClickPropagation`) ?? isClickable
  htmlElement.style.pointerEvents = preventClickPropagation ? `auto` : `none`
  htmlElement.onclick = preventClickPropagation
    ? (e: MouseEvent) => {
        e.stopPropagation()
        onClickListeners.forEach(listener => listener(e))
      }
    : isClickable
    ? (e: MouseEvent) => onClickListeners.forEach(listener => listener(e))
    : null
  htmlElement.style.cursor = parseProp(`cssCursor`) ?? isClickable ? `pointer` : `default`
  const onMouseEnterListeners = parseProp(`onMouseEnter`, true)
  htmlElement.onmouseenter =
    onMouseEnterListeners.length > 0
      ? () => onMouseEnterListeners.forEach(listener => listener())
      : null
  const onMouseLeaveListeners = parseProp(`onMouseLeave`, true)
  htmlElement.onmouseleave =
    onMouseLeaveListeners.length > 0
      ? () => onMouseLeaveListeners.forEach(listener => listener())
      : null
  htmlElement.classList.toggle(bonusTouchAreaClassName, parseProp(`bonusTouchArea`) ?? false)
}
