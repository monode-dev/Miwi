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
  'isInteractable',
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
  const parsedSty: Partial<Sty> = {}
  for (const key of styProps) {
    ;(parsedSty as any)[key] = (props as any)?.[key]
  }
  parsedSty.bonusTouchArea = props.bonusTouchArea ?? exists(props.onClick)
  parsedSty.cssCursor = props.cssCursor ?? (exists(props.onClick) ? `pointer` : `default`)
  parsedSty.width =
    props.width ??
    (props.widthGrows !== false
      ? props.widthGrows === true
        ? grow()
        : props.widthGrows
      : undefined) ??
    (props.widthShrinks !== false
      ? props.widthShrinks === true
        ? -1
        : props.widthShrinks
      : undefined)
  parsedSty.height =
    props.height ??
    (props.heightGrows !== false
      ? props.heightGrows === true
        ? grow()
        : props.heightGrows
      : undefined) ??
    (props.heightShrinks !== false
      ? props.heightShrinks === true
        ? -1
        : props.heightShrinks
      : undefined)
  return parsedSty
}

export function grow(flex: number = 1) {
  return `${flex}f`
}

type OnlyOne<T extends {}> = Partial<
  {
    [K in keyof T]: Pick<T, K> & Partial<Record<Exclude<keyof T, K>, never>>
  }[keyof T]
>

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
  } & {
    height: Sty[`height`]
    heightGrows: boolean | number | string
    heightShrinks: boolean
  }
>

export type BoxProps = Partial<Omit<Sty, `width` | `height`>> &
  FlagSty &
  ParentProps &
  JSX.DOMAttributes<HTMLDivElement>
export function Box(props: BoxProps) {
  return <b-x {...props} sty={parseSty(props)} />
}
