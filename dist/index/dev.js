// b-x/BoxUtils.ts
function exists(x) {
  return x !== void 0 && x !== null;
}
function isNum(x) {
  return exists(x) && typeof x === `number`;
}
function isString(x) {
  return exists(x) && typeof x === `string`;
}

// b-x/BoxSize.ts
var muToRem = 1.125;
function sizeToCss(num) {
  if (isNum(num)) {
    const remValue = num * muToRem;
    const fontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );
    const pixelValue = remValue * fontSize;
    return `${roundToString(pixelValue)}px`;
  } else {
    return num;
  }
}
function roundToString(num, digits = 0) {
  const significantDecimals = num.toString().split(`.`)[1]?.length ?? 0;
  const roundingOffset = Math.pow(10, -significantDecimals - 1);
  return (num + roundingOffset).toFixed(digits);
}
function isFlexSize(size) {
  return exists(size?.flex);
}
function computeSizeInfo({
  size,
  isMainAxis,
  overflow,
  shouldLog
}) {
  const isShrink = size === -1;
  const sizeIsFlex = isFlexSize(size);
  const exactSize = !isMainAxis && sizeIsFlex ? `100%` : isString(size) ? size : !isShrink && !sizeIsFlex ? sizeToCss(size) : sizeIsFlex ? void 0 : (
    //: `fit-content`;
    `fit-content`
  );
  const minSize = sizeIsFlex ? size.min === Infinity ? exactSize : sizeToCss(size.min) : exactSize;
  const maxSize = sizeIsFlex ? size.max === Infinity ? void 0 : sizeToCss(size.max) : exactSize;
  return [exactSize, minSize, maxSize, sizeIsFlex];
}
function formatRawSize(props) {
  let formattedSize = (props.size ?? -1) === -1 ? props.someChildGrows ? `1f` : -1 : props.size ?? -1;
  if (isString(formattedSize) && formattedSize.endsWith(`f`)) {
    formattedSize = {
      min: -1,
      flex: parseFloat(formattedSize.split(`f`)[0]),
      max: Infinity
    };
  }
  return formattedSize;
}
function computeBoxSize(sty, formattedWidth, formattedHeight, parentAxis, parentPadTop, parentPadRight, parentPadBottom, parentPadLeft, shouldLog) {
  const [exactWidth, wMin, wMax, widthGrows] = computeSizeInfo({
    size: formattedWidth,
    isMainAxis: parentAxis === Axis.row,
    overflow: sty.overflowX ?? defaultOverflowX,
    shouldLog
  });
  const [exactHeight, hMin, hMax, heightGrows] = computeSizeInfo({
    size: formattedHeight,
    isMainAxis: parentAxis === Axis.column,
    overflow: sty.overflowY ?? defaultOverflowY
  });
  const result = {
    // Sizing
    display: `flex`,
    boxSizing: `border-box`,
    // Using minWidth and maxWidth tells css to not override the size of this element
    width: (() => {
      let size = exactWidth;
      if (parent?.sty?.axis === Axis.stack) {
        size = `calc(${size} - ${parentPadLeft ?? `0px`} - ${parentPadRight ?? `0px`})`;
      }
      return size;
    })(),
    minWidth: (() => {
      let size = wMin;
      if (parent?.sty?.axis === Axis.stack) {
        size = `calc(${size} - ${parentPadLeft ?? `0px`} - ${parentPadRight ?? `0px`})`;
      }
      return size;
    })(),
    maxWidth: (() => {
      let size = wMax;
      if (parent?.sty?.axis === Axis.stack) {
        size = `calc(${size} - ${parentPadLeft ?? `0px`} - ${parentPadRight ?? `0px`})`;
      }
      return size;
    })(),
    height: (() => {
      let size = exactHeight;
      if (parent?.sty?.axis === Axis.stack) {
        size = `calc(${size} - ${parentPadTop ?? `0px`} - ${parentPadBottom ?? `0px`})`;
      }
      return size;
    })(),
    minHeight: (() => {
      let size = hMin;
      if (parent?.sty?.axis === Axis.stack) {
        size = `calc(${size} - ${parentPadTop ?? `0px`} - ${parentPadBottom ?? `0px`})`;
      }
      return size;
    })(),
    maxHeight: (() => {
      let size = hMax;
      if (parent?.sty?.axis === Axis.stack) {
        size = `calc(${size} - ${parentPadTop ?? `0px`} - ${parentPadBottom ?? `0px`})`;
      }
      return size;
    })(),
    flexBasis: parentAxis === Axis.column ? isFlexSize(formattedHeight) ? `${formattedHeight.flex * 100}%` : heightGrows ? `100%` : void 0 : parentAxis === Axis.row ? isFlexSize(formattedWidth) ? `${formattedWidth.flex * 100}%` : widthGrows ? `100%` : void 0 : void 0
    // flexBasis:
    //   parentAxis === Axis.column
    //     ? isFlexSize(height)
    //       ? `calc(${height.flex * 100}% - (4 * ${cssPadding ?? `0px`}))`
    //       : heightGrows
    //         ? `calc(100% - (4 * ${cssPadding ?? `0px`}))`
    //         : undefined
    //     : parentAxis === Axis.row
    //       ? isFlexSize(width)
    //         ? `calc(${width.flex * 100}% - (4 * ${cssPadding ?? `0px`}))`
    //         : widthGrows
    //           ? `calc(100% - (4 * ${cssPadding ?? `0px`}))`
    //           : undefined
    //       : undefined,
  };
  return result;
}

