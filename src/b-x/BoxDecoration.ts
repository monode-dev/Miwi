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
export const decorationStyler = sizeStyler.addStyler<DecorationSty>((rawProps, htmlElement) => {
  // Corner Radius
  const cornerRadiuses = [
    rawProps.cornerRadiusTopLeft ?? rawProps.cornerRadius ?? 0,
    rawProps.cornerRadiusTopRight ?? rawProps.cornerRadius ?? 0,
    rawProps.cornerRadiusBottomRight ?? rawProps.cornerRadius ?? 0,
    rawProps.cornerRadiusBottomLeft ?? rawProps.cornerRadius ?? 0,
  ]
  htmlElement.style.borderRadius = cornerRadiuses.every(r => r === 0)
    ? ``
    : cornerRadiuses.map(sizeToCss).join(` `)

  // Outline
  htmlElement.style.outline = exists(rawProps.outlineSize)
    ? `${sizeToCss(rawProps.outlineSize)} solid ${rawProps.outlineColor}`
    : ``
  htmlElement.style.outlineOffset = exists(rawProps.outlineSize)
    ? `-${sizeToCss(rawProps.outlineSize)}`
    : ``

  // Background
  const backgroundIsImage =
    (rawProps.background?.startsWith(`data:image`) || rawProps.background?.startsWith(`/`)) ?? false
  htmlElement.style.backgroundColor = backgroundIsImage ? `` : rawProps.background ?? ``
  htmlElement.style.backgroundImage = backgroundIsImage ? `url('${rawProps.background}')` : ``
  htmlElement.style.backgroundSize = `cover`
  htmlElement.style.backgroundPosition = `center`
  htmlElement.style.backgroundRepeat = `no-repeat`

  // Shadow
  const alignShadowDirection: ShadowDirection = rawProps.shadowDirection ?? Align.bottomRight
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
  htmlElement.style.boxShadow = exists(rawProps.shadowSize)
    ? `${sizeToCss(0.09 * rawProps.shadowSize * shadowDirection.x)} ${sizeToCss(
        -0.09 * rawProps.shadowSize * shadowDirection.y,
      )} ${sizeToCss(0.4 * rawProps.shadowSize)} 0 #00000045`
    : ``

  // Z-Index
  htmlElement.style.zIndex = rawProps.zIndex?.toString() ?? ``
})
