import { ReadonlyProp } from "./utils";
import { pageTransitions } from "./Nav";
import { Box } from "./Box/Box";
import { Row } from "./Row";
import { Icon } from "./Icon";
import { mdiWifiOff } from "@mdi/js";
import { muToCss } from "./Box/BoxUtils";

export function OfflineWarning(props: { isOnlineSig: ReadonlyProp<boolean> }) {
  const offlineWarningTransitions = pageTransitions.from({
    duration: 0.15,
    y: muToCss(4),
    ease: "power1.out",
  });
  return (
    // <Transition
    //   appear
    //   @enter="offlineWarningTransitions.enter"
    //   @leave="offlineWarningTransitions.leave"
    // >
    props.isOnlineSig.value ? undefined : (
      <div
        style={{
          fill: `transparent`,
          width: `100%`,
          height: `100%`,
          bottom: 0,
          left: 0,
          position: `absolute`,
          [`pointer-events`]: `none`,
          [`z-index`]: 999999998,
        }}
      >
        <Box asWideAsParent asTallAsParent pad={1} alignBottomLeft>
          <Row
            fill={$theme.colors.accent}
            stroke={$theme.colors.warning}
            cornerRadius={1}
            shadowDirection={$Align.center}
            shadowSize={2}
            pad={0.5}
          >
            <Icon iconPath={mdiWifiOff} scale={1} />
            Will Sync When Online
          </Row>
        </Box>
      </div>
    )
    // </Transition>
  );
}
