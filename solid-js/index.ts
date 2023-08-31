import { Axis, Align, Overflow } from "../b-x";

const _window = window as any;
_window.tkeGlobal = {};
_window.tkeGlobal.$theme = {
  colors: {
    primary: `#5978e2`,
    accent: `#ffffffff`,
    pageBackground: `#f9fafdff`,
    text: `#000000ff`,
    hint: `#9e9e9eff`,
    lightHint: `lightgray`,
    warning: `#ff9800ff`,
    error: `#f44336ff`,
    sameAsText: "currentColor",
  },
};
_window.tkeGlobal.$Align = Align;
_window.tkeGlobal.$Axis = Axis;
_window.tkeGlobal.$Overflow = Overflow;

const globalScipt = document.createElement(`script`);
globalScipt.innerHTML = `
const $theme = window.tkeGlobal.$theme;
const $Align = window.tkeGlobal.$Align;
const $Axis = window.tkeGlobal.$Axis;
const $Overflow = window.tkeGlobal.$Overflow;`;
document.body.appendChild(globalScipt);
const primaryColorStyleElement = document.createElement(`style`);
primaryColorStyleElement.innerHTML = `
:root {
  --primary-color: ${_window.tkeGlobal.$theme.colors.primary};
}

.field::placeholder {
  color: var(--placeholder-color);
}

/* Add vendor-prefixed rules for better browser compatibility */
.field::-webkit-input-placeholder {
  color: var(--placeholder-color);
}

.field::-moz-placeholder {
  color: var(--placeholder-color);
  opacity: 1;
}

.field:-ms-input-placeholder {
  color: var(--placeholder-color);
}

.field::-ms-input-placeholder {
  color: var(--placeholder-color);
}`;
document.body.appendChild(primaryColorStyleElement);

export * from "./AppBar";
export * from "./Body";
export * from "./Box";
export * from "./Button";
export * from "./Card";
export * from "./Column";
export * from "./DeleteDialog";
export * from "./Field";
export * from "./GlobalTypes";
export * from "./HiddenDelete";
export * from "./Icon";
export * from "./Label";
export * from "./Modal";
export * from "./Nav";
export * from "./NumField";
export * from "./OfflineWarning";
export * from "./Page";
export * from "./Row";
export * from "./Selector";
export * from "./Slider";
export * from "./Stack";
export * from "./TabButtons";
export * from "./TabView";
export * from "./Text";
export * from "./utils";
