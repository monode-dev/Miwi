import './b-x/b-x'
import { Sty } from './b-x/b-x'
import { type JSX, type ParentProps } from 'solid-js'
import { compute } from './utils'

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

export type BoxProps = Partial<Sty> & ParentProps & JSX.DOMAttributes<HTMLDivElement>
export function Box(props: BoxProps) {
  const sty = compute(() => {
    console.log(props.overrideProps?.shadowSize)
    return { ...props }
  })
  return <b-x {...props} sty={sty.value} />
}
