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
    parentStyle: CSSStyleDeclaration
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
    {},
    htmlElement,
    bonusConfig,
  ) => {
    const oldSty = oldStyleApplier?.({}, htmlElement, bonusConfig) ?? {}
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
