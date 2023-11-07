import { exists, sizeToCss } from './BoxUtils'
import { _FlexAlign } from './BoxLayout'
import { sizeScaleCssVarName } from 'src/theme'
import { decorationStyler } from './BoxDecoration'

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
export const textStyler = decorationStyler.addStyler<TextSty>((attributes, htmlElement) => {
  htmlElement.style.fontFamily = `inherit` //`Roboto`;
  htmlElement.style.setProperty(sizeScaleCssVarName, sizeToCss(attributes.scale) ?? ``)
  htmlElement.style.fontSize = exists(attributes.scale) ? `var(${sizeScaleCssVarName})` : ``
  htmlElement.style.fontWeight = exists(attributes.boldText)
    ? attributes.boldText
      ? `bold`
      : `normal`
    : ``
  htmlElement.style.fontStyle = exists(attributes.italicizeText)
    ? attributes.italicizeText
      ? `italic`
      : `normal`
    : ``
  htmlElement.style.textDecoration = exists(attributes.underlineText)
    ? attributes.underlineText
      ? `underline`
      : `none`
    : ``
  htmlElement.style.lineHeight = attributes.scale === undefined ? `` : sizeToCss(attributes.scale)
  // textOverflow: sty.useEllipsisForOverflow ?? false ? `ellipsis` : undefined,
  htmlElement.style.color = attributes.textColor ?? ``
})
