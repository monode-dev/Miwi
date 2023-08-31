import { signal, watchEffect, exists, computed } from "./utils";
import "../b-x";
import { Axis, Sty } from "../b-x";
import {
  type JSX,
  type ParentProps,
} from "solid-js";

type BDashXProps = ParentProps & {
  sty?: Sty;
} & JSX.DOMAttributes<HTMLDivElement>;
declare module "solid-js" {
  const element: HTMLElement;
  namespace JSX {
    interface IntrinsicElements {
      "b-x": BDashXProps;
    }
  }
}
const styProps = [
  "pad",
  "padAround",
  "padAroundX",
  "padAroundY",
  "padTop",
  "padRight",
  "padBottom",
  "padLeft",
  "padBetween",
  "padBetweenRows",
  "padBetweenColumns",
  "cornerRadius",
  "outlineColor",
  "outlineSize",
  "background",
  "shadowSize",
  "shadowDirection",
  "zIndex",
  "isInteractable",
  "align",
  "alignX",
  "alignY",
  "axis",
  "overflowX",
  "overflowY",
  "width",
  "height",
  "scale",
  "textColor",
  "textIsBold",
  "textIsItalic",
  "textIsUnderlined",
  "shouldLog",
];
export function parseSty(
  props: BoxProps,
  defaultSty?: Partial<Sty>,
): Partial<Sty> {
  let parsedSty: Partial<Sty> = {};
  for (const key of styProps) {
    (parsedSty as any)[key] =
      (props as any)?.[key] ??
      (props?.sty as any)?.[key] ??
      (defaultSty as any)?.[key];
  }
  parsedSty.bonusTouchArea =
    props?.bonusTouchArea ??
    props?.sty?.bonusTouchArea ??
    defaultSty?.bonusTouchArea ??
    exists(props.onClick);
  return parsedSty;
}

// type Grow = `1f` & {
//   (flex: number): `${number}f`;
// };
// export const grow: Grow = (() => {
//   const growString = `1f`;
//   const growFunction = (flex: number): `${number}f` => `${flex}f`;
//   return Object.assign(growString, growFunction);
// })();
export function grow(flex: number = 1) {
  return `${flex}f`;
}

export type BoxProps = Partial<Sty> & BDashXProps;
export function Box(props: BoxProps) {
  return <b-x {...props} sty={parseSty(props)} />;
}
