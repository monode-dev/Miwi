import { BoxProps } from './Box/Box'
import { Column } from './Column'

export function Body(props: BoxProps) {
  return (
    <Column
      widthGrows
      heightGrows
      alignTopCenter
      preventClickPropagation
      textColor={$theme.colors.text}
      scale={1}
      pad={1}
      overflowY={$Overflow.scroll}
      overflowX={$Overflow.crop}
      overrideProps={props}
    >
      {props.children}
    </Column>
  )
}
