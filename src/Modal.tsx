import { Prop, ReadonlyProp, doNow, exists, useProp, doWatch } from "./utils";
import { Box, BoxProps } from "./Box/Box";
import { Stack } from "./Stack";
import { JSX, Show, onCleanup, onMount } from "solid-js";
import { SIZE_SHRINKS, Size } from "./Box/BoxSize";
import { findPageInAncestors, isActivePage } from "./Nav";

export const [numOpenModals, toggleModalIsOpen] = doNow(() => {
  const openModals = new Set<HTMLElement>();
  const _numOpenModals = useProp(0);
  return [
    _numOpenModals as ReadonlyProp<number>,
    (modal: HTMLElement, isOpen: boolean) => {
      if (isOpen) {
        openModals.add(modal);
      } else {
        openModals.delete(modal);
      }
      _numOpenModals.value = openModals.size;
    },
  ];
});

export function Modal(
  props: {
    openButton: JSX.Element;
    openButtonWidth: Size;
    openButtonHeight: Size;
    isOpenSig?: Prop<boolean>;
    modalWidth?: Size;
    pad?: number;
    cardStyle?: BoxProps;
  } & BoxProps,
) {
  // Modal
  const openButton = props.openButton as HTMLElement;
  let modal: HTMLElement | undefined = undefined;
  let element: HTMLElement | undefined = undefined;

  //
  const _isOpen = useProp(props.isOpenSig?.value ?? false);
  if (exists(props.isOpenSig)) {
    doWatch(
      () => {
        if (_isOpen.value === props.isOpenSig!.value) return;
        if (props.isOpenSig!.value) {
          openDropDown();
        } else {
          closeDropDown();
        }
      },
      {
        on: [props.isOpenSig],
      },
    );
    doWatch(
      () => {
        if (_isOpen.value === props.isOpenSig!.value) return;
        props.isOpenSig!.value = _isOpen.value;
      },
      {
        on: [_isOpen],
      },
    );
  }
  onMount(() => {
    doWatch(() => {
      toggleModalIsOpen(element!, _isOpen.value);
    });
    onCleanup(() => {
      toggleModalIsOpen(element!, false);
    });
  });

  //
  const shouldOpenUpwards = useProp(false);
  function openDropDown() {
    if (_isOpen.value) return;
    shouldOpenUpwards.value = openButton.getBoundingClientRect().top > window.innerHeight * 0.6;
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
    if (openButton.contains(e.target as any)) return;
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
      width={props.openButtonWidth}
      height={props.openButtonHeight}
      align={shouldOpenUpwards.value ? $Align.bottomRight : $Align.topRight}
      getElement={el => (element = el)}
    >
      {/* Open Button */}
      {openButton}

      {/* Modal */}
      <Show when={_isOpen.value}>
        <Box width={props.modalWidth ?? SIZE_SHRINKS} alignTopLeft overflowYSpills>
          <Show when={!shouldOpenUpwards.value}>
            <Box height={props.openButtonHeight} />
            <Box height={0.5} />
          </Show>
          <Box
            // widthGrows
            minHeight={0}
            heightShrinks
            maxHeight={16.65}
            overflowYScrolls
            pad={1}
            shadowSize={1}
            fill={$theme.colors.accent}
            alignTopLeft
            preventClickPropagation
            getElement={el => (modal = el)}
            zIndex={1000}
            overrideProps={props.cardStyle}
          >
            {props.children}
          </Box>
          <Show when={shouldOpenUpwards.value}>
            <Box height={0.5} />
            <Box height={props.openButtonHeight} />
          </Show>
        </Box>
      </Show>
    </Stack>
  );
}
