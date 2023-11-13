import { ParseProp, exists, sizeToCss } from './BoxUtils'
import { AlignSingleAxis, Overflow, _FlexAlign } from './BoxLayout'
import { sizeScaleCssVarName } from 'src/theme'
import { Sig, watchEffect } from 'src/utils'

export type TextSty = {
  scale: number | string
  textColor: string
  // NOTE: Eventually we might want to make this a number so it can be granularly controlled. With presets for thin, normal, and bold.
  boldText: boolean
  italicizeText: boolean
  underlineText: boolean
  /** NOTE: Flex container treats its children as flex items, and unfortunately, the
   * text-overflow: ellipsis; doesn't apply to flex items. If you want to keep using
   * flex for other properties, a solution is to wrap your text in an inner div (or
   * other HTML element like p or span) and apply text-overflow: ellipsis; on that.
   * Here is how you can do it:
   * ```html
   * <div style="...">
   *   <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
   *     4273 - The Rv Doctor asdf asf a dasffda flkajdfdsdf adf aask afjs a
   *   </div>
   * </div>
   * This should give you the desired behavior: text that is too long to fit inside
   * the inner div will be truncated and an ellipsis will be added at the end. */
  // useEllipsisForOverflow: boolean;
}

// Text Styler
export function watchBoxText(
  parseProp: ParseProp<TextSty>,
  element: Sig<HTMLElement | undefined>,
  context: {
    alignX: Sig<AlignSingleAxis>
    overflowX: Sig<Overflow>
  },
) {
  // Basics
  watchEffect(() => {
    if (!exists(element.value)) return
    element.value.style.fontFamily = `inherit` //`Roboto`;
  })

  // Scale / Font Size
  watchEffect(() => {
    if (!exists(element.value)) return
    const scale = parseProp({ scale: v => v })
    element.value.style.setProperty(sizeScaleCssVarName, sizeToCss(scale) ?? ``)
    element.value.style.fontSize = exists(scale) ? `var(${sizeScaleCssVarName})` : ``
    element.value.style.lineHeight = exists(scale) ? `var(${sizeScaleCssVarName})` : ``
  })

  // Bold
  watchEffect(() => {
    if (!exists(element.value)) return
    const textIsBold = parseProp({ boldText: v => v })
    element.value.style.fontWeight = exists(textIsBold) ? (textIsBold ? `bold` : `normal`) : ``
  })

  // Italic
  watchEffect(() => {
    if (!exists(element.value)) return
    const textIsItalic = parseProp({ italicizeText: v => v })
    element.value.style.fontStyle = exists(textIsItalic) ? (textIsItalic ? `italic` : `normal`) : ``
  })

  // Underline
  watchEffect(() => {
    if (!exists(element.value)) return
    const textIsUnderlined = parseProp({ underlineText: v => v })
    element.value.style.textDecoration = exists(textIsUnderlined)
      ? textIsUnderlined
        ? `underline`
        : `none`
      : ``
  })

  // textOverflow: sty.useEllipsisForOverflow ?? false ? `ellipsis` : undefined,

  // Text Color
  watchEffect(() => {
    if (!exists(element.value)) return
    element.value.style.color = parseProp({ textColor: v => v }) ?? ``
  })

  // Text Align
  watchEffect(() => {
    if (!exists(element.value)) return
    element.value.style.textAlign =
      context.alignX.value === _FlexAlign.start
        ? `left`
        : context.alignX.value === _FlexAlign.end
        ? `right`
        : // We assume for now that all other aligns cam be treated as center
          `center`
  })

  // Text Wrap
  watchEffect(() => {
    if (!exists(element.value)) return
    // whiteSpace cascades, so we need to explicity set it.
    element.value.style.whiteSpace =
      context.overflowX.value === Overflow.crop ||
      context.overflowX.value === Overflow.forceStretchParent
        ? `nowrap`
        : `normal`
  })
}
