
import { mdiArrowLeft, mdiCogOutline } from "@mdi/js";
import { JSXElement, Show, onMount } from "solid-js";
import { pagePadding } from "./SimplePage";
import { Box, BoxProps, exists, Field, getMyPageIndex, Icon, makePropParser, popPage, Prop, Stack, Txt, useFormula, useProp } from "./miwi";
import { Row } from "./Row"

export const defaultAppBarScale = 1.25;

export function InlineEditableAppBar(props: {
  name: Prop<string>;
  emptyWarning: string;
  fill?: string;
  right?: JSXElement;
}) {
  const isEditing = useProp(false);
  let nameFieldWasBlurredThisFrame = 0;
  const isEmpty = useFormula(() => props.name.value.trim() === ``);
  const tempName = useProp(``);
  return (
    <InlineAppBar
      fill={props.fill}
      name={
        <Row
          scale={defaultAppBarScale}
          padBetween={0.25}
          widthGrows
          overflowXCrops
          overflowYCrops
          height={defaultAppBarScale * 1.25}
          alignCenter
        >
          <Show
            when={!isEmpty.value || isEditing.value}
            fallback={
              <Txt
                singleLine
                alignCenter
                stroke={$theme.colors.warning}
                onClick={() => (isEditing.value = true)}
              >
                {props.emptyWarning}
              </Txt>
            }
          >
            <Field
              scale={defaultAppBarScale}
              alignCenter
              hasFocus={isEditing}
              onBlur={() => {
                nameFieldWasBlurredThisFrame++;
                requestAnimationFrame(() => {
                  nameFieldWasBlurredThisFrame--;
                });
              }}
              value={props.name}
            />
          </Show>
          {/* <Box padAroundY={defaultAppBarScale * 0.1}>
              <Field
                scale={defaultAppBarScale}
                alignCenter
                hasFocus={isEditing}
                onBlur={() => {
                  nameFieldWasBlurredThisFrame++;
                  requestAnimationFrame(() => {
                    nameFieldWasBlurredThisFrame--;
                  });
                }}
                valueSig={props.title}
              />
            </Box> */}
        </Row>
      }
      right={
        props.right
        // <Icon
        //   iconPath={isEditing.value ? mdiCheck : mdiPencilOutline}
        //   stroke={isEditing.value ? $theme.colors.primary : undefined}
        //   onClick={() => {
        //     if (!isEditing.value && nameFieldWasBlurredThisFrame === 0) {
        //       isEditing.value = true;
        //     }
        //   }}
        // />
      }
    />
  );
}

export function InlineAppBar(
  props: {
    name?: string | JSXElement;
    right?: JSXElement;
    emptyWarning?: string;
    bold?: boolean;
    backButton?: {
      icon?: string;
    };
  } & BoxProps,
) {
  const iconSize = 1.25;
  const parseProp: (...args: any[]) => any = makePropParser(props);
  const fill = parseProp(`fill`) ?? $theme.colors.pageBackground;
  const showBackButton = useProp(false); // useFormula(() => nav.openedPages.value.length > 1);
  const isEmpty = useFormula(
    () => typeof props.name === `string` && props.name.trim() === ``,
  );
  let element: HTMLElement | null = null;
  onMount(() => {
    if (!exists(element)) return;
    showBackButton.value = (getMyPageIndex(element) ?? 0) > 0;
  });
  return (
    <Box
      padTop={`env(safe-area-inset-top)`}
      fill={fill}
      zIndex={5}
      getElement={(el) => (element = el)}
    >
      <Row
        widthGrows
        alignCenter
        padAround={pagePadding}
        padBetween={0.5}
        padBottom={1}
        overrideProps={props}
      >
        {/* <Show when={showBackButton.value}> */}
        <Stack
          width={iconSize}
          height={iconSize}
          alignCenter
          //alignCenterLect
          scale={iconSize}
          // overflowXCrops
          overflowXSpills
        >
          <Show when={showBackButton.value}>
            <Icon
              icon={props.backButton?.icon ?? mdiArrowLeft}
              scale={iconSize}
            />
            <Box width={iconSize + 1} height={iconSize + 1} onClick={popPage} />
          </Show>
        </Stack>
        {/* </Show> */}
        {/* <Box width={iconSize} height={iconSize}>
          <UploadingIndicator />
        </Box> */}
        <Box widthGrows>
          {!exists(props.name) ? (
            <Txt h2 stroke={`transparent`} height={defaultAppBarScale * 1.25}>
              X
            </Txt>
          ) : typeof props.name === "string" ? (
            <Txt
              h2
              bold={props.bold ? true : false}
              singleLine
              height={defaultAppBarScale * 1.25}
              stroke={isEmpty.value ? $theme.colors.warning : undefined}
            >
              {isEmpty.value ? props.emptyWarning ?? `Unnamed!` : props.name}
            </Txt>
          ) : (
            props.name
          )}
        </Box>

        {/* <Show when={showBackButton.value}>
          <Box width={iconSize} height={iconSize} />
        </Show> */}
        <Box width={iconSize} align={$Align.centerRight} scale={iconSize}>
          {props.right}
        </Box>
      </Row>
    </Box>
  );
}
