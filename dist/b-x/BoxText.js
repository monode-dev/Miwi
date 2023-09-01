import { isNum, exists } from "./BoxUtils";
import { Overflow, _FlexAlign } from "./BoxLayout";
import { sizeToCss } from "./BoxSize";
// const fontSizeToHtmlUnit = 0.9;
export function numToFontSize(num) {
    // return sizeToCss(fontSizeToHtmlUnit * num);
    return sizeToCss(num); // * 1.3);
}
export function computeTextStyle(sty, alignX, overflowX) {
    return {
        // Text Style
        fontFamily: `Roboto`,
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
        textAlign: alignX === _FlexAlign.start
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
