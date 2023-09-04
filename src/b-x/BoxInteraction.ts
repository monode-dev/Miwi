import { exists } from 'src/utils'
import { CssProps } from './BoxUtils'

export type InteractionSty = {
  isInteractable: boolean
  bonusTouchArea: boolean
  cssCursor: 'pointer' | 'default'
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function computeBoxInteraction(sty: Partial<InteractionSty>): {
  cssProps: CssProps
  elementAttributes: {
    onMouseEnter?: () => void
    onMouseLeave?: () => void
  }
} {
  return {
    cssProps: {
      pointerEvents:
        sty.isInteractable === undefined ? undefined : sty.isInteractable ? `auto` : `none`,
      cursor: sty.cssCursor,
    },
    elementAttributes: {
      onMouseEnter: sty.onMouseEnter,
      onMouseLeave: sty.onMouseLeave,
    },
  }
}
