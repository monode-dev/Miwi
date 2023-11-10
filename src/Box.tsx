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

export function grow(flex: number = 1) {
  return `${flex}f`
}

export type BoxProps = Partial<Sty> & ParentProps & JSX.DOMAttributes<HTMLDivElement>
export function Box(props: BoxProps) {
  if (props.ref ?? (props.overrideProps as any)?.ref) {
    console.log(props.ref ?? (props.overrideProps as any)?.ref)
  }
  return <b-x {...props} ref={props.ref ?? (props.overrideProps as any)?.ref} sty={props} />
}
