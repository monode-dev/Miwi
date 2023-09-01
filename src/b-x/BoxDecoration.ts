import { CssProps, exists } from "./BoxUtils";
import { Align, AlignTwoAxis, _FlexAlign, _SpaceAlign } from "./BoxLayout";
import { sizeToCss } from "./BoxSize";

export type DecorationSty = {
  cornerRadius: number | string | [number, number, number, number];
  outlineColor: string;
  outlineSize: number;
  background: string;
  shadowSize: number;
  shadowDirection: ShadowDirection;
  zIndex: number;
};

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
  dataplateyellow: "#f2b212", // Added by Jorge to Dataplate project.
  green: `#4caf50ff`,
  teal: `#009688ff`,
  blue: `#2196f3ff`,
  purple: `#9c27b0ff`,
  brown: `#795548ff`,
  grey: `#9e9e9eff`,
  black: `#000000ff`,
  transparent: `#ffffff00`,
  sameAsText: `currentColor`,
} as const;

// We might be able to infer everything we need from these compute functions, which could make updates even easier to make. If we did this, then we'd want to use another function to generate these compute functions.
export function computeBoxDecoration(sty: Partial<DecorationSty>): CssProps {
  const shadowDirection = (() => {
    const givenDirection: ShadowDirection =
      sty.shadowDirection ?? Align.bottomRight;
    return {
      x:
        givenDirection.alignX === _FlexAlign.start
          ? -1
          : givenDirection.alignX === _FlexAlign.center
          ? 0
          : 1,
      y:
        givenDirection.alignY === _FlexAlign.start
          ? 1
          : givenDirection.alignY === _FlexAlign.center
          ? 0
          : -1,
    };
  })();
  return {
    // Box Style
    // background: sty.background,
    borderRadius: exists(sty.cornerRadius)
      ? Array.isArray(sty.cornerRadius)
        ? sty.cornerRadius.map(sizeToCss).join(` `)
        : sizeToCss(sty.cornerRadius)
      : undefined,
    //border: `none`,
    outline: exists(sty.outlineSize)
      ? `${sizeToCss(sty.outlineSize)} solid ${sty.outlineColor}`
      : undefined,
    outlineOffset: exists(sty.outlineSize)
      ? `-${sizeToCss(sty.outlineSize)}`
      : undefined,
    backgroundColor:
      sty.background?.startsWith(`data:image`) ||
      sty.background?.startsWith(`/`)
        ? undefined
        : sty.background,
    backgroundImage:
      sty.background?.startsWith(`data:image`) ||
      sty.background?.startsWith(`/`)
        ? `url('${sty.background}')`
        : undefined,
    backgroundSize: `cover`,
    backgroundPosition: `center`,
    backgroundRepeat: `no-repeat`,
    // Add background images
    boxShadow: exists(sty.shadowSize)
      ? `${sizeToCss(0.09 * sty.shadowSize * shadowDirection.x)} ${sizeToCss(
          -0.09 * sty.shadowSize * shadowDirection.y,
        )} ${sizeToCss(0.4 * sty.shadowSize)} 0 #00000045`
      : undefined,
    zIndex: sty.zIndex,
  };
}
