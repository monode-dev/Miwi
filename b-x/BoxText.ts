import { isNum, exists, CssProps } from "./BoxUtils";
import { Align, AlignSingleAxis, Overflow, _FlexAlign } from "./BoxLayout";
import { sizeToCss } from "./BoxSize";

export type TextSty = {
  scale: number | string;
  textColor: string;
  // NOTE: Eventually we might want to make this a number so it can be granularly controlled. With presets for thin, normal, and bold.
  textIsBold: boolean;
  textIsItalic: boolean;
  textIsUnderlined: boolean;
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
};

// const fontSizeToHtmlUnit = 0.9;
export function numToFontSize(num: number) {
  // return sizeToCss(fontSizeToHtmlUnit * num);
  return sizeToCss(num); // * 1.3);
}

export function computeTextStyle(
  sty: Partial<TextSty>,
  alignX: AlignSingleAxis,
  overflowX: Overflow,
): CssProps {
  return {
    // Text Style
    fontFamily: `Roboto`, //sty.fontFamily ?? `Roboto` ?? `inherit`,
    fontSize: isNum(sty.scale) ? numToFontSize(sty.scale) : sty.scale,
    fontWeight: exists(sty.textIsBold)
      ? sty.textIsBold
        ? `bold`
        : `normal`
      : undefined,
    fontStyle: exists(sty.textIsItalic)
      ? sty.textIsItalic
        ? `italic`
        : `normal`
      : undefined,
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
    whiteSpace: // whiteSapce casacdes, so we need to explicity set it.
      overflowX === Overflow.crop || overflowX === Overflow.forceStretchParent
        ? `nowrap`
        : `normal`,
    // textOverflow: sty.useEllipsisForOverflow ?? false ? `ellipsis` : undefined,
    color: sty.textColor,
  };
}
