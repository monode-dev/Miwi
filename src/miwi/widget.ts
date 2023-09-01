import { Mx_Var } from "./mx_core";

// Size
const fontSizeToHtmlUnit = 0.825;
function sizeToCss(x: any) {
  const asNum = parseFloat(x);
  return Number.isNaN(asNum) ? x : `${x / fontSizeToHtmlUnit}rem`;
}
function numToFontSize(x: number) {
  return sizeToCss(x * fontSizeToHtmlUnit);
}
type SizeUnit = `${number}${
  | `f`
  | `flex`
  | `cm`
  | `mm`
  | `in`
  | `px`
  | `pt`
  | `pc`
  | `em`
  | `ex`
  | `ch`
  | `rem`
  | `vw`
  | `vh`
  | `vmin`
  | `vmax`
  | `%`}`;
type Size = /**`shrink` | `grow` | */ number | SizeUnit;
function checkGrows(size: Size) {
  return (
    typeof size === `string` && (size.endsWith(`flex`) || size.endsWith(`f`))
  );
}
function parseFlex(size: string) {
  const endIndex = size.endsWith(`f`)
    ? size.length - `f`.length
    : `flex`.length;
  const flexNum = parseFloat(size.substring(0, endIndex));
  return `${flexNum * 100}%`;
}
function computeSizeInfo(
  min: Size,
  size: Size,
  max: Size,
  isMainAxisOfParent: boolean,
) {
  /** TODO: Also check children */
  const sizeGrows = checkGrows(size);
  const exactSize =
    !isMainAxisOfParent && sizeGrows
      ? "100%"
      : typeof size === `string` && !sizeGrows
      ? size
      : !(size === -1) && !sizeGrows
      ? sizeToCss(size)
      : "fit-content";
  return {
    exactSize: exactSize,
    minSize: sizeGrows
      ? min === -1
        ? "fit-content"
        : sizeToCss(min)
      : exactSize,
    maxSize: sizeGrows
      ? max === -1
        ? "fit-content"
        : sizeToCss(max)
      : exactSize,
    grows: sizeGrows,
  };
}

// Decoration
type Color = string;
export const colors = {
  white: `#ffffffff`,
  almostWhite: `#f9fafdff`,
  pink: `#e91e63ff`,
  red: `#f44336ff`,
  orange: `#ff9800ff`,
  yellow: `#ffea00ff`,
  green: `#4caf50ff`,
  teal: `#009688ff`,
  blue: `#2196f3ff`,
  purple: `#9c27b0ff`,
  brown: `#795548ff`,
  grey: `#9e9e9eff`,
  black: `#000000ff`,
  transparent: `#ffffff00`,
};

type Overflow = `wrap` | `scroll` | `crop`;

// Align
type AlignText = `tr` | `tc` | `tl` | `cr` | `cc` | `cl` | `br` | `bc` | `bl`;
type Align = {
  x: {
    num: -1 | 0 | 1;
    flex: `flex-start` | `center` | `flex-end`;
  };
  y: {
    num: -1 | 0 | 1;
    flex: `flex-start` | `center` | `flex-end`;
  };
};
function parseAlign(align: string): Align {
  const x = align[1];
  const y = align[0];
  const xNum = x === `l` ? -1 : x === `c` ? 0 : 1;
  const yNum = y === `t` ? 1 : y === `c` ? 0 : -1;
  const xFlex = x === `l` ? `flex-start` : x === `c` ? `center` : `flex-end`;
  const yFlex = y === `t` ? `flex-start` : y === `c` ? `center` : `flex-end`;
  return {
    x: { num: xNum, flex: xFlex },
    y: { num: yNum, flex: yFlex },
  };
}

export type Sty = {
  // Sizing
  minWidth: Size | undefined;
  width: Size;
  maxWidth: Size | undefined;
  minHeight: Size | undefined;
  height: Size;
  maxHeight: Size | undefined;
  zIndex: number | undefined;

  // Decoration
  cornerRadius: number | SizeUnit;
  outline: `${number | SizeUnit} ${Color}` | `none`;
  background: Color;
  shadowSize: number; // | SizeUnit;
  shadowDirection: AlignText;
  shadowColor: Color;

  // Content
  padding: number | SizeUnit;
  spacing: `space-between` | `space-around` | `space-evenly` | number;
  axis: `row` | `column`;
  align: AlignText;
  overflowX: Overflow;
  overflowY: Overflow;

  // Text
  textSize: number;
  textColor: Color;
  textFont: string;
  isUnderlined: boolean;
  isItalic: boolean;
  isBold: boolean;
};
export const defaultSty: Sty = {
  // Sizing
  minWidth: undefined,
  width: -1,
  maxWidth: undefined,
  minHeight: undefined,
  height: -1,
  maxHeight: undefined,
  zIndex: undefined,

  // Decoration
  cornerRadius: 0,
  outline: `none`,
  background: `transparent`,
  shadowSize: 0,
  shadowDirection: `br`,
  shadowColor: colors.grey,

  // Content
  padding: 0,
  spacing: 0,
  axis: `column`,
  align: `cc`,
  overflowX: `crop`,
  overflowY: `crop`,

  // Text
  textSize: 1,
  textColor: `black`,
  textFont: `Roboto`,
  isUnderlined: false,
  isItalic: false,
  isBold: false,
};
