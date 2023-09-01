import { exists } from "./utils";
import "../b-x";
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
export function parseSty(props, defaultSty) {
    let parsedSty = {};
    for (const key of styProps) {
        parsedSty[key] =
            props?.[key] ??
                props?.sty?.[key] ??
                defaultSty?.[key];
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
export function grow(flex = 1) {
    return `${flex}f`;
}
export function Box(props) {
    return <b-x {...props} sty={parseSty(props)}/>;
}
