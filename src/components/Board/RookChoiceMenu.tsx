import type { Square } from 'chess.js'

interface Props {
  square: Square
  onChoice: (mode: 'move' | 'shoot') => void
  onClose: () => void
}

export default function RookChoiceMenu({ square, onChoice, onClose }: Props) {
  const col = square.charCodeAt(0) - 97
  const rank = parseInt(square[1])
  const row = 8 - rank   // 0 = top (rank 8)

  // Position popup below the rook; flip above if in bottom 3 rows
  const isNearBottom = row >= 5
  const leftPct = col * 12.5 + 6.25   // centre of square

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
    <>
      {/* Backdrop — clicking it closes the menu */}
      <div
        style={{ position: 'absolute', inset: 0, zIndex: 39 }}
        onClick={onClose}
      />
      <div style={style}>
        <div
          style={{
            background: 'rgba(15,20,40,0.96)',
            border: '1px solid rgba(251,146,60,0.6)',
            borderRadius: '10px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(251,146,60,0.3)',
            minWidth: '90px',
          }}
        >
          <p
            style={{
              color: '#fb923c',
              fontSize: '10px',
              fontWeight: 700,
              textAlign: 'center',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '2px',
            }}
          >
            🏹 Robin Rook
          </p>
          <MenuBtn label="Move" color="#60a5fa" onClick={() => onChoice('move')} />
          <MenuBtn label="Shoot" color="#f97316" onClick={() => onChoice('shoot')} />
        </div>
      </div>
    </>
  )
}

function MenuBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      style={{
        background: `${color}22`,
        border: `1px solid ${color}66`,
        borderRadius: '7px',
        color,
        fontSize: '12px',
        fontWeight: 700,
        padding: '5px 10px',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = `${color}44`)}
      onMouseLeave={e => (e.currentTarget.style.background = `${color}22`)}
    >
      {label}
    </button>
  )
}
