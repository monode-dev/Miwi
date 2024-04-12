import { muToCss } from "./Box/BoxUtils";
import { createSignal } from "solid-js";
import { strokeMaterial } from "./Theme";

export function CircularProgressIndicator(props: {
  diameter?: number | string;
  thickness?: number | string;
  color?: string;
}) {
  const diameterMu = props.diameter ?? 4;
  const diameterPx = muToCss(diameterMu);
  const thicknessPx = muToCss(
    props.thickness ?? (typeof diameterMu === `number` ? diameterMu / 8 : diameterMu),
  );
  const color = props.color ?? strokeMaterial;
  const speed = 2.5; // Degrees per frame
  // A state for rotation angle
  const [angle, setAngle] = createSignal(0);

  // Use setInterval to update the rotation angle
  setInterval(() => {
    setAngle(prev => (prev + speed) % 360);
  }, 10); // Change 10 to control the speed
  return (
    <div
      style={{
        position: `relative`,
        "box-sizing": "border-box",
        width: diameterPx,
        height: diameterPx,
      }}
    >
      <div
        style={{
          position: `absolute`,
          "box-sizing": "border-box",
          width: `100%`,
          height: `100%`,
          "border-radius": "50%",
          border: `${thicknessPx} solid transparent`,
          "border-top-color": color,
          transform: `rotate(${angle()}deg)`,
          animation: "spin 1s linear infinite",
        }}
      ></div>
      <div
        style={{
          position: `absolute`,
          "box-sizing": "border-box",
          width: `100%`,
          height: `100%`,
          "border-radius": "50%",
          border: `${thicknessPx} solid transparent`,
          "border-top-color": color,
          transform: `rotate(${angle() + 180}deg)`,
          animation: "spin 1s linear infinite",
        }}
      ></div>
    </div>
  );
}
