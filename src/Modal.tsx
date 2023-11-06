import { Sig, exists, sig, watchDeps } from './utils'
import { Box, BoxProps } from './Box'
import { Stack } from './Stack'
import { JSX, Show, onCleanup, onMount } from 'solid-js'
import { Size } from './b-x/BoxSize'

export function Modal<T>(
  props: {
    openButton: JSX.Element
    openButtonWidth: Size
    openButtonHeight: Size
    isOpenSig?: Sig<boolean>
    modalWidth?: Size
    pad?: number
  } & BoxProps,
) {
  // Modal
  const openButton = props.openButton as HTMLElement
  let modal: HTMLElement | undefined = undefined

  //
  const _isOpen = sig(props.isOpenSig?.value ?? false)
  if (exists(props.isOpenSig)) {
    watchDeps([props.isOpenSig], () => {
      if (_isOpen.value === props.isOpenSig!.value) return
      if (props.isOpenSig!.value) {
        openDropDown()
      } else {
        closeDropDown()
      }
    })
    watchDeps([_isOpen], () => {
      if (_isOpen.value === props.isOpenSig!.value) return
      props.isOpenSig!.value = _isOpen.value
    })
  }

  //
  const shouldOpenUpwards = sig(false)
  function openDropDown() {
    if (_isOpen.value) return
    if (exists(modal)) {
      shouldOpenUpwards.value = modal.getBoundingClientRect().top > window.innerHeight * 0.6
    }
    _isOpen.value = true
  }
  function closeDropDown() {
    if (!_isOpen.value) return
    _isOpen.value = false
  }

  // Close the dropdown when the user clicks outside of it
  function closeOnClickOutside(e: MouseEvent) {
    if (!_isOpen.value) return
    if (modal?.contains(e.target as any) ?? false) return
    if (openButton.contains(e.target as any)) return
    e.stopPropagation()
    closeDropDown()
  }

  onMount(() => {
    document.addEventListener(`click`, closeOnClickOutside, true)
    onCleanup(() => {
      document.removeEventListener(`click`, closeOnClickOutside)
    })
  })

  //
  return (
    <Stack
      pad={props.pad ?? 0}
      width={props.openButtonWidth ?? -1}
      height={props.openButtonHeight}
      align={shouldOpenUpwards.value ? $Align.bottomRight : $Align.topRight}
    >
      {/* Open Button */}
      {openButton}

      {/* Modal */}
      <Show when={_isOpen.value}>
        <Box width={props.modalWidth ?? -1} alignTopLeft overflowY={$Overflow.forceStretchParent}>
          <Show when={!shouldOpenUpwards.value}>
            <Box height={props.openButtonHeight} />
            <Box height={0.5} />
          </Show>
          <div style="z-index: 10000;" ref={el => (modal = el)}>
            <Box
              widthGrows
              height={{
                min: 0,
                flex: -1,
                max: 16.65,
              }}
              overflowY={$Overflow.scroll}
              pad={1}
              shadowSize={1}
              background={$theme.colors.accent}
              alignTopLeft
            >
              {props.children}
            </Box>
          </div>
          <Show when={shouldOpenUpwards.value}>
            <Box height={0.5} />
            <Box height={props.openButtonHeight} />
          </Show>
        </Box>
      </Show>
    </Stack>
  )
}
