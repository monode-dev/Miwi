type CustomHtmlAttributes = {
  [key: string]: any
}
// TODO: overrideProps
type ApplyStyle<
  RawProps extends CustomHtmlAttributes,
  OldNormalizedProps extends CustomHtmlAttributes,
  NewNormalizedProps extends CustomHtmlAttributes | void,
> = (
  rawProps: Partial<RawProps>,
  htmlElement: HTMLElement,
  bonusConfig: {
    readonly parentStyle?: CSSStyleDeclaration
    readonly parentElement?: HTMLElement
    readonly childCount: number
    readonly aChildsWidthGrows: boolean
    readonly aChildsHeightGrows: boolean
    normalizedProps: OldNormalizedProps
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
  newStyleApplier: ApplyStyle<NewRawProps, OldNormalizedProps, NewNormalizedProps>,
  oldStyleApplier?: ApplyStyle<OldRawProps, {}, OldNormalizedProps>,
) {
  const combinedStyleApplier: ApplyStyle<
    OldRawProps & NewRawProps,
    {},
    OldNormalizedProps & (NewNormalizedProps extends void ? {} : NewNormalizedProps)
  > = (rawProps, htmlElement, bonusConfig) => {
    const oldNormalizedProps =
      oldStyleApplier?.(rawProps, htmlElement, bonusConfig) ?? bonusConfig.normalizedProps
    for (const key in oldNormalizedProps) {
      ;(bonusConfig as any).normalizedProps[key] = (oldNormalizedProps as any)[key]
    }
    return newStyleApplier(rawProps, htmlElement, bonusConfig as any) as any
  }
  return {
    applyStyle: combinedStyleApplier,
    addStyler: <
      SubRawProps extends CustomHtmlAttributes,
      SubNormalizedProps extends CustomHtmlAttributes | void = void,
    >(
      subStyleApplier: ApplyStyle<
        SubRawProps,
        OldNormalizedProps & (NewNormalizedProps extends void ? {} : NewNormalizedProps),
        SubNormalizedProps
      >,
    ) => {
      return combineStyleAppliers(subStyleApplier, combinedStyleApplier)
    },
  }
}
