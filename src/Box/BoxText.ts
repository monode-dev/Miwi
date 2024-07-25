import { ParseProp, exists, muToCss } from "./BoxUtils";
import { AlignSingleAxis, Overflow, _FlexAlign } from "./BoxLayout";
import { sizeScaleCssVarName } from "src/Theme";
import { Prop } from "src/utils";
import { createRenderEffect } from "solid-js";

export type TextSty = Partial<{
  scale: number | string;
  stroke: string;
  // primaryStroke: boolean;
  // hintStroke: boolean;
  // errorStroke: boolean;
  // NOTE: Eventually we might want to make this a number so it can be granularly controlled. With presets for thin, normal, and bold.
  bold: boolean;
  italic: boolean;
  underlineText: boolean;
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
}>;

// Text Styler
export function watchBoxText(
  parseProp: ParseProp<TextSty>,
  element: Prop<HTMLElement | undefined>,
  context: {
    alignX: Prop<AlignSingleAxis>;
    overflowX: Prop<Overflow>;
  },
) {
  // Basics
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    element.value.style.fontFamily = `inherit`; //`Roboto`;
  });

  // Scale / Font Size
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    const scale = parseProp({ scale: v => v });
    element.value.style.setProperty(sizeScaleCssVarName, muToCss(scale) ?? ``);
    element.value.style.fontSize = exists(scale) ? `var(${sizeScaleCssVarName})` : ``;
    // element.value.style.lineHeight = exists(scale) ? `var(${sizeScaleCssVarName})` : ``
  });

  // Bold
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    const textIsBold = parseProp({ bold: v => v });
    element.value.style.fontWeight = exists(textIsBold) ? (textIsBold ? `bold` : `normal`) : ``;
  });

  // Italic
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    const textIsItalic = parseProp({ italic: v => v });
    element.value.style.fontStyle = exists(textIsItalic)
      ? textIsItalic
        ? `italic`
        : `normal`
      : ``;
  });

  // Underline
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    const textIsUnderlined = parseProp({ underlineText: v => v });
    element.value.style.textDecoration = exists(textIsUnderlined)
      ? textIsUnderlined
        ? `underline`
        : `none`
      : ``;
  });

  // textOverflow: sty.useEllipsisForOverflow ?? false ? `ellipsis` : undefined,

  // Text Color
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    element.value.style.color = parseProp({ stroke: v => v }) ?? ``;
  });

  // Text Align
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    element.value.style.textAlign =
      context.alignX.value === _FlexAlign.start
        ? `left`
        : context.alignX.value === _FlexAlign.end
          ? `right`
          : // We assume for now that all other aligns cam be treated as center
            `center`;
  });

  // Text Wrap
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    // White Space: https://developer.mozilla.org/en-US/docs/Web/CSS/white-space
    // NOTE: whiteSpace cascades, so we need to explicity set it.
    element.value.style.whiteSpace =
      context.overflowX.value === Overflow.crop || context.overflowX.value === Overflow.spill
        ? `nowrap`
        : // TODO: Css ignores the last trailing newline. We need to find a way to fix that.
          `break-spaces`;
    element.value.style.hyphens =
      context.overflowX.value === Overflow.crop || context.overflowX.value === Overflow.spill
        ? `none`
        : /* Needed to break up long words like supercalifragilisticexpialidocious. */
          `auto`;
    element.value.style.textOverflow = context.overflowX.value === Overflow.crop ? `ellipsis` : ``;
  });
}
