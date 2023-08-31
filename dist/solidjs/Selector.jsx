import { computed, exists, injectDefaults, signal, watchDeps, } from "./utils";
import { grow, parseSty } from "./Box";
import { Text } from "./Text";
import { Row } from "./Row";
import { Icon } from "./Icon";
import { Modal } from "./Modal";
export function Selector(props) {
    props = injectDefaults(props, {
        noneLabel: `None`,
        emptyListText: `No Options`,
        isWide: false,
    });
    const sty = parseSty(props);
    const selectedLabel = computed(() => {
        return props.getLabelForData(props.value) ?? props.noneLabel;
    });
    const thereAreNoOptions = computed(() => {
        return (!exists(props.children) ||
            (Array.isArray(props.children) && props.children.length === 0));
    });
    //
    const _modalIsOpen = signal(props.modalIsOpen?.value ?? false);
    if (exists(props.modalIsOpen)) {
        watchDeps([props.modalIsOpen], () => {
            if (_modalIsOpen.value === props.modalIsOpen.value)
                return;
            if (props.modalIsOpen) {
                openDropDown();
            }
            else {
                closeDropDown();
            }
        });
        watchDeps([_modalIsOpen], () => {
            if (_modalIsOpen.value === props.modalIsOpen.value)
                return;
            props.modalIsOpen.value = _modalIsOpen.value;
        });
    }
    //
    function openDropDown() {
        if (_modalIsOpen.value)
            return;
        _modalIsOpen.value = true;
    }
    function closeDropDown() {
        if (!_modalIsOpen.value)
            return;
        _modalIsOpen.value = false;
        if (exists(props.filterString)) {
            props.filterString.value = ``;
        }
    }
    return (<Modal openButton={<Row onClick={() => {
                if (exists(props.filterString)) {
                    openDropDown();
                }
                else {
                    if (_modalIsOpen.value) {
                        _modalIsOpen.value = false;
                    }
                    else {
                        openDropDown();
                    }
                }
            }} width={grow()} height={sty.scale ?? 1} align={$Align.spaceBetween}>
          {" "}
          {!exists(props.filterString) || !_modalIsOpen.value ? (<Text width={grow()} overflowX={$Overflow.crop} textColor={exists(props.value) ? $theme.colors.text : $theme.colors.hint}>
              {selectedLabel.value}
            </Text>) : (<Text width={grow()} hint>
              Search
            </Text>
            // <Field value={props.filterString} hint="Search" hasFocus={true} />
            )}
          <Icon icon={exists(props.filterString) && _modalIsOpen.value
                ? `close`
                : `menuDown`} onClick={() => {
                if (_modalIsOpen.value) {
                    _modalIsOpen.value = false;
                }
                else {
                    openDropDown();
                }
            }}/>
        </Row>} openButtonWidth={grow()} openButtonHeight={sty.scale ?? 1} isOpen={_modalIsOpen} modalWidth={props.isWide ? `100%` : undefined}>
      {/* SECTION: No Options */}
      {thereAreNoOptions ? undefined : (<Text hint onClick={() => (_modalIsOpen.value = false)} width={grow()}>
          {props.emptyListText}
        </Text>)}

      {/* SECTION: Cancel */}
      {exists(props.filterString) &&
            props.showCancelOptionForFilter &&
            !thereAreNoOptions.value ? (<Text hint onClick={() => (_modalIsOpen.value = false)} width={grow()}>
          Cancel
        </Text>) : undefined}

      {/* SECTION: Custom Options */}
      {props.children}
    </Modal>);
}
