import { Axis, Align, Overflow } from './b-x/b-x'

declare global {
  const $theme: {
    readonly colors: {
      readonly primary: string
      readonly accent: string
      readonly pageBackground: string
      readonly text: string
      readonly hint: string
      readonly lightHint: string
      readonly warning: string
      readonly error: string
      readonly sameAsText: string
    }
  }
  const $Align: typeof Align
  const $Axis: typeof Axis
  const $Overflow: typeof Overflow
}

const _window = window as any
_window.tkeGlobal = {}
_window.tkeGlobal.$theme = {
  colors: {
    primary: `#b3dd3e`,
    accent: `#ffffffff`,
    pageBackground: `#f9fafdff`,
    text: `#000000ff`,
    hint: `#9e9e9eff`,
    lightHint: `lightgray`,
    warning: `#ff9800ff`,
    error: `#f44336ff`,
    sameAsText: 'currentColor',
  },
}
_window.tkeGlobal.$Align = Align
_window.tkeGlobal.$Axis = Axis
_window.tkeGlobal.$Overflow = Overflow

const globalScipt = document.createElement(`script`)
globalScipt.innerHTML = `
const $theme = window.tkeGlobal.$theme;
const $Align = window.tkeGlobal.$Align;
const $Axis = window.tkeGlobal.$Axis;
const $Overflow = window.tkeGlobal.$Overflow;`
document.body.appendChild(globalScipt)
const primaryColorStyleElement = document.createElement(`style`)
//_window.tkeGlobal.$theme.colors.primary
primaryColorStyleElement.innerHTML = getDefautlStyle({
  primaryColor: _window.tkeGlobal.$theme.colors.primary,
})
document.body.appendChild(primaryColorStyleElement)
function getDefautlStyle(props: { primaryColor: string }) {
  return `
  :root {
    --primary-color: ${props.primaryColor};
  }
  
  .field::placeholder {
    color: var(--placeholder-color);
  }
  
  /* Add vendor-prefixed rules for better browser compatibility */
  .field::-webkit-input-placeholder {
    color: var(--placeholder-color);
  }
  
  .field::-moz-placeholder {
    color: var(--placeholder-color);
    opacity: 1;
  }
  
  .field:-ms-input-placeholder {
    color: var(--placeholder-color);
  }
  
  .field::-ms-input-placeholder {
    color: var(--placeholder-color);
  }`
}
export function setPrimaryColor(color: string) {
  _window.tkeGlobal.$theme.colors.primary = color
  primaryColorStyleElement.innerHTML = getDefautlStyle({
    primaryColor: _window.tkeGlobal.$theme.colors.primary,
  })
}

export * from './b-x/b-x'
export * from './AppBar'
export * from './Body'
export * from './Box'
export * from './Button'
export * from './Card'
export * from './Column'
export * from './DeleteDialog'
export * from './Field'
export * from './HiddenDelete'
export * from './Icon'
export * from './Label'
export * from './Modal'
export * from './Nav'
export * from './NumField'
export * from './OfflineWarning'
export * from './Page'
export * from './Row'
export * from './Selector'
export * from './Slider'
export * from './Stack'
export * from './TabButtons'
export * from './TabView'
export * from './Text'
export * from './utils'
