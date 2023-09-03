import { isNum, exists, CssProps } from './BoxUtils'
import { Align, AlignSingleAxis, Overflow, _FlexAlign } from './BoxLayout'
import { sizeToCss } from './BoxSize'
import { sizeScaleCssVarName } from 'src/theme'

export type TextSty = {
  scale: number | string
  textColor: string
  // NOTE: Eventually we might want to make this a number so it can be granularly controlled. With presets for thin, normal, and bold.
  textIsBold: boolean
  textIsItalic: boolean
  textIsUnderlined: boolean
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

export function computeTextStyle(
  sty: Partial<TextSty>,
  alignX: AlignSingleAxis,
  overflowX: Overflow,
): CssProps {
  if ((sty as any).shouldLog) {
    console.log(`${sizeScaleCssVarName}: ${sizeToCss(sty.scale)};`)
  }
  return {
    // Text Style
    fontFamily: `inherit`, //`Roboto`,
    [sizeScaleCssVarName]: sizeToCss(sty.scale),
    // If we want font size and box size to be different we should wrap this in a `calc()`.
    fontSize: exists(sty.scale) ? `var(${sizeScaleCssVarName})` : undefined,
    fontWeight: exists(sty.textIsBold) ? (sty.textIsBold ? `bold` : `normal`) : undefined,
    fontStyle: exists(sty.textIsItalic) ? (sty.textIsItalic ? `italic` : `normal`) : undefined,
    textDecoration: exists(sty.textIsUnderlined)
      ? sty.textIsUnderlined
        ? `underline`
        : `none`
      : undefined,
    textAlign:
      alignX === _FlexAlign.start
        ? `left`
        : alignX === _FlexAlign.end
        ? `right`
        : // We assume for now that all other aligns cam be treated as center
          `center`,
    lineHeight: sty.scale === undefined ? undefined : sizeToCss(sty.scale),
    // whiteSapce casacdes, so we need to explicity set it.
    whiteSpace:
      overflowX === Overflow.crop || overflowX === Overflow.forceStretchParent
        ? `nowrap`
        : `normal`,
    // textOverflow: sty.useEllipsisForOverflow ?? false ? `ellipsis` : undefined,
    color: sty.textColor,
  }
}