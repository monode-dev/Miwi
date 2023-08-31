import { signal } from "./utils";
import { Box, grow } from "./Box";
import { Row } from "./Row";
export function Slider(props) {
    const thumbHeight = 1;
    const trackHeight = 0.5;
    let isDragging = signal(false);
    let slider = undefined;
    function updateValue(clientX) {
        const rect = slider.getBoundingClientRect();
        const newValue = ((clientX - rect.left) / rect.width) * (props.max - props.min) +
            props.min;
        const clampedValue = Math.max(props.min, Math.min(props.max, newValue));
        props.value.value = clampedValue;
    }
    function startDrag(event) {
        isDragging.value = true;
        document.addEventListener("mousemove", doDrag);
        document.addEventListener("touchmove", doDrag);
        document.addEventListener("mouseup", stopDrag);
        document.addEventListener("touchend", stopDrag);
        updateValue("touches" in event ? event.touches[0].clientX : event.clientX);
    }
    function doDrag(event) {
        if (!isDragging.value)
            return;
        updateValue("touches" in event ? event.touches[0].clientX : event.clientX);
    }
    function stopDrag() {
        isDragging.value = false;
        document.removeEventListener("mousemove", doDrag);
        document.removeEventListener("touchmove", doDrag);
        document.removeEventListener("mouseup", stopDrag);
        document.removeEventListener("touchend", stopDrag);
    }
    return (<div ref={slider}>
      <Box width={grow(1)} height={thumbHeight} align={$Align.centerLeft} axis={$Axis.stack}>
        <Box width={grow(1)} height={trackHeight} cornerRadius={0.25} background={$theme.colors.lightHint}/>
        <Row width={grow(1)} height={grow(1)} align={$Align.centerLeft}>
          <Box width={`${Math.min(100, Math.max(0, 100 *
            ((props.value.value - props.min) / (props.max - props.min))))}%`} height={trackHeight} cornerRadius={0.25} background={$theme.colors.primary}/>
          <Box width={0} height={0} overflowX={$Overflow.forceStretchParent} overflowY={$Overflow.forceStretchParent}>
            <Box onMouseDown={startDrag} onTouchStart={startDrag} width={thumbHeight} height={thumbHeight} cornerRadius={thumbHeight / 2} background={$theme.colors.primary}/>
          </Box>
        </Row>
      </Box>
    </div>);
}