// b-x/BoxLayout.ts
var Axis = {
  row: `row`,
  column: `column`,
  stack: `stack`
};
var Overflow2 = {
  /** TODO: A css overflow of `visible` doesn't behave like we want it to. We
   * want it to behave like a spreadsheet, showing the overflow but not affecting
   * layout. However, a css overflow of visible instead affect the layout of
   * siblings and parents. We need to find a way to fix this. It would probabl
   * involve spawing a sub div to wrap the children in. */
  // visible: `visible`, // Maybe just call this "overflow"
  forceStretchParent: `forceStretchParent`,
  crop: `crop`,
  // Ellipsis should be a sub option of crop on overflowX
  wrap: `wrap`,
  scroll: `scroll`
};
var defaultOverflowX = Overflow2.forceStretchParent;
var defaultOverflowY = Overflow2.forceStretchParent;
var _FlexAlign = {
  start: `flex-start`,
  center: `center`,
  end: `flex-end`
};
var _SpaceAlign = {
  spaceBetween: `space-between`,
  spaceAround: `space-around`,
  spaceEvenly: `space-evenly`
};
var Align = {
  ..._FlexAlign,
  ..._SpaceAlign,
  topLeft: {
    alignX: _FlexAlign.start,
    alignY: _FlexAlign.start
  },
  topCenter: {
    alignX: _FlexAlign.center,
    alignY: _FlexAlign.start
  },
  topRight: {
    alignX: _FlexAlign.end,
    alignY: _FlexAlign.start
  },
  centerLeft: {
    alignX: _FlexAlign.start,
    alignY: _FlexAlign.center
  },
  center: {
    alignX: _FlexAlign.center,
    alignY: _FlexAlign.center
  },
  centerRight: {
    alignX: _FlexAlign.end,
    alignY: _FlexAlign.center
  },
  bottomLeft: {
    alignX: _FlexAlign.start,
    alignY: _FlexAlign.end
  },
  bottomCenter: {
    alignX: _FlexAlign.center,
    alignY: _FlexAlign.end
  },
  bottomRight: {
    alignX: _FlexAlign.end,
    alignY: _FlexAlign.end
  }
};
function computeBoxLayout(sty, align, parent2, axis, childCount) {
  const padTop = sizeToCss(
    sty.padTop ?? sty.padAroundY ?? sty.padAround ?? sty.pad ?? 0
  );
  const padRight = sizeToCss(
    sty.padRight ?? sty.padAroundX ?? sty.padAround ?? sty.pad ?? 0
  );
  const padBottom = sizeToCss(
    sty.padBottom ?? sty.padAroundY ?? sty.padAround ?? sty.pad ?? 0
  );
  const padLeft = sizeToCss(
    sty.padLeft ?? sty.padAroundX ?? sty.padAround ?? sty.pad ?? 0
  );
  const padBetweenRows = sizeToCss(
    sty.padBetweenRows ?? sty.padBetween ?? sty.pad ?? 0
  );
  const padBetweenColumns = sizeToCss(
    sty.padBetweenColumns ?? sty.padBetween ?? sty.pad ?? 0
  );
  const alignX = (() => {
    let result = sty.alignX ?? (isString(align) ? align : align.alignX) ?? _FlexAlign.center;
    if (result === _SpaceAlign.spaceBetween && childCount === 1) {
      result = _FlexAlign.center;
    }
    return result;
  })();
  const alignY = (() => {
    let result = sty.alignY ?? (isString(align) ? align : align.alignY) ?? _FlexAlign.center;
    if (result === _SpaceAlign.spaceBetween && childCount === 1) {
      result = _FlexAlign.center;
    }
    return result;
  })();
  const overflowX = sty.overflowX ?? defaultOverflowX;
  const overflowY = sty.overflowY ?? defaultOverflowY;
  return {
    // position: parent?.props?.sty?.axis === Axis.stack ? `absolute` : `relative`,
    // Pad
    // NOTE: Default could maybe be based off of font size.
    // NOTE: We might consider making padding and spacing cascade. I'm not sure if we want to, but it might reduce developer code.
    padding: `${padTop} ${padRight} ${padBottom} ${padLeft}`,
    rowGap: padBetweenRows,
    columnGap: padBetweenColumns,
    margin: 0,
    // Align: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
    // I've decided that space-between with one child should center it, instead of putting it at the start like CSS does.
    justifyContent: axis === Axis.column ? alignY : alignX,
    alignItems: axis === Axis.column ? alignX : alignY,
    // Axis
    flexDirection: axis === Axis.stack ? void 0 : axis,
    // Overflow
    flexWrap: axis === Axis.row ? overflowX === Overflow2.wrap ? `wrap` : void 0 : overflowY === Overflow2.wrap ? `wrap` : void 0,
    overflowX: overflowX === Overflow2.scroll ? `auto` : overflowX === Overflow2.crop ? `hidden` : `visible`,
    overflowY: overflowY === Overflow2.scroll ? `auto` : overflowY === Overflow2.crop ? `hidden` : `visible`,
    // Scroll bar should be invisible
    scrollbarWidth: [overflowX, overflowY].includes(Overflow2.scroll) ? `thin` : void 0,
    scrollbarColor: [overflowX, overflowY].includes(Overflow2.scroll) ? `#e3e3e3 transparent` : void 0
  };
}

