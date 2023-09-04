import { Sig, sig } from './utils'
import { Box, BoxProps, grow } from './Box'
import { Row } from './Row'

export function Slider(
  props: {
    valueSig: Sig<number>
    min: number
    max: number
  } & BoxProps,
) {
  const thumbHeight = 1
  const trackHeight = 0.5
  let isDragging = sig(false)
  let slider: HTMLElement | undefined = undefined

  function updateValue(clientX: number) {
    const rect = slider!.getBoundingClientRect()
    const newValue = ((clientX - rect.left) / rect.width) * (props.max - props.min) + props.min
    const clampedValue = Math.max(props.min, Math.min(props.max, newValue))
    props.valueSig.value = clampedValue
  }

  function startDrag(event: MouseEvent | TouchEvent) {
    isDragging.value = true
    document.addEventListener('mousemove', doDrag)
    document.addEventListener('touchmove', doDrag)
    document.addEventListener('mouseup', stopDrag)
    document.addEventListener('touchend', stopDrag)
    updateValue('touches' in event ? event.touches[0]!.clientX : event.clientX)
  }

  function doDrag(event: MouseEvent | TouchEvent) {
    if (!isDragging.value) return
    updateValue('touches' in event ? event.touches[0]!.clientX : event.clientX)
  }

  function stopDrag() {
    isDragging.value = false
    document.removeEventListener('mousemove', doDrag)
    document.removeEventListener('touchmove', doDrag)
    document.removeEventListener('mouseup', stopDrag)
    document.removeEventListener('touchend', stopDrag)
  }

  return (
    <div ref={slider}>
      <Box width={grow(1)} height={thumbHeight} align={$Align.centerLeft} axis={$Axis.stack}>
        <Box
          width={grow(1)}
          height={trackHeight}
          cornerRadius={0.25}
          background={$theme.colors.lightHint}
        />
        <Row width={grow(1)} height={grow(1)} align={$Align.centerLeft}>
          <Box
            width={`${Math.min(
              100,
              Math.max(0, 100 * ((props.valueSig.value - props.min) / (props.max - props.min))),
            )}%`}
            height={trackHeight}
            cornerRadius={0.25}
            background={$theme.colors.primary}
          />
          <Box
            width={0}
            height={0}
            overflowX={$Overflow.forceStretchParent}
            overflowY={$Overflow.forceStretchParent}
          >
            <Box
              onMouseDown={startDrag}
              onTouchStart={startDrag}
              width={thumbHeight}
              height={thumbHeight}
              cornerRadius={thumbHeight / 2}
              background={$theme.colors.primary}
            />
          </Box>
        </Row>
      </Box>
    </div>
  )
}
