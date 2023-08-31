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
const boxClassName = `b-x`;
const widthGrowsClassName = `b-x-width-grows`;
const heightGrowsClassName = `b-x-height-grows`;
function computeSomeChildGrows(children) {
    const result = {
        someChildWidthGrows: false,
        someChildHeightGrows: false,
    };
    for (const child of children) {
        if (!(child instanceof HTMLElement) ||
            !child.classList.contains(boxClassName))
            continue;
        if (child.classList.contains(widthGrowsClassName)) {
            result.someChildWidthGrows = true;
        }
        if (child.classList.contains(heightGrowsClassName)) {
            result.someChildHeightGrows = true;
        }
    }
    return result;
}
function toArray(v) {
    return Array.isArray(v) ? v : [v];
}
export function Box(props) {
    return <b-x {...props} sty={parseSty(props)}/>;
}