// b-x/BoxDecoration.ts
var mdColors = {
  white: `#ffffffff`,
  almostWhite: `#f9fafdff`,
  pink: `#e91e63ff`,
  red: `#f44336ff`,
  orange: `#ff9800ff`,
  yellow: `#ffea00ff`,
  dataplateyellow: "#f2b212",
  // Added by Jorge to Dataplate project.
  green: `#4caf50ff`,
  teal: `#009688ff`,
  blue: `#2196f3ff`,
  purple: `#9c27b0ff`,
  brown: `#795548ff`,
  grey: `#9e9e9eff`,
  black: `#000000ff`,
  transparent: `#ffffff00`,
  sameAsText: `currentColor`
};
function computeBoxDecoration(sty) {
  const shadowDirection = (() => {
    const givenDirection = sty.shadowDirection ?? Align.bottomRight;
    return {
      x: givenDirection.alignX === _FlexAlign.start ? -1 : givenDirection.alignX === _FlexAlign.center ? 0 : 1,
      y: givenDirection.alignY === _FlexAlign.start ? 1 : givenDirection.alignY === _FlexAlign.center ? 0 : -1
    };
  })();
  return {
    // Box Style
    // background: sty.background,
    borderRadius: exists(sty.cornerRadius) ? Array.isArray(sty.cornerRadius) ? sty.cornerRadius.map(sizeToCss).join(` `) : sizeToCss(sty.cornerRadius) : void 0,
    //border: `none`,
    outline: exists(sty.outlineSize) ? `${sizeToCss(sty.outlineSize)} solid ${sty.outlineColor}` : void 0,
    outlineOffset: exists(sty.outlineSize) ? `-${sizeToCss(sty.outlineSize)}` : void 0,
    backgroundColor: sty.background?.startsWith(`data:image`) || sty.background?.startsWith(`/`) ? void 0 : sty.background,
    backgroundImage: sty.background?.startsWith(`data:image`) || sty.background?.startsWith(`/`) ? `url('${sty.background}')` : void 0,
    backgroundSize: `cover`,
    backgroundPosition: `center`,
    backgroundRepeat: `no-repeat`,
    // Add background images
    boxShadow: exists(sty.shadowSize) ? `${sizeToCss(0.09 * sty.shadowSize * shadowDirection.x)} ${sizeToCss(
      -0.09 * sty.shadowSize * shadowDirection.y
    )} ${sizeToCss(0.4 * sty.shadowSize)} 0 #00000045` : void 0,
    zIndex: sty.zIndex
  };
}

