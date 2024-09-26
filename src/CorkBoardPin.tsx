import { Box, Prop } from "./miwi";

export function CorkBoardPin(props: { children: any, posX?: Prop<number>, posY?: Prop<number>}) {
  return (
    <Box
      data-corkboard-pin
      cssStyle={{ position: "absolute", left: `${props.posX?.value}px`, top: `${props.posY?.value}px` }}
    >
      {props.children}
    </Box>
  );
}