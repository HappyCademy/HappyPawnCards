import { useState } from 'react'

const D = "'Cinzel', Georgia, serif"
const B = "'Nunito', system-ui, sans-serif"

interface Props {
  gameId: string
  onCancel: () => void
}

export default function OnlineLobbyScreen({ gameId, onCancel }: Props) {
  const [copied, setCopied] = useState(false)
  const gameUrl = `${window.location.origin}/?join=${gameId}`

  function copyLink() {
    navigator.clipboard.writeText(gameUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="screen-bg min-h-screen flex flex-col items-center justify-center py-12 px-4"
    >
      <div style={{
        background: 'var(--glass-bg)',
        border: '1.5px solid rgba(201,162,39,0.3)',
        borderRadius: '24px',
        padding: '40px 32px',
        maxWidth: '440px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        backdropFilter: 'blur(14px)',
      }}>
        {/* Spinner */}
        <div style={{ position: 'relative', width: '64px', height: '64px' }}>
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '50%',
            border: '3px solid rgba(201,162,39,0.15)',
            borderTopColor: 'var(--gold)',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '24px', lineHeight: 1,
          }}>
            🌐
          </span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontFamily: D, color: 'var(--ivory)',
            fontSize: '20px', fontWeight: 700,
            margin: '0 0 8px', letterSpacing: '0.04em',
          }}>
            Waiting for opponent...
          </h2>
          <p style={{ fontFamily: B, color: 'var(--ivory-dim)', fontSize: '13px', margin: 0 }}>
            Share this link with your friend to start the game
          </p>
        </div>

        {/* Link box */}
        <div style={{
          width: '100%',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(201,162,39,0.25)',
          borderRadius: '12px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{
            fontFamily: B, fontSize: '12px',
            color: 'rgba(201,162,39,0.8)',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {gameUrl}
          </span>
          <button
            onClick={copyLink}
            style={{
              flexShrink: 0,
              fontFamily: D, fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: copied ? '#4caf50' : 'var(--gold)',
              background: copied ? 'rgba(76,175,80,0.12)' : 'rgba(201,162,39,0.12)',
              border: `1px solid ${copied ? 'rgba(76,175,80,0.4)' : 'rgba(201,162,39,0.3)'}`,
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        <p style={{ fontFamily: B, fontSize: '11px', color: 'rgba(138,117,96,0.5)', margin: 0, textAlign: 'center' }}>
          Game ID: {gameId}
        </p>

        <button
          onClick={onCancel}
          style={{
            fontFamily: B, fontSize: '13px', fontWeight: 500,
            color: 'rgba(138,117,96,0.5)',
            background: 'none', border: 'none',
            cursor: 'pointer', padding: '4px 16px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory-dim)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(138,117,96,0.5)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
