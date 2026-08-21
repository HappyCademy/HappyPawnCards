import { PIECE_SETS, usePieceSet, pieceUrl } from '../../context/PieceSetContext'

interface Props {
  onClose: () => void
}

const FONT = "'Nunito', system-ui, sans-serif"

export default function PieceSetPicker({ onClose }: Props) {
  const { pieceSet, setPieceSet } = usePieceSet()

  function handlePick(key: string) {
    setPieceSet(key)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          background: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
          border: '1.5px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '28px 24px',
          maxWidth: '420px',
          width: '92vw',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          fontFamily: FONT,
        }}
      >
        {/* Header */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '14px', right: '18px',
            background: 'none', border: 'none', color: '#475569',
            fontSize: '20px', cursor: 'pointer', lineHeight: 1, padding: '4px',
          }}
        >
          ✕
        </button>
        <h2 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 900, color: '#f1f5f9', letterSpacing: '0.02em' }}>
          Piece Style
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
          Choose how the standard pieces look on the board
        </p>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
        }}>
          {PIECE_SETS.map(set => {
            const isActive = set.key === pieceSet
            return (
              <button
                key={set.key}
                onClick={() => handlePick(set.key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 8px',
                  borderRadius: '14px',
                  border: isActive ? '2px solid #facc15' : '1.5px solid rgba(255,255,255,0.07)',
                  background: isActive ? 'rgba(250,204,21,0.1)' : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: isActive ? '0 0 16px rgba(250,204,21,0.25)' : 'none',
                }}
              >
                {/* Preview: white king + black king side by side */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <img
                    src={pieceUrl(set.key, 'w', 'k')}
                    alt=""
                    width={34}
                    height={34}
                    style={{ objectFit: 'contain', display: 'block' }}
                  />
                  <img
                    src={pieceUrl(set.key, 'b', 'k')}
                    alt=""
                    width={34}
                    height={34}
                    style={{ objectFit: 'contain', display: 'block' }}
                  />
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#facc15' : '#94a3b8',
                  letterSpacing: '0.03em',
                }}>
                  {set.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
