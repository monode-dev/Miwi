import { exists } from './utils'
import './b-x/b-x'
import { Sty } from './b-x/b-x'
import { type JSX, type ParentProps } from 'solid-js'

type BDashXProps = ParentProps & {
  sty?: Sty
} & JSX.DOMAttributes<HTMLDivElement>
declare module 'solid-js' {
  const element: HTMLElement
  namespace JSX {
    interface IntrinsicElements {
      'b-x': BDashXProps
    }
  }
}
const styProps = [
  'pad',
  'padAround',
  'padAroundX',
  'padAroundY',
  'padTop',
  'padRight',
  'padBottom',
  'padLeft',
  'padBetween',
  'padBetweenX',
  'padBetweenY',
  'cornerRadius',
  'outlineColor',
  'outlineSize',
  'background',
  'shadowSize',
  'shadowDirection',
  'zIndex',
  'captureClicks',
  'onClick',
  'align',
  'alignX',
  'alignY',
  'alignTopLeft',
  'alignTopCenter',
  'alignTopRight',
  'alignCenterLeft',
  'alignCenter',
  'alignCenterRight',
  'alignBottomLeft',
  'alignBottomCenter',
  'alignBottomRight',
  'alignTop',
  'alignCenterY',
  'alignBottom',
  'alignLeft',
  'alignCenterX',
  'alignRight',
  'spaceBetween',
  'spaceBetweenX',
  'spaceBetweenY',
  'spaceAround',
  'spaceAroundX',
  'spaceAroundY',
  'spaceEvenly',
  'spaceEvenlyX',
  'spaceEvenlyY',
  'axis',
  `row`,
  `column`,
  'stack',
  'overflowX',
  'overflowY',
  'width',
  'height',
  'scale',
  'textColor',
  'textIsBold',
  'textIsItalic',
  'textIsUnderlined',
  'cssCursor',
  'shouldLog',
]
// export function parseSty(props: BoxProps, defaultSty?: Partial<Sty>): Partial<Sty> {
//   const parsedSty: Partial<Sty> = {}
//   for (const key of styProps) {
//     ;(parsedSty as any)[key] = (props as any)?.[key] ?? (defaultSty as any)?.[key]
//   }
//   parsedSty.bonusTouchArea =
//     props.bonusTouchArea ?? defaultSty?.bonusTouchArea ?? exists(props.onClick)
//   parsedSty.cssCursor =
//     props.cssCursor ?? defaultSty?.cssCursor ?? (exists(props.onClick) ? `pointer` : `default`)
//   return parsedSty
// }
export function parseSty(props: BoxProps): Partial<Sty> {
  // if (props.background === 'red') {
  //   console.log(props.onClick)
  // }
  const parsedSty: Partial<Sty> = {}
  for (const key of styProps) {
    ;(parsedSty as any)[key] = (props as any)?.[key]
  }
  parsedSty.bonusTouchArea = props.bonusTouchArea ?? exists(props.onClick)
  parsedSty.cssCursor = props.cssCursor ?? (exists(props.onClick) ? `pointer` : `default`)
  parsedSty.width =
    props.width ??
    (props.widthGrows
      ? grow()
      : props.widthShrinks
      ? -1
      : props.asWideAsParent
      ? `100%`
      : undefined)
  parsedSty.height =
    props.height ??
    (props.heightGrows
      ? grow()
      : props.heightShrinks
      ? -1
      : props.asTallAsParent
      ? `100%`
      : undefined)
  return parsedSty
}

export function grow(flex: number = 1) {
  return `${flex}f`
}

// type FlagSty = OnlyOne<{
//   width: Sty[`width`]
//   widthGrows: boolean | number | string
//   widthShrinks: boolean
// }> &
//   OnlyOne<{
//     height: Sty[`height`]
//     heightGrows: boolean | number | string
//     heightShrinks: boolean
//   }>
type FlagSty = Partial<
  {
    width: Sty[`width`]
    widthGrows: boolean | number | string
    widthShrinks: boolean
    asWideAsParent: boolean
  } & {
    height: Sty[`height`]
    heightGrows: boolean | number | string
    heightShrinks: boolean
    asTallAsParent: boolean
  }
>

// TODO: Rather than parsing all props and applying defaults where needed, we should instead
//       provide an overrideSty prop and only check and apply overrides.
export type BoxProps = Partial<Omit<Sty, `width` | `height`>> &
  FlagSty &
  ParentProps &
  JSX.DOMAttributes<HTMLDivElement>
export function Box(props: BoxProps) {
  return <b-x {...props} sty={parseSty(props)} />
}
