type CustomHtmlAttributes = {
  [key: string]: any
}
type ApplyStyle<
  NewAttributes extends CustomHtmlAttributes,
  OldAttributes extends CustomHtmlAttributes,
> = (
  mySty: Partial<OldAttributes & NewAttributes>,
  htmlElement: HTMLElement,
  bonusConfig: Readonly<{
    parentStyle?: CSSStyleDeclaration
    parentElement?: HTMLElement
    childCount: number
    aChildsWidthGrows: boolean
    aChildsHeightGrows: boolean
  }>,
) => Partial<NewAttributes & OldAttributes>

export const baseStyler = combineStyleAppliers<{}, {}>(mySty => {
  return mySty
})

function combineStyleAppliers<
  NewAttributes extends CustomHtmlAttributes,
  OldAttributes extends CustomHtmlAttributes,
>(
  newStyleApplier: ApplyStyle<NewAttributes, OldAttributes>,
  oldStyleApplier?: ApplyStyle<OldAttributes, {}>,
) {
  const combinedStyleApplier: ApplyStyle<NewAttributes & OldAttributes, {}> = (
    sty,
    htmlElement,
    bonusConfig,
  ) => {
    const oldSty = oldStyleApplier?.(sty, htmlElement, bonusConfig) ?? sty
    return newStyleApplier(oldSty as OldAttributes & NewAttributes, htmlElement, bonusConfig)
  }
  return {
    applyStyle: combinedStyleApplier,
    addStyler: <SubAttributes extends CustomHtmlAttributes>(
      subStyleApplier: ApplyStyle<SubAttributes, NewAttributes & OldAttributes>,
    ) => {
      return combineStyleAppliers(subStyleApplier, combinedStyleApplier)
    },
  }
}