// b-x/BoxText.ts
function numToFontSize(num) {
  return sizeToCss(num);
}
function computeTextStyle(sty, alignX, overflowX) {
  return {
    // Text Style
    fontFamily: `Roboto`,
    //sty.fontFamily ?? `Roboto` ?? `inherit`,
    fontSize: isNum(sty.scale) ? numToFontSize(sty.scale) : sty.scale,
    fontWeight: exists(sty.textIsBold) ? sty.textIsBold ? `bold` : `normal` : void 0,
    fontStyle: exists(sty.textIsItalic) ? sty.textIsItalic ? `italic` : `normal` : void 0,
    textDecoration: exists(sty.textIsUnderlined) ? sty.textIsUnderlined ? `underline` : `none` : void 0,
    textAlign: alignX === _FlexAlign.start ? `left` : alignX === _FlexAlign.end ? `right` : (
      // We assume for now that all other aligns cam be treated as center
      `center`
    ),
    lineHeight: sty.scale === void 0 ? void 0 : sizeToCss(sty.scale),
    whiteSpace: (
      // whiteSapce casacdes, so we need to explicity set it.
      overflowX === Overflow2.crop || overflowX === Overflow2.forceStretchParent ? `nowrap` : `normal`
    ),
    // textOverflow: sty.useEllipsisForOverflow ?? false ? `ellipsis` : undefined,
    color: sty.textColor
  };
}

// b-x/BoxInteraction.ts
function computeBoxInteraction(sty) {
  return {
    pointerEvents: sty.isInteractable === void 0 ? void 0 : sty.isInteractable ? `auto` : `none`
  };
}

