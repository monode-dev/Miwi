import { Signal, signal } from './utils'
import { sizeToCss } from './b-x/b-x'
import { pageTransitions } from './Nav'
import { Box } from './Box'
import { Row } from './Row'
import { Icon } from './Icon'
import { mdiWifiOff } from '@mdi/js'

export function OfflineWarning(props: { isOnline: Signal<boolean> }) {
  const offlineWarningTransitions = pageTransitions.from({
    duration: 0.15,
    y: sizeToCss(4),
    ease: 'power1.out',
  })
  return (
    // <Transition
    //   appear
    //   @enter="offlineWarningTransitions.enter"
    //   @leave="offlineWarningTransitions.leave"
    // >
    props.isOnline.value ? undefined : (
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
            <Icon iconPath={mdiWifiOff} size={1} />
            Will Sync When Online
          </Row>
        </Box>
      </div>
    )
    // </Transition>
  )
}
