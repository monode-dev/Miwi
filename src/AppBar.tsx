import { JSX, Show } from "solid-js";
import { Box, BoxProps } from "./Box/Box";
import { useNav } from "./Nav";
import { Icon } from "./Icon";
import { mdiArrowLeft } from "@mdi/js";
import { Row } from "./Row";
import { Column } from "./Column";
import { exists } from "./utils";

/** Docs: https://miwi.dev/components/appbar.html */
export function AppBar(
  props: {
    left?: JSX.Element;
    right?: JSX.Element;
    bottom?: JSX.Element;
  } & {
    shouldShowBackArrowWhenApplicable?: boolean;
  } & BoxProps,
) {
  const nav = useNav();
  return (
    <Column widthGrows>
      {/* Notch Spacer */}
      <Box
        widthGrows
        height={`env(safe-area-inset-top)`}
        fill={props.fill ?? $theme.colors.primary}
        zIndex={2}
      />

      {/* AppBar */}
      <Column
        widthGrows
        fill={$theme.colors.primary}
        shadowSize={1.25}
        shadowDirection={$Align.bottomCenter}
        alignBottomCenter
        stroke={$theme.colors.accent}
        zIndex={1}
        overrideProps={props}
      >
        {/* Main Row */}
        <Row widthGrows pad={0.5} scale={1.5}>
          {/* Left */}
          <Row widthGrows alignCenterLeft>
            <Show
              when={
                (props.shouldShowBackArrowWhenApplicable ?? true) &&
                nav.openedPages.value.length > 1 &&
                !exists(props.left)
              }
            >
              <Icon onClick={nav.popPage} scale={1.25} icon={mdiArrowLeft} />
            </Show>
            {props.left}
          </Row>

          {/* Title / Center */}
          <Row widthGrows={3} alignCenter bold>
            {props.children}
          </Row>

          {/* Right */}
          <Row widthGrows alignCenterRight scale={1.25}>
            {props.right}
          </Row>
        </Row>

        {/* Bottom Row */}
        <Row widthGrows scale={1}>
          {props.bottom}
        </Row>
      </Column>
    </Column>
  );
}
