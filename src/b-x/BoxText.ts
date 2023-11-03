import { exists, sizeToCss } from './BoxUtils'
import { Overflow, _FlexAlign } from './BoxLayout'
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
export const textStyler = decorationStyler.addStyler<TextSty>((sty, htmlElement) => {
  htmlElement.style.fontFamily = `inherit` //`Roboto`;
  htmlElement.style.setProperty(sizeScaleCssVarName, sizeToCss(sty.scale) ?? ``)
  htmlElement.style.fontSize = exists(sty.scale) ? `var(${sizeScaleCssVarName})` : ``
  htmlElement.style.fontWeight = exists(sty.boldText) ? (sty.boldText ? `bold` : `normal`) : ``
  htmlElement.style.fontStyle = exists(sty.italicizeText)
    ? sty.italicizeText
      ? `italic`
      : `normal`
    : ``
  htmlElement.style.textDecoration = exists(sty.underlineText)
    ? sty.underlineText
      ? `underline`
      : `none`
    : ``
  htmlElement.style.textAlign =
    sty.alignX === _FlexAlign.start
      ? `left`
      : sty.alignX === _FlexAlign.end
      ? `right`
      : // We assume for now that all other aligns cam be treated as center
        `center`
  htmlElement.style.lineHeight = sty.scale === undefined ? `` : sizeToCss(sty.scale)
  // whiteSpace cascades, so we need to explicity set it.
  htmlElement.style.whiteSpace =
    sty.overflowX === Overflow.crop || sty.overflowX === Overflow.forceStretchParent
      ? `nowrap`
      : `normal`
  // textOverflow: sty.useEllipsisForOverflow ?? false ? `ellipsis` : undefined,
  htmlElement.style.color = sty.textColor ?? ``
  return sty
})
