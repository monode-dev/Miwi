import { prop } from "mufasa";
import { Box, useProp } from "./miwi";

export function CorkBoardPin(props: { children: any, posX?: number, posY?: number }) {
  const posX = useProp(props.posX ?? 0);
  const posY = useProp(props.posY ?? 0);
  return (
    <Box 
      data-corkboard-pin
      cssStyle={{ position: "absolute", left: `${posX}px`, top: `${posY}px` }}
    >
      {props.children}
    </Box>
  );
}