import { Size } from './b-x/b-x'
// https://pictogrammers.com/library/mdi/
import { Box } from './Box'

// From: https://github.com/therufa/mdi-vue/blob/master/src/shared.js
function ucFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
function toMdiName(str: string) {
  return str.split('-').map(ucFirst).join('')
}

export function Icon(props: {
  iconPath: string
  color?: string
  size?: Size
  onClick?: () => void
}) {
  return (
    <Box
      width={props.size ?? $theme.scale}
      height={props.size ?? $theme.scale}
      textColor={props.color ?? `currentColor`}
      overflowY={$Overflow.crop}
      onClick={props.onClick}
    >
      {/* From: https://github.com/therufa/mdi-vue/blob/master/v3.js */}
      <svg
        fill="currentColor"
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={props.iconPath}></path>
      </svg>
    </Box>
  )
}
