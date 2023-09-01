import { exists, signal, watchDeps } from "./utils";
import { Box, grow } from "./Box";
import { Stack } from "./Stack";
import { Show } from "solid-js";
export function Modal(props) {
    // Modal
    const openButton = (<div>{props.openButton}</div>);
    let modal = undefined;
    //
    const _isOpen = signal(props.isOpen?.value ?? false);
    if (exists(props.isOpen)) {
        watchDeps([props.isOpen], () => {
            if (_isOpen.value === props.isOpen.value)
                return;
            if (props.isOpen.value) {
                openDropDown();
            }
            else {
                closeDropDown();
            }
        });
        watchDeps([_isOpen], () => {
            if (_isOpen.value === props.isOpen.value)
                return;
            props.isOpen.value = _isOpen.value;
        });
    }
    //
    const shouldOpenUpwards = signal(false);
    function openDropDown() {
        if (_isOpen.value)
            return;
        if (exists(modal)) {
            shouldOpenUpwards.value =
                modal.getBoundingClientRect().top > window.innerHeight * 0.6;
        }
        _isOpen.value = true;
    }
    function closeDropDown() {
        if (!_isOpen.value)
            return;
        _isOpen.value = false;
    }
    // Close the dropdown when the user clicks outside of it
    function closeOnClickOutside(e) {
        if (modal?.contains(e.target) ?? false)
            return;
        if (openButton.contains(e.target))
            return;
        closeDropDown();
        e.stopPropagation();
    }
    //
    return (<Stack width={props.openButtonWidth ?? -1} height={props.openButtonHeight} align={shouldOpenUpwards.value ? $Align.bottomRight : $Align.topRight}>
      {/* Open Button */}
      {openButton}

      {/* Modal */}
      <Show when={_isOpen.value}>
        <Box width={props.modalWidth ?? -1} align={$Align.topLeft} overflowY={$Overflow.forceStretchParent} isInteractable={false}>
          <Show when={!shouldOpenUpwards.value}>
            <Box height={props.openButtonHeight} isInteractable={false}/>
            <Box height={0.5} isInteractable={false}/>
          </Show>
          <div style="z-index: 10000;" ref={(el) => (modal = el)}>
            <Box width={grow()} height={{
            min: 0,
            flex: -1,
            max: 16.65,
        }} overflowY={$Overflow.scroll} pad={1} shadowSize={1} background={$theme.colors.accent} align={$Align.topLeft} isInteractable={true}>
              {props.children}
            </Box>
          </div>
          <Show when={shouldOpenUpwards.value}>
            <Box height={0.5} isInteractable={false}/>
            <Box height={props.openButtonHeight} isInteractable={false}/>
          </Show>
        </Box>
      </Show>

      {/* Detect Outside Click */}
      <Show when={_isOpen.value}>
        <div onClick={closeOnClickOutside} style={{
            position: `fixed`,
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            width: `100vw`,
            height: `100vh`,
            ["z-index"]: 4,
        }}/>
      </Show>
    </Stack>);
}
