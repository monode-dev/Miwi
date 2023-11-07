type CustomHtmlAttributes = {
  [key: string]: any
}
// TODO: overrideProps
type ApplyStyle<
  RawProps extends CustomHtmlAttributes,
  NewNormalizedProps extends CustomHtmlAttributes | void,
> = (
  attributes: Partial<RawProps>,
  htmlElement: HTMLElement,
  context: {
    readonly parentStyle?: CSSStyleDeclaration
    readonly parentElement?: HTMLElement
    readonly childCount: number
    readonly aChildsWidthGrows: boolean
    readonly aChildsHeightGrows: boolean
  },
) => NewNormalizedProps

export const baseStyler = combineStyleAppliers<{}, {}, {}, {}>(unparsedAttributes => {
  return unparsedAttributes
})

function combineStyleAppliers<
  OldRawProps extends CustomHtmlAttributes,
  NewRawProps extends CustomHtmlAttributes,
  OldNormalizedProps extends CustomHtmlAttributes,
  NewNormalizedProps extends CustomHtmlAttributes | void,
>(
  newStyleApplier: ApplyStyle<NewRawProps, NewNormalizedProps>,
  oldStyleApplier?: ApplyStyle<OldRawProps, OldNormalizedProps>,
) {
  const combinedStyleApplier: ApplyStyle<
    OldRawProps & NewRawProps,
    OldNormalizedProps & (NewNormalizedProps extends void ? {} : NewNormalizedProps)
  > = (attributes, htmlElement, context) => {
    oldStyleApplier?.(attributes, htmlElement, context) ?? {}
    return newStyleApplier(attributes, htmlElement, context as any) as any
  }
  return {
    applyStyle: combinedStyleApplier,
    addStyler: <
      SubRawProps extends CustomHtmlAttributes,
      SubNormalizedProps extends CustomHtmlAttributes | void = void,
    >(
      subStyleApplier: ApplyStyle<SubRawProps, SubNormalizedProps>,
    ) => {
      return combineStyleAppliers(subStyleApplier, combinedStyleApplier)
    },
  }
}
