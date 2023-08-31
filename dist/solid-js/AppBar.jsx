import { Box, grow, parseSty } from "./Box";
import { computed } from "./utils";
import { useNav } from "./Nav";
import { Icon } from "./Icon";
export function AppBar(props) {
    const nav = useNav();
    const sty = computed(() => parseSty(props, {
        background: $theme.colors.primary,
    }));
    return (<Box width={grow()}>
      {/* Notch Spacer */}
      <Box width={grow()} height={`env(safe-area-inset-top)`} background={sty.value.background} zIndex={2}/>

      {/* AppBar */}
      <Box width={grow()} background={sty.value.background} shadowSize={1.25} shadowDirection={$Align.bottomCenter} align={$Align.bottomCenter} textColor={$theme.colors.accent} zIndex={1} sty={sty.value}>
        {/* Main Row */}
        <Box width={grow()} axis={$Axis.row} pad={0.5} scale={1.5}>
          {/* Left */}
          <Box width={grow()} align={$Align.centerLeft}>
            {props.left ??
            (nav.openedPages.value.length > 1 ? (<Icon onClick={nav.popPage} size={1.25} icon="arrowLeft"/>) : undefined)}
          </Box>

          {/* Title / Center */}
          <Box width={grow(3)} align={$Align.center} textIsBold={true} axis={$Axis.row}>
            {props.children}
          </Box>

          {/* Right */}
          <Box width={grow()} align={$Align.centerRight}>
            {props.right}
          </Box>
        </Box>

        {/* Bottom Row */}
        <Box width={grow()} scale={1}>
          {props.bottom}
        </Box>
      </Box>
    </Box>);
}
