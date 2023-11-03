import { exists } from 'src/utils'
import { CssProps } from './BoxUtils'

export type InteractionSty = {
  role: string
  captureClicks: boolean
  bonusTouchArea: boolean
  cssCursor: 'pointer' | 'default'
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function computeBoxInteraction(sty: Partial<InteractionSty>): {
  cssProps: CssProps
  elementAttributes: {
    role?: string
    onMouseEnter?: () => void
    onMouseLeave?: () => void
  }
} {
  const captureClicks =
    sty.captureClicks ?? (exists((sty as any).background) || exists((sty as any).onClick))
  return {
    cssProps: {
      pointerEvents: captureClicks ? `auto` : `none`,
      cursor: sty.cssCursor,
    },
    elementAttributes: {
      role: sty.role,
      onMouseEnter: sty.onMouseEnter,
      onMouseLeave: sty.onMouseLeave,
    },
  }
}
