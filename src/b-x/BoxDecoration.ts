import { exists, sizeToCss } from './BoxUtils'
import { Align, AlignTwoAxis, _FlexAlign, _SpaceAlign } from './BoxLayout'
import { sizeStyler } from './BoxSize'

export type DecorationSty = {
  cornerRadius: number | string
  cornerRadiusTopLeft: number | string
  cornerRadiusTopRight: number | string
  cornerRadiusBottomRight: number | string
  cornerRadiusBottomLeft: number | string
  outlineColor: string
  outlineSize: number
  background: string
  shadowSize: number
  shadowDirection: ShadowDirection
  zIndex: number
}

export type ShadowDirection = {
  [Key in keyof AlignTwoAxis]: Exclude<AlignTwoAxis[Key], _SpaceAlign>
}

export const mdColors = {
  white: `#ffffffff`,
  almostWhite: `#f9fafdff`,
  pink: `#e91e63ff`,
  red: `#f44336ff`,
  orange: `#ff9800ff`,
  yellow: `#ffea00ff`,
  dataplateyellow: '#f2b212', // Added by Jorge to Dataplate project.
  green: `#4caf50ff`,
  teal: `#009688ff`,
  blue: `#2196f3ff`,
  purple: `#9c27b0ff`,
  brown: `#795548ff`,
  grey: `#9e9e9eff`,
  black: `#000000ff`,
  transparent: `#ffffff00`,
  sameAsText: `currentColor`,
} as const

// We might be able to infer everything we need from these compute functions, which could make updates even easier to make. If we did this, then we'd want to use another function to generate these compute functions.
export const decorationStyler = sizeStyler.addStyler<DecorationSty>((sty, htmlElement) => {
  // Corner Radius
  const cornerRadiuses = [
    sty.cornerRadiusTopLeft ?? sty.cornerRadius ?? 0,
    sty.cornerRadiusTopRight ?? sty.cornerRadius ?? 0,
    sty.cornerRadiusBottomRight ?? sty.cornerRadius ?? 0,
    sty.cornerRadiusBottomLeft ?? sty.cornerRadius ?? 0,
  ]
  htmlElement.style.borderRadius = cornerRadiuses.every(r => r === 0)
    ? ``
    : cornerRadiuses.map(sizeToCss).join(` `)

  // Outline
  htmlElement.style.outline = exists(sty.outlineSize)
    ? `${sizeToCss(sty.outlineSize)} solid ${sty.outlineColor}`
    : ``
  htmlElement.style.outlineOffset = exists(sty.outlineSize) ? `-${sizeToCss(sty.outlineSize)}` : ``

  // Background
  const backgroundIsImage =
    (sty.background?.startsWith(`data:image`) || sty.background?.startsWith(`/`)) ?? false
  htmlElement.style.backgroundColor = backgroundIsImage ? `` : sty.background ?? ``
  htmlElement.style.backgroundImage = backgroundIsImage ? `url('${sty.background}')` : ``
  htmlElement.style.backgroundSize = `cover`
  htmlElement.style.backgroundPosition = `center`
  htmlElement.style.backgroundRepeat = `no-repeat`

  // Shadow
  const alignShadowDirection: ShadowDirection = sty.shadowDirection ?? Align.bottomRight
  const shadowDirection = {
    x:
      alignShadowDirection.alignX === _FlexAlign.start
        ? -1
        : alignShadowDirection.alignX === _FlexAlign.center
        ? 0
        : 1,
    y:
      alignShadowDirection.alignY === _FlexAlign.start
        ? 1
        : alignShadowDirection.alignY === _FlexAlign.center
        ? 0
        : -1,
  }
  htmlElement.style.boxShadow = exists(sty.shadowSize)
    ? `${sizeToCss(0.09 * sty.shadowSize * shadowDirection.x)} ${sizeToCss(
        -0.09 * sty.shadowSize * shadowDirection.y,
      )} ${sizeToCss(0.4 * sty.shadowSize)} 0 #00000045`
    : ``

  // Z-Index
  htmlElement.style.zIndex = sty.zIndex?.toString() ?? ``
  return sty
})
