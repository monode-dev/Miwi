import './b-x/b-x'
import { Sty } from './b-x/b-x'
import { type JSX, type ParentProps } from 'solid-js'
import { compute, watchEffect } from './utils'

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

export function grow(flex: number = 1) {
  return `${flex}f`
}

export type BoxProps = Partial<Sty> & {
  children?: JSX.Element
}
export function Box(props: BoxProps) {
  const sty = compute(() => {
    return { ...props }
  })
  return <b-x classList={props.classList} sty={sty.value} />
}
