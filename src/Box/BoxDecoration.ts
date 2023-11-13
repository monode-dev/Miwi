import { ParseProp, exists, sizeToCss } from './BoxUtils'
import { Align, AlignTwoAxis, _FlexAlign, _SpaceAlign } from './BoxLayout'

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
  dataplateyellow: '#f2b212',
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
export function applyDecorationStyle(
  parseProp: ParseProp<DecorationSty>,
  htmlElement: HTMLElement,
) {
  // Corner Radius
  const cornerRadiuses = [
    parseProp({
      cornerRadiusTopLeft: v => v,
      cornerRadius: v => v,
    }) ?? 0,
    parseProp({
      cornerRadiusTopRight: v => v,
      cornerRadius: v => v,
    }) ?? 0,
    parseProp({
      cornerRadiusBottomRight: v => v,
      cornerRadius: v => v,
    }) ?? 0,
    parseProp({
      cornerRadiusBottomLeft: v => v,
      cornerRadius: v => v,
    }) ?? 0,
  ]
  htmlElement.style.borderRadius = cornerRadiuses.every(r => r === 0)
    ? ``
    : cornerRadiuses.map(sizeToCss).join(` `)

  // Outline
  const outlineSize = parseProp({ outlineSize: v => v })
  const outlineColor = parseProp({ outlineColor: v => v })
  htmlElement.style.outline =
    exists(outlineSize) && exists(outlineColor)
      ? `${sizeToCss(outlineSize)} solid ${outlineColor}`
      : ``
  htmlElement.style.outlineOffset =
    exists(outlineSize) && exists(outlineColor) ? `-${sizeToCss(outlineSize)}` : ``

  // Background
  const background = parseProp({ background: v => v }) ?? ``
  const backgroundIsImage = background.startsWith(`data:image`) || background.startsWith(`/`)
  htmlElement.style.backgroundColor = backgroundIsImage ? `` : background
  htmlElement.style.backgroundImage = backgroundIsImage ? `url('${background}')` : ``
  htmlElement.style.backgroundSize = backgroundIsImage ? `cover` : ``
  htmlElement.style.backgroundPosition = backgroundIsImage ? `center` : ``
  htmlElement.style.backgroundRepeat = backgroundIsImage ? `no-repeat` : ``

  // Shadow
  const alignShadowDirection = parseProp({ shadowDirection: v => v }) ?? Align.bottomRight
  const shadowDirection = {
    x: {
      [_FlexAlign.start]: -1,
      [_FlexAlign.center]: 0,
      [_FlexAlign.end]: 1,
    }[alignShadowDirection.alignX],
    y: {
      [_FlexAlign.start]: 1,
      [_FlexAlign.center]: 0,
      [_FlexAlign.end]: -1,
    }[alignShadowDirection.alignY],
  }
  const shadowSize = parseProp({ shadowSize: v => v })
  htmlElement.style.boxShadow = exists(shadowSize)
    ? `${sizeToCss(0.09 * shadowSize * shadowDirection.x)} ${sizeToCss(
        -0.09 * shadowSize * shadowDirection.y,
      )} ${sizeToCss(0.4 * shadowSize)} 0 #00000045`
    : ``

  // Z-Index
  htmlElement.style.zIndex = parseProp({ zIndex: v => v })?.toString() ?? ``
}
