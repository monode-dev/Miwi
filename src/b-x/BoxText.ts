import { ParseProp, exists, sizeToCss } from './BoxUtils'
import { AlignSingleAxis, Overflow, _FlexAlign } from './BoxLayout'
import { sizeScaleCssVarName } from 'src/theme'

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
export function applyTextStyle(
  parseProp: ParseProp<TextSty>,
  htmlElement: HTMLElement,
  context: {
    alignX: AlignSingleAxis
    overflowX: Overflow
  },
) {
  htmlElement.style.fontFamily = `inherit` //`Roboto`;
  const scale = parseProp({ scale: v => v })
  htmlElement.style.setProperty(sizeScaleCssVarName, sizeToCss(scale) ?? ``)
  htmlElement.style.fontSize = exists(scale) ? `var(${sizeScaleCssVarName})` : ``
  const textIsBold = parseProp({ boldText: v => v })
  htmlElement.style.fontWeight = exists(textIsBold) ? (textIsBold ? `bold` : `normal`) : ``
  const textIsItalic = parseProp({ italicizeText: v => v })
  htmlElement.style.fontStyle = exists(textIsItalic) ? (textIsItalic ? `italic` : `normal`) : ``
  const textIsUnderlined = parseProp({ underlineText: v => v })
  htmlElement.style.textDecoration = exists(textIsUnderlined)
    ? textIsUnderlined
      ? `underline`
      : `none`
    : ``
  htmlElement.style.lineHeight = exists(scale) ? `var(${sizeScaleCssVarName})` : ``
  // textOverflow: sty.useEllipsisForOverflow ?? false ? `ellipsis` : undefined,
  htmlElement.style.color = parseProp({ textColor: v => v }) ?? ``
  htmlElement.style.textAlign =
    context.alignX === _FlexAlign.start
      ? `left`
      : context.alignX === _FlexAlign.end
      ? `right`
      : // We assume for now that all other aligns cam be treated as center
        `center`
  // whiteSpace cascades, so we need to explicity set it.
  htmlElement.style.whiteSpace =
    context.overflowX === Overflow.crop || context.overflowX === Overflow.forceStretchParent
      ? `nowrap`
      : `normal`
}
