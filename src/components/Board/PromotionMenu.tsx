import type { Square, PieceSymbol } from 'chess.js'

interface Props {
  square: Square
  onChoice: (piece: PieceSymbol) => void
}

const PIECES: { piece: PieceSymbol; label: string }[] = [
  { piece: 'r', label: '♜ Rook' },
  { piece: 'b', label: '♝ Bishop' },
  { piece: 'n', label: '♞ Knight' },
]

const ACCENT = '#c084fc'

export default function PromotionMenu({ square, onChoice }: Props) {
  const col = square.charCodeAt(0) - 97
  const rank = parseInt(square[1])
  const row = 8 - rank

  const isNearBottom = row >= 5
  const leftPct = col * 12.5 + 6.25

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${leftPct}%`,
    transform: 'translateX(-50%)',
    zIndex: 40,
    ...(isNearBottom
      ? { bottom: `${(8 - row) * 12.5}%`, marginBottom: '6px' }
      : { top: `${(row + 1) * 12.5}%`, marginTop: '6px' }),
  }

  return (
    <div style={style}>
      <div style={{
        background: 'rgba(15,20,40,0.96)',
        border: `1px solid ${ACCENT}99`,
        borderRadius: '10px',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${ACCENT}44`,
        minWidth: '100px',
      }}>
        <p style={{
          color: ACCENT,
          fontSize: '10px',
          fontWeight: 700,
          textAlign: 'center',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '2px',
        }}>♟ Promote to</p>
        {PIECES.map(({ piece, label }) => (
          <button
            key={piece}
            onClick={(e) => { e.stopPropagation(); onChoice(piece) }}
            style={{
              background: `${ACCENT}22`,
              border: `1px solid ${ACCENT}66`,
              borderRadius: '7px',
              color: ACCENT,
              fontSize: '12px',
              fontWeight: 700,
              padding: '5px 10px',
              cursor: 'pointer',
              transition: 'background 0.15s',
              textAlign: 'left',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = `${ACCENT}44`)}
            onMouseLeave={e => (e.currentTarget.style.background = `${ACCENT}22`)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
