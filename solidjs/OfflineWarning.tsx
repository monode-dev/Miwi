import { signal } from "./utils";
import { Network } from "@capacitor/network";
import { sizeToCss } from "miwi/b-x";
import { pageTransitions } from "@/Nav";
import { Box } from "./miwi-widgets/Box";
import { Row } from "./miwi-widgets/Row";
import { Icon } from "./miwi-widgets/Icon";

export function OfflineWarning() {
  const hasInternet = signal(true);
  Network.getStatus().then((status) => (hasInternet.value = status.connected));
  Network.addListener("networkStatusChange", (status) => {
    hasInternet.value = status.connected;
  });
  const offlineWarningTransitions = pageTransitions.from({
    duration: 0.15,
    y: sizeToCss(4),
    ease: "power1.out",
  });
  return (
    // <Transition
    //   appear
    //   @enter="offlineWarningTransitions.enter"
    //   @leave="offlineWarningTransitions.leave"
    // >
    hasInternet ? undefined : (
      <div
        style={{
          background: `transparent`,
          width: `100%`,
          height: `100%`,
          bottom: 0,
          left: 0,
          position: `absolute`,
          [`pointer-events`]: `none`,
          [`z-index`]: 999999998,
        }}
      >
        <Box width={`100%`} height={`100%`} pad={1} align={$Align.bottomLeft}>
          <Row
            background={$theme.colors.warning}
            textColor={$theme.colors.accent}
            cornerRadius={1}
            shadowDirection={$Align.center}
            shadowSize={2}
            pad={0.5}
          >
            <Icon icon="wifiOff" size={1} />
            Will Sync When Online
          </Row>
        </Box>
      </div>
    )
    // </Transition>
  );
}