// b-x/index.ts
var Align3 = Align;
var Axis2 = Axis;
var Overflow3 = Overflow2;
var mdColors2 = mdColors;
var sizeToCss2 = sizeToCss;
function applyStylePart(selfStyle, updates) {
  for (const key of Object.keys(updates)) {
    if (updates[key] !== selfStyle[key]) {
      selfStyle[key] = updates[key] ?? ``;
    }
  }
}
var Miwi_Box = class _Miwi_Box extends HTMLElement {
  _parentObserver;
  _parentAxis = `column`;
  // TODO: Add `stack` option. Probably needs to be a class or something of the sort.
  _parentPadTop = `0px`;
  _parentPadRight = `0px`;
  _parentPadBottom = `0px`;
  _parentPadLeft = `0px`;
  // private _selfObserver: MutationObserver;
  // private _childrenObserver: MutationObserver;
  _childCount = 0;
  // private _anyChildIsABoxWithAGrowingWidth: boolean = false;
  // private _anyChildIsABoxWithAGrowingHeight: boolean = false;
  static get observedAttributes() {
    return ["sty"];
  }
  _sty = {};
  get sty() {
    return this._sty;
  }
  set sty(value) {
    this._sty = value;
    this.updateStyle();
  }
  get _axis() {
    return this.sty.axis ?? Axis.column;
  }
  _widthGrows = void 0;
  _heightGrows = void 0;
  _numChildrenWithGrowingWidths = 0;
  _numChildrenWithGrowingHeights = 0;
  get _someChildWidthGrows() {
    return this._numChildrenWithGrowingWidths > 0;
  }
  get _someChildHeightGrows() {
    return this._numChildrenWithGrowingHeights > 0;
  }
  thisIsAChildTogglingTheFactThatItGrows(props) {
    let shouldUpdateStyle = false;
    if (exists(props.widthGrows)) {
      const oldSomeChildGrows = this._someChildWidthGrows;
      this._numChildrenWithGrowingWidths += props.widthGrows ? 1 : -1;
      if (oldSomeChildGrows !== this._someChildWidthGrows) {
        shouldUpdateStyle = true;
      }
    }
    if (exists(props.heightGrows)) {
      const oldSomeChildGrows = this._someChildHeightGrows;
      this._numChildrenWithGrowingHeights += props.heightGrows ? 1 : -1;
      if (oldSomeChildGrows !== this._someChildHeightGrows) {
        shouldUpdateStyle = true;
      }
    }
    if (shouldUpdateStyle)
      this.updateStyle();
  }
  computeParentStyle() {
    let shouldUpdateStyle = false;
    if (exists(this.parentElement)) {
      const computedParentStyle = getComputedStyle(this.parentElement);
      if (this._parentAxis !== computedParentStyle.flexDirection) {
        this._parentAxis = computedParentStyle.flexDirection;
        shouldUpdateStyle = true;
      }
      if (this._parentPadTop !== computedParentStyle.paddingTop) {
        this._parentPadTop = computedParentStyle.paddingTop;
        shouldUpdateStyle = true;
      }
      if (this._parentPadRight !== computedParentStyle.paddingRight) {
        this._parentPadRight = computedParentStyle.paddingRight;
        shouldUpdateStyle = true;
      }
      if (this._parentPadBottom !== computedParentStyle.paddingBottom) {
        this._parentPadBottom = computedParentStyle.paddingBottom;
        shouldUpdateStyle = true;
      }
      if (this._parentPadLeft !== computedParentStyle.paddingLeft) {
        this._parentPadLeft = computedParentStyle.paddingLeft;
        shouldUpdateStyle = true;
      }
    }
    return shouldUpdateStyle;
  }
  computeSomeChildGrows() {
    const result = {
      someChildWidthGrows: false,
      someChildHeightGrows: false
    };
    for (let i = 0; i < this.children.length && (!result.someChildWidthGrows || !result.someChildWidthGrows); i++) {
      const child = this.children.item(i);
      if (!(child instanceof _Miwi_Box))
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
  updateStyle() {
    const align = this.sty.align ?? Align.center;
    const { someChildWidthGrows, someChildHeightGrows } = this.computeSomeChildGrows();
    const formattedWidth = formatRawSize({
      someChildGrows: someChildWidthGrows,
      size: this.sty.width
    });
    const formattedHeight = formatRawSize({
      someChildGrows: someChildHeightGrows,
      size: this.sty.height
    });
    applyStylePart(
      this.style,
      computeBoxSize(
        this.sty,
        formattedWidth,
        formattedHeight,
        this._parentAxis,
        this._parentPadTop,
        this._parentPadRight,
        this._parentPadBottom,
        this._parentPadLeft,
        this.sty.shouldLog
      )
    );
    applyStylePart(
      this.style,
      computeBoxLayout(
        this.sty,
        align,
        this._parentAxis,
        this._axis,
        this._childCount
      )
    );
    applyStylePart(this.style, computeBoxDecoration(this.sty));
    applyStylePart(
      this.style,
      computeTextStyle(
        this.sty,
        isString(align) ? align : align.alignX,
        this.sty.overflowX ?? defaultOverflowX
      )
    );
    applyStylePart(this.style, computeBoxInteraction(this.sty));
    this.classList.toggle(
      stackClassName,
      (this.sty.axis ?? Axis.column) === Axis.stack
    );
    this.classList.toggle(
      nonStackClassName,
      (this.sty.axis ?? Axis.column) !== Axis.stack
    );
    this.classList.toggle(
      bonusTouchAreaClassName,
      this.sty.bonusTouchArea ?? false
    );
    const newWidthGrows = isFlexSize(formattedWidth) && formattedWidth.flex > 0;
    this.classList.toggle(widthGrowsClassName, newWidthGrows);
    const shouldUpdateWidthGrows = this._widthGrows !== newWidthGrows;
    const newHeightGrows = isFlexSize(formattedHeight) && formattedHeight.flex > 0;
    this.classList.toggle(heightGrowsClassName, newHeightGrows);
    const shouldUpdateHeightGrows = this._heightGrows !== newHeightGrows;
    if (shouldUpdateWidthGrows || shouldUpdateHeightGrows) {
      if (exists(this.parentElement)) {
        if (this.parentElement instanceof _Miwi_Box) {
          if (shouldUpdateWidthGrows)
            this._widthGrows = newWidthGrows;
          if (shouldUpdateHeightGrows)
            this._heightGrows = newHeightGrows;
          this.parentElement.thisIsAChildTogglingTheFactThatItGrows({
            widthGrows: shouldUpdateWidthGrows ? newWidthGrows : void 0,
            heightGrows: shouldUpdateHeightGrows ? newHeightGrows : void 0
          });
        }
      }
    }
  }
  constructor() {
    super();
    this.classList.add(`b-x`);
    this._parentObserver = new MutationObserver((mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          const shouldUpdateStyle = this.computeParentStyle();
          if (shouldUpdateStyle)
            this.updateStyle();
          return;
        }
      }
    });
  }
  connectedCallback() {
    this.computeParentStyle();
    this.updateStyle();
    if (exists(this.parentElement)) {
      this._parentObserver.observe(this.parentElement, { attributes: true });
    }
  }
  disconnectedCallback() {
    this._parentObserver.disconnect();
    this._childCount = 0;
    if (this.parentElement instanceof _Miwi_Box) {
      this.parentElement.thisIsAChildTogglingTheFactThatItGrows({
        widthGrows: false,
        heightGrows: false
      });
    }
  }
};
var widthGrowsClassName = `b-x-width-grows`;
var heightGrowsClassName = `b-x-height-grows`;
var stackClassName = `b-x-stack`;
var nonStackClassName = `b-x-non-stack`;
var bonusTouchAreaClassName = `b-x-bonus-touch-area`;
var style = document.createElement(`style`);
style.textContent = `
.${stackClassName} > * {
  position: absolute;
}

.${nonStackClassName} > * {
  position: relative;
}

.${bonusTouchAreaClassName}::before {
  content: '';
  position: absolute;
  top: -1rem;
  right: -1rem;
  bottom: -1rem;
  left: -1rem;
  z-index: -1;
}
`;
document.body.appendChild(style);
customElements.define("b-x", Miwi_Box);

export { Align3 as Align, Axis2 as Axis, Miwi_Box, Overflow3 as Overflow, mdColors2 as mdColors, sizeToCss2 as sizeToCss };
