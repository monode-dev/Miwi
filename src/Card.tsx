import { BoxProps } from './Box'
import { Column } from './Column'

export function Card(props: BoxProps) {
  return (
    <Column
      background={$theme.colors.accent}
      cornerRadius={0.5}
      shadowSize={1.5}
      shadowDirection={$Align.bottomRight}
      alignCenter
      textColor={$theme.colors.text}
      scale={1}
      pad={1}
      {...props}
    >
      {props.children}
    </Column>
  )
}
