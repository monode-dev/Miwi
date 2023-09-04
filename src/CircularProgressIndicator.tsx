import { sizeToCss } from './b-x/BoxSize'
import { createSignal } from 'solid-js'

export function CircularProgressIndicator(props: {
  diameter?: number | string
  thickness?: number | string
  color?: string
}) {
  const diameterPx = sizeToCss(props.diameter ?? 4)
  const thicknessPx = sizeToCss(props.thickness ?? 0.5)
  const color = props.color ?? $theme.colors.sameAsText
  const speed = 2.5 // Degrees per frame
  // A state for rotation angle
  const [angle, setAngle] = createSignal(0)

  // Use setInterval to update the rotation angle
  setInterval(() => {
    setAngle(prev => (prev + speed) % 360)
  }, 10) // Change 10 to control the speed
  return (
    <div
      style={{
        position: `relative`,
        'box-sizing': 'border-box',
        width: diameterPx,
        height: diameterPx,
      }}
    >
      <div
        style={{
          position: `absolute`,
          'box-sizing': 'border-box',
          width: `100%`,
          height: `100%`,
          'border-radius': '50%',
          border: `${thicknessPx} solid transparent`,
          'border-top-color': color,
          transform: `rotate(${angle()}deg)`,
          animation: 'spin 1s linear infinite',
        }}
      ></div>
      <div
        style={{
          position: `absolute`,
          'box-sizing': 'border-box',
          width: `100%`,
          height: `100%`,
          'border-radius': '50%',
          border: `${thicknessPx} solid transparent`,
          'border-top-color': color,
          transform: `rotate(${angle() + 180}deg)`,
          animation: 'spin 1s linear infinite',
        }}
      ></div>
    </div>
  )
}
