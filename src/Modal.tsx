import { Prop, ReadonlyProp, exists, useProp, doWatch } from "./utils";
import { Box, BoxProps } from "./Box/Box";
import { Stack } from "./Stack";
import { JSX, Show, onCleanup, onMount } from "solid-js";
import { SIZE_SHRINKS, Size } from "./Box/BoxSize";
import { findPageInAncestors, isActivePage } from "./Nav";
import { Column } from "./Column";
import { Card } from "./Card";

// SECTION: Modal Utils
const _openModals = new Map<Element, () => void>();
const _numOpenModals = useProp(0);
export const numOpenModals: ReadonlyProp<number> = _numOpenModals;
const _recordModalOpenState = (modalElement: Element, isOpen: boolean, close: () => void) => {
  if (isOpen) {
    _openModals.set(modalElement, close);
  } else {
    _openModals.delete(modalElement);
  }
  _numOpenModals.value = _openModals.size;
};
const _modalCssClass = `miwi-modal`;
export const closeParentModal = (thisElement: Element | null | undefined) => {
  const modalElement = thisElement?.closest(`.${_modalCssClass}`);
  if (!exists(modalElement)) return;
  _openModals.get(modalElement)?.();
};

// SECTION: Modal Component
/* TODO: Eventually phase out <Modal> and replace it with <HiddenOptions> */
export function Modal(
  props: {
    openButton: JSX.Element;
    isOpen?: Prop<boolean>;
    modalWidth?: Size;
    pad?: number;
    cardStyle?: BoxProps;
  } & BoxProps,
) {
  // Modal
  let openButtonContainer: HTMLElement | undefined = undefined;
  let modal: HTMLElement | undefined = undefined;
  let element: HTMLElement | undefined = undefined;

  //
  const _isOpen = useProp(props.isOpen?.value ?? false);
  if (exists(props.isOpen)) {
    doWatch(
      () => {
        if (_isOpen.value === props.isOpen!.value) return;
        if (props.isOpen!.value) {
          openDropDown();
        } else {
          closeDropDown();
        }
      },
      {
        on: [props.isOpen],
      },
    );
    doWatch(
      () => {
        if (_isOpen.value === props.isOpen!.value) return;
        props.isOpen!.value = _isOpen.value;
      },
      {
        on: [_isOpen],
      },
    );
  }
  onMount(() => {
    doWatch(() => {
      _recordModalOpenState(element!, _isOpen.value, closeDropDown);
    });
    onCleanup(() => {
      _recordModalOpenState(element!, false, closeDropDown);
    });
  });

  //
  const shouldOpenUpwards = useProp(false);
  function openDropDown() {
    if (_isOpen.value) return;
    shouldOpenUpwards.value =
      openButtonContainer!.getBoundingClientRect().top > window.innerHeight * 0.6;
    _isOpen.value = true;
  }
  function closeDropDown() {
    if (!_isOpen.value) return;
    _isOpen.value = false;
  }

  // Close the dropdown when the user clicks outside of it
  function closeOnClickOutside(e: MouseEvent) {
    if (!_isOpen.value) return;
    if (modal?.contains(e.target as any) ?? false) return;
    if (openButtonContainer!.contains(e.target as any)) return;
    if (!exists(modal)) return;
    const page = findPageInAncestors(modal);
    if (exists(page) && !isActivePage(page)) return;
    e.stopPropagation();
    closeDropDown();
  }

  onMount(() => {
    document.addEventListener(`click`, closeOnClickOutside, true);
    onCleanup(() => {
      document.removeEventListener(`click`, closeOnClickOutside);
    });
  });

  //
  return (
    <Stack
      pad={props.pad ?? 0}
      align={shouldOpenUpwards.value ? $Align.bottomRight : $Align.topRight}
      getElement={el => (element = el)}
      classList={{
        [_modalCssClass]: true,
      }}
    >
      {/* Open Button */}
      <Box getElement={el => (openButtonContainer = el)}>{props.openButton}</Box>

      {/* Modal */}
      <Show when={_isOpen.value}>
        <Column
          width={props.modalWidth ?? SIZE_SHRINKS}
          asTallAsParent
          alignTopLeft
          overflowYSpills
          padBetween={0.5}
        >
          <Show when={!shouldOpenUpwards.value}>
            <Box asTallAsParent />
          </Show>
          {/* NOTE: We need this wrapper box because with overflowYSpills on the parent and
           * overflowYScrolls on the card, the card decides to not give any space for its
           * children only for its pad Around. */}
          <Box
            width={0}
            overflowXSpills
            heightShrinks
            maxHeight={16.65}
            align={shouldOpenUpwards.value ? $Align.bottomRight : $Align.topRight}
          >
            <Card
              heightShrinks
              maxHeight={16.65}
              overflowYScrolls
              pad={1}
              shadowSize={1}
              fill={$theme.colors.accent}
              alignTopLeft
              preventClickPropagation
              getElement={el => (modal = el)}
              cornerRadius={0.5}
              zIndex={2}
              overrideProps={props.cardStyle}
            >
              {props.children}
            </Card>
          </Box>
          <Show when={shouldOpenUpwards.value}>
            <Box asTallAsParent />
          </Show>
        </Column>
      </Show>
    </Stack>
  );
}
