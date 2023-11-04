import { DeepPartial } from './utils'
import { sizeScaleCssVarName } from './theme'
import { sizeToCss } from './b-x/BoxUtils'
import { Align, Axis, Overflow } from './b-x/BoxLayout'

// SECTION: Global variables
declare global {
  const $Align: typeof Align
  const $Axis: typeof Axis
  const $Overflow: typeof Overflow
}
const _window = window as any
_window.miwi_globalVars = {}
_window.miwi_globalVars.$Align = Align
_window.miwi_globalVars.$Axis = Axis
_window.miwi_globalVars.$Overflow = Overflow
const globalScript = document.createElement(`script`)
globalScript.innerHTML = `
const $Align = window.miwi_globalVars.$Align;
const $Axis = window.miwi_globalVars.$Axis;
const $Overflow = window.miwi_globalVars.$Overflow;`
document.body.appendChild(globalScript)

// SECTION: Theme
declare global {
  const $theme: {
    readonly scale: number | string
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
}
const themeScriptElement = document.createElement(`script`)
/** TODO: Implement h1, h2, and bodyText
 * h1: {
 *   scale: `var(--miwi-h1-scale)`,
 *   color: `var(--miwi-h1-color)`,
 * }
 * --miwi-h1-scale: 1.5;
 * --miwi-h1-color: var(--miwi-color-text);
 */
themeScriptElement.innerHTML = `
const $theme = ${JSON.stringify({
  scale: `var(${sizeScaleCssVarName})` as any,
  colors: {
    primary: `var(--miwi-color-primary)`,
    accent: `var(--miwi-color-accent)`,
    pageBackground: `var(--miwi-color-page-background)`,
    text: `var(--miwi-color-text)`,
    hint: `var(--miwi-color-hint)`,
    lightHint: `var(--miwi-color-light-hint)`,
    warning: `var(--miwi-color-warning)`,
    error: `var(--miwi-color-error)`,
    sameAsText: `currentColor`,
  },
} satisfies typeof $theme)};`
document.body.appendChild(themeScriptElement)
const themeStyleElement = document.createElement(`style`)
setTheme({})
document.body.appendChild(themeStyleElement)
export function setTheme(props: DeepPartial<Omit<typeof $theme, `sameAsText`>>) {
  themeStyleElement.innerHTML = `
  :root {
    ${sizeScaleCssVarName}: ${sizeToCss(props.scale ?? 1)};
    --miwi-color-primary: ${props.colors?.primary ?? `#b3dd3e`};
    --miwi-color-accent: ${props.colors?.accent ?? `#ffffffff`};
    --miwi-color-page-background: ${props.colors?.pageBackground ?? `#f9fafdff`};
    --miwi-color-text: ${props.colors?.text ?? `#000000ff`};
    --miwi-color-hint: ${props.colors?.hint ?? `#9e9e9eff`};
    --miwi-color-light-hint: ${props.colors?.lightHint ?? `lightgray`};
    --miwi-color-warning: ${props.colors?.warning ?? `#ff9800ff`};
    --miwi-color-error: ${props.colors?.error ?? `#f44336ff`};
  }`
}

// Field style
const fieldStyleElement = document.createElement(`style`)
fieldStyleElement.innerHTML = `
.field::placeholder {
  color: var(--miwi-placeholder-color);
}

/* Add vendor-prefixed rules for better browser compatibility */
.field::-webkit-input-placeholder {
  color: var(--miwi-placeholder-color);
}

.field::-moz-placeholder {
  color: var(--miwi-placeholder-color);
  opacity: 1;
}

.field:-ms-input-placeholder {
  color: var(--miwi-placeholder-color);
}

.field::-ms-input-placeholder {
  color: var(--miwi-placeholder-color);
}`
document.body.appendChild(fieldStyleElement)

export * from './b-x/b-x'
export * from './b-x/BoxDecoration'
export * from './b-x/BoxInteraction'
export * from './b-x/BoxLayout'
export * from './b-x/BoxSize'
export * from './b-x/BoxText'
export * from './AppBar'
export * from './Body'
export * from './Box'
export * from './Button'
export * from './Card'
export * from './CircularProgressIndicator'
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
export * from './Txt'
export * from './Selector'
export * from './Slider'
export * from './SortableColumn'
export * from './Stack'
export * from './TabButtons'
export * from './TabView'
export * from './utils'
