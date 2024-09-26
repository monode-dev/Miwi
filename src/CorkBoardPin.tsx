import { Box, Prop } from "./miwi";

export function CorkBoardPin(props: { children: any, obj:{x: number, y: number}}) {
  return (
    <Box
      data-corkboard-pin
      cssStyle={{ position: "absolute", left: `${props.obj.x}px`, top: `${props.obj.y}px` }}
    >
      {props.children}
    </Box>
  );
}