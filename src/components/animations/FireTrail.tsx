import type { Square } from 'chess.js'

interface Props {
  squares: Square[]
}

function squareToPercent(sq: Square): { left: string; top: string } {
  const col = sq.charCodeAt(0) - 97       // 0-7 left→right
  const rank = parseInt(sq[1])             // 1-8
  const row = 8 - rank                     // 0=top(rank8) … 7=bottom(rank1)
  return {
    left: `${col * 12.5 + 6.25}%`,
    top: `${row * 12.5 + 6.25}%`,
  }
}

export default function FireTrail({ squares }: Props) {
  if (squares.length === 0) return null

  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none', zIndex: 20,
      }}
    >
      {squares.map((sq, i) => {
        const { left, top } = squareToPercent(sq)
        return (
          <span
            key={sq}
            style={{
              position: 'absolute',
              left,
              top,
              transform: 'translate(-50%, -50%)',
              fontSize: 'clamp(18px, 3.5vw, 36px)',
              animation: `fire-burst 900ms ease-out ${i * 150}ms both`,
              display: 'inline-block',
              lineHeight: 1,
            }}
          >
            🔥
          </span>
        )
      })}
    </div>
  )
}
