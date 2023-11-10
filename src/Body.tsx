import { BoxProps } from './Box'
import { Column } from './Column'

export function Body(props: BoxProps) {
  return (
    <Column
      widthGrows
      heightGrows
      alignTopCenter
      textColor={$theme.colors.text}
      scale={1}
      pad={1}
      overflowY={$Overflow.scroll}
      overflowX={$Overflow.crop}
      overrideProps={props}
      // overrideSty={props}
    >
      {props.children}
    </Column>
  )
}
