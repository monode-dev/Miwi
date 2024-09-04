import { Prop, useFormula, useProp } from "./utils";
import { Box } from "./Box/Box";
import { Row } from "./Row";
import { Stack } from "./Stack";
import { theme } from "./Theme";

export function Slider(props: {
  value: Prop<number>;
  min: number;
  max: number;
  step?: number;
  color?: string;
}) {
  const thumbHeight = 1;
  const trackHeight = 0.5;
  const isDragging = useProp(false);
  let slider: HTMLElement | undefined = undefined;

  function updateValue(clientX: number) {
    const rect = slider!.getBoundingClientRect();
    let newValue = ((clientX - rect.left) / rect.width) * (props.max - props.min) + props.min;
    const step = props.step ? props.step * 0.01 : 0.01;
    newValue = Math.round(newValue / step) * step;

    const clampedValue = Math.max(props.min, Math.min(props.max, newValue));
    props.value.value = clampedValue;
  }

  function startDrag(event: MouseEvent | TouchEvent) {
    isDragging.value = true;
    document.addEventListener("mousemove", doDrag);
    document.addEventListener("touchmove", doDrag);
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchend", stopDrag);
    updateValue("touches" in event ? event.touches[0]!.clientX : event.clientX);
  }

  function doDrag(event: MouseEvent | TouchEvent) {
    if (!isDragging.value) return;
    updateValue("touches" in event ? event.touches[0]!.clientX : event.clientX);
  }

  function stopDrag() {
    isDragging.value = false;
    document.removeEventListener("mousemove", doDrag);
    document.removeEventListener("touchmove", doDrag);
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchend", stopDrag);
  }

  const color = useFormula(() => props.color ?? theme.palette.primary);

  return (
    <Box ref={slider}>
      <Stack alignCenterLeft widthGrows height={thumbHeight}>
        {/* Track Background */}
        <Box widthGrows height={trackHeight} cornerRadius={0.25} fill={$theme.colors.lightHint} />

        {/* Track Foreground */}
        <Row widthGrows heightGrows padBetween={0} alignCenterLeft preventClickPropagation={true}>
          {/* Filled part of track */}
          <Box
            width={`${Math.min(
              100,
              Math.max(0, 100 * ((props.value.value - props.min) / (props.max - props.min))),
            )}%`}
            height={trackHeight}
            cornerRadius={0.25}
            fill={color.value}
          />

          {/* Handle */}
          <Box width={0} height={0} overflowX={$Overflow.spill} overflowY={$Overflow.spill}>
            <Box
              onMouseDown={startDrag}
              onTouchStart={startDrag}
              width={thumbHeight}
              height={thumbHeight}
              cornerRadius={thumbHeight / 2}
              fill={color.value}
              preventClickPropagation={true}
              touchRadius={0.5}
            />
          </Box>
        </Row>
      </Stack>
    </Box>
  );
}
