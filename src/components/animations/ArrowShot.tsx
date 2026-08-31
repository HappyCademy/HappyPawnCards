import type { Square } from 'chess.js'

interface Props { from: Square; to: Square }

function squareCenter(sq: Square): { x: number; y: number } {
  const col = sq.charCodeAt(0) - 97
  const rank = parseInt(sq[1])
  const row = 8 - rank
  return { x: (col + 0.5) * 12.5, y: (row + 0.5) * 12.5 }
}

export default function ArrowShot({ from, to }: Props) {
  const s = squareCenter(from)
  const d = squareCenter(to)
  const cx = (s.x + d.x) / 2
  const cy = (s.y + d.y) / 2
  const dx = d.x - s.x
  const dy = d.y - s.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  // Arrow image points LEFT. atan2(dy,dx) gives the target angle (0=right in SVG space).
  // Rotate by (angleDeg - 180) so the tip aims at the target square.
  const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI)
  const rotate = angleDeg - 180

  const h = 5  // arrow height in SVG units (each square = 12.5 units)

  return (
    <svg
      viewBox="0 0 100 100"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 25,
        overflow: 'visible',
      }}
    >
      <image
        href="/images/arrow.png"
        x={cx - dist / 2}
        y={cy - h / 2}
        width={dist}
        height={h}
        transform={`rotate(${rotate}, ${cx}, ${cy})`}
        style={{ animation: 'arrow-fly 750ms ease-out forwards' }}
        opacity="0"
      />
    </svg>
  )
}
