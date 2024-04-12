import { ParseProp, exists, muToCss } from "./BoxUtils";
import { Align, AlignTwoAxis, _FlexAlign, _SpaceAlign } from "./BoxLayout";
import { Prop } from "src/utils";
import { createRenderEffect } from "solid-js";
import { foregroundMaterial } from "src/Theme";

export type DecorationSty = Partial<
  {
    cornerRadius: number | string;
    cornerRadiusTopLeft: number | string;
    cornerRadiusTopRight: number | string;
    cornerRadiusBottomRight: number | string;
    cornerRadiusBottomLeft: number | string;
    outlineColor: string;
    outlineSize: number;
    shadowSize: number;
    shadowDirection: ShadowDirection;
    cssStyle: Partial<CSSStyleDeclaration>;
    zIndex: number;
  } & BackgroundProps
>;

export type BackgroundProps = {
  fill: string;
  fillWithForeground: boolean;
  backgroundFit: BackgroundFit;
  backgroundCover: boolean;
  backgroundContain: boolean;
};
export type BackgroundFit = keyof typeof BackgroundFit;
export const BackgroundFit = {
  cover: `cover`,
  contain: `contain`,
} as const;

export type ShadowDirection = {
  [Key in keyof AlignTwoAxis]: Exclude<AlignTwoAxis[Key], _SpaceAlign>;
};

export const mdColors = {
  white: `#ffffffff`,
  almostWhite: `#f9fafdff`,
  pink: `#e91e63ff`,
  red: `#f44336ff`,
  orange: `#ff9800ff`,
  yellow: `#ffea00ff`,
  dataplateyellow: "#f2b212",
  green: `#4caf50ff`,
  teal: `#009688ff`,
  blue: `#2196f3ff`,
  purple: `#9c27b0ff`,
  brown: `#795548ff`,
  grey: `#9e9e9eff`,
  black: `#000000ff`,
  transparent: `#ffffff00`,
  stroke: `currentColor`,
} as const;

// We might be able to infer everything we need from these compute functions, which could make updates even easier to make. If we did this, then we'd want to use another function to generate these compute functions.
export function watchBoxDecoration(
  parseProp: ParseProp<DecorationSty>,
  element: Prop<HTMLElement | undefined>,
) {
  // Corner Radius
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    const cornerRadiuses = [
      parseProp({
        cornerRadiusTopLeft: v => v,
        cornerRadius: v => v,
      }) ?? 0,
      parseProp({
        cornerRadiusTopRight: v => v,
        cornerRadius: v => v,
      }) ?? 0,
      parseProp({
        cornerRadiusBottomRight: v => v,
        cornerRadius: v => v,
      }) ?? 0,
      parseProp({
        cornerRadiusBottomLeft: v => v,
        cornerRadius: v => v,
      }) ?? 0,
    ];
    element.value.style.borderRadius = cornerRadiuses.every(r => r === 0)
      ? ``
      : cornerRadiuses.map(muToCss).join(` `);
  });

  // Outline
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    const outlineSize = parseProp({ outlineSize: v => v });
    const outlineColor = parseProp({ outlineColor: v => v });
    /* NOTE: Sometimes devs would set an outlineColor but not outlineSize,
     * and then be confused why the outline wasn't visible. So we give it a
     * default size but no default color. */
    element.value.style.outline = exists(outlineColor)
      ? `${muToCss(outlineSize ?? 1 / 8)} solid ${outlineColor}`
      : ``;
    element.value.style.outlineOffset =
      exists(outlineSize) && exists(outlineColor) ? `-${muToCss(outlineSize)}` : ``;
  });

  // Background
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    const fill =
      parseProp({
        fill: v => v,
        fillWithForeground: _ => foregroundMaterial,
      }) ?? ``;
    const backgroundIsImage = fill.startsWith(`data:image`) || fill.startsWith(`/`);
    element.value.style.backgroundColor = backgroundIsImage ? `` : fill;
    element.value.style.backgroundImage = backgroundIsImage ? `url('${fill}')` : ``;
    element.value.style.backgroundSize =
      parseProp({
        backgroundFit: v => v,
        backgroundCover: v => (v ? `cover` : ``),
        backgroundContain: v => (v ? `contain` : ``),
      }) ?? (backgroundIsImage ? `cover` : ``);
    element.value.style.backgroundPosition = backgroundIsImage ? `center` : ``;
    element.value.style.backgroundRepeat = backgroundIsImage ? `no-repeat` : ``;
  });

  // Shadow
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    const alignShadowDirection = parseProp({ shadowDirection: v => v }) ?? Align.bottomRight;
    const shadowDirection = {
      x: {
        [_FlexAlign.start]: -1,
        [_FlexAlign.center]: 0,
        [_FlexAlign.end]: 1,
      }[alignShadowDirection.alignX],
      y: {
        [_FlexAlign.start]: 1,
        [_FlexAlign.center]: 0,
        [_FlexAlign.end]: -1,
      }[alignShadowDirection.alignY],
    };
    const shadowSize = parseProp({ shadowSize: v => v });
    element.value.style.boxShadow = exists(shadowSize)
      ? `${muToCss(0.09 * shadowSize * shadowDirection.x)} ${muToCss(
          -0.09 * shadowSize * shadowDirection.y,
        )} ${muToCss(0.4 * shadowSize)} 0 #00000045`
      : ``;
  });

  // Z-Index
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    element.value.style.zIndex = parseProp({ zIndex: v => v })?.toString() ?? ``;
  });

  // CSS Style
  createRenderEffect(() => {
    if (!exists(element.value)) return;
    const style = parseProp(`cssStyle`);
    // TODO: Clear Old Style
    if (exists(style)) {
      for (const key of Object.keys(style)) {
        (element.value.style as any)[key] = style[key as any];
      }
    }
  });
}
