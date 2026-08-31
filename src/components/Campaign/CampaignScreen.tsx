import { useState } from 'react'

const D = 'var(--font-display)'
const B = 'var(--font-body)'

const CHAR_NAMES: Record<string, string> = {
  'happy-pawn': 'Happy Pawn', 'chessbeard': 'Chessbeard', 'black-king': 'Black King',
  'general-gambit': 'General Gambit', 'kings-guard': "King's Guard", 'puzzle-pete': 'Puzzle Pete',
  'crystal-queen': 'Crystal Queen', 'unipop': 'Unipop', 'robin-rook': 'Robin Rook',
}

const CHAR_PIECE_IMAGES: Record<string, string> = {
  'happy-pawn':     '/images/characters/happy-pawn/basic-topdown.png',
  'chessbeard':     '/images/characters/chessbeard/basic-topdown.png',
  'black-king':     '/images/characters/black-king/basic-topdown.png',
  'general-gambit': '/images/characters/general-gambit/basic-topdown.png',
  'kings-guard':    '/images/characters/kings-guard/basic-topdown.png',
  'puzzle-pete':    '/images/characters/puzzle-pete/basic-topdown.png',
  'crystal-queen':  '/images/characters/crystal-queen/basic-topdown.png',
  'unipop':         '/images/characters/unipop/basic-topdown.png',
  'robin-rook':     '/images/characters/robin-rook/basic-topdown.png',
}

export const CAMPAIGN_CHARS = [
  'happy-pawn', 'chessbeard', 'general-gambit', 'unipop',
  'robin-rook', 'crystal-queen', 'puzzle-pete', 'kings-guard', 'black-king',
  'finale',
]

type CampaignChapter = 1 | 2 | 3

const CHAPTER_META: Record<CampaignChapter, { label: string; icon: string; accentColor: string; accentGlow: string }> = {
  1: { label: 'Standard',  icon: '♟',  accentColor: 'rgba(201,162,39,1)',   accentGlow: 'rgba(201,162,39,0.5)'  },
  2: { label: 'Legendary', icon: '👑', accentColor: 'rgba(192,132,252,1)',  accentGlow: 'rgba(192,132,252,0.5)' },
  3: { label: 'Space',     icon: '🚀', accentColor: 'rgba(167,139,250,1)',  accentGlow: 'rgba(167,139,250,0.5)' },
}

// Reference coordinate space for the map
const MAP_W = 340
const MAP_H = 730

// Node centers: index 0 = first fight (bottom), index 9 = finale (top)
const NODE_XY: [number, number][] = [
  [170, 696],  // 0 happy-pawn   (center)
  [ 70, 620],  // 1 chessbeard   (left)
  [270, 544],  // 2 general-gambit (right)
  [ 70, 468],  // 3 unipop       (left)
  [270, 392],  // 4 robin-rook   (right)
  [ 70, 316],  // 5 crystal-queen (left)
  [270, 240],  // 6 puzzle-pete  (right)
  [ 70, 164],  // 7 kings-guard  (left)
  [270,  88],  // 8 black-king   (right)
  [170,  36],  // 9 finale       (center, epic boss)
]

const PATH_POINTS = NODE_XY.map(([x, y]) => `${x},${y}`).join(' ')

interface Props {
  progress: { ch1: number; ch2: number; ch3: number }
  coins: number
  onSelectOpponent: (chapter: CampaignChapter, idx: number) => void
  onBack: () => void
  onShop: () => void
}

export default function CampaignScreen({ progress, coins, onSelectOpponent, onBack, onShop }: Props) {
  const [activeChapter, setActiveChapter] = useState<CampaignChapter>(1)

  const ch2Locked = progress.ch1 < 9
  const ch3Locked = progress.ch2 < 9
  const rawProgress = progress[`ch${activeChapter}` as 'ch1' | 'ch2' | 'ch3']
  // progress counts regular nodes (0-8) + finale (9). Show regular count capped at 9 for display.
  const chProgress = rawProgress
  const meta = CHAPTER_META[activeChapter]

  const defeatedPath = chProgress > 0
    ? NODE_XY.slice(0, Math.min(chProgress + 1, NODE_XY.length)).map(([x, y]) => `${x},${y}`).join(' ')
    : ''

  return (
    <div className="screen-bg min-h-screen flex flex-col items-center py-6 px-4">
      {/* Header */}
      <header style={{ width: '100%', maxWidth: `${MAP_W}px`, marginBottom: '12px', position: 'relative', textAlign: 'center' }}>
        <button
          onClick={onBack}
          style={{
            position: 'absolute', left: 0, top: '2px',
            fontFamily: B, color: 'var(--ivory-dim)', fontSize: '13px', fontWeight: 600,
            background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.04em',
            padding: '4px 8px', transition: 'color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory-dim)' }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img
            src="/images/logo.svg"
            alt="Happy Pawn Cards"
            style={{ height: 'clamp(40px, 8vw, 60px)', filter: 'drop-shadow(0 2px 12px rgba(201,162,39,0.45))' }}
          />
        </div>
        <p style={{ fontFamily: B, color: 'var(--ivory-dim)', fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: '6px' }}>
          Campaign
        </p>

        {/* Coins + Shop */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)',
            borderRadius: '20px', padding: '4px 12px',
          }}>
            <span style={{ fontSize: '12px' }}>🪙</span>
            <span style={{ fontFamily: D, fontSize: '13px', fontWeight: 700, color: 'var(--gold)' }}>{coins.toLocaleString()}</span>
          </div>
          <button
            onClick={onShop}
            style={{
              fontFamily: B, fontSize: '10px', fontWeight: 700,
              padding: '4px 12px', borderRadius: '20px',
              background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.25)',
              color: 'rgba(201,162,39,0.7)', cursor: 'pointer',
              letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = 'var(--gold)'; el.style.borderColor = 'rgba(201,162,39,0.5)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.color = 'rgba(201,162,39,0.7)'; el.style.borderColor = 'rgba(201,162,39,0.25)' }}
          >
            🛍 Shop
          </button>
        </div>

        {/* Chapter tabs */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '10px' }}>
          {([1, 2, 3] as CampaignChapter[]).map(ch => {
            const m = CHAPTER_META[ch]
            const isActive = activeChapter === ch
            const isLocked = (ch === 2 && ch2Locked) || (ch === 3 && ch3Locked)
            return (
              <button
                key={ch}
                onClick={() => !isLocked && setActiveChapter(ch)}
                disabled={isLocked}
                style={{
                  fontFamily: B, fontSize: '10px', fontWeight: 700,
                  padding: '5px 10px', borderRadius: '20px',
                  background: isActive ? 'rgba(201,162,39,0.12)' : 'rgba(13,10,26,0.6)',
                  border: `1.5px solid ${isActive ? m.accentColor : isLocked ? 'rgba(138,117,96,0.12)' : 'rgba(138,117,96,0.22)'}`,
                  color: isActive ? m.accentColor : isLocked ? 'rgba(138,117,96,0.3)' : 'rgba(138,117,96,0.6)',
                  cursor: isLocked ? 'default' : 'pointer',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <span>{isLocked ? '🔒' : m.icon}</span>
                <span>{m.label}</span>
              </button>
            )
          })}
        </div>

        <p style={{ fontFamily: D, color: meta.accentColor, fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', marginTop: '8px' }}>
          {chProgress >= 10
            ? '★ Chapter Complete ★'
            : chProgress === 9
              ? '⚡ 9 / 9 — The Final Battle Awaits'
              : `${chProgress} / 9 Defeated`}
        </p>
      </header>

      {/* Map */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: `${MAP_W}px`,
        height: `${MAP_H}px`,
        flexShrink: 0,
      }}>
        {/* SVG path layer */}
        <svg
          width="100%" height="100%"
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          preserveAspectRatio="xMidYMid meet"
        >
          <polyline
            points={PATH_POINTS}
            fill="none"
            stroke="rgba(201,162,39,0.15)"
            strokeWidth="4"
            strokeDasharray="8 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {defeatedPath && (
            <polyline
              points={defeatedPath}
              fill="none"
              stroke={meta.accentGlow.replace('0.5', '0.65')}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* Nodes */}
        {CAMPAIGN_CHARS.map((charId, i) => {
          const [nx, ny] = NODE_XY[i]
          const nodeState: 'defeated' | 'available' | 'locked' =
            i < chProgress ? 'defeated' : i === chProgress ? 'available' : 'locked'
          const pieceImg = CHAR_PIECE_IMAGES[charId]
          const isAvailable = nodeState === 'available'
          const isDefeated = nodeState === 'defeated'
          const isLocked = nodeState === 'locked'
          const accent = meta.accentColor
          const accentGlow = meta.accentGlow
          const isFinale = charId === 'finale'

          // ── Finale node: special styling ─────────────────────────────────
          if (isFinale) {
            const finaleAccent = isDefeated ? 'rgba(201,162,39,1)' : isAvailable ? 'rgba(220,60,60,1)' : 'rgba(80,30,30,0.6)'
            const finaleGlow = isDefeated ? 'rgba(201,162,39,0.5)' : isAvailable ? 'rgba(220,60,60,0.5)' : 'transparent'
            return (
              <div key="finale" style={{
                position: 'absolute',
                left: `${(nx / MAP_W) * 100}%`,
                top: `${(ny / MAP_H) * 100}%`,
                transform: 'translate(-50%, -50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
              }}>
                <button
                  onClick={() => !isLocked && onSelectOpponent(activeChapter, i)}
                  disabled={isLocked}
                  style={{
                    width: '86px', height: '86px', borderRadius: '50%',
                    background: isDefeated
                      ? 'radial-gradient(circle, rgba(201,162,39,0.2) 0%, rgba(13,10,26,0.9) 100%)'
                      : isAvailable
                        ? 'radial-gradient(circle, rgba(80,10,10,0.7) 0%, rgba(30,5,5,0.97) 100%)'
                        : 'rgba(13,5,5,0.8)',
                    border: `3px solid ${finaleAccent}`,
                    cursor: isLocked ? 'default' : 'pointer',
                    opacity: isLocked ? 0.3 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                    position: 'relative', overflow: 'visible', padding: 0,
                    animation: isAvailable ? 'red-pulse 1.8s ease-in-out infinite' : 'none',
                    boxShadow: isAvailable
                      ? `0 0 32px rgba(220,60,60,0.7), 0 0 60px rgba(220,60,60,0.3)`
                      : isDefeated ? `0 0 16px rgba(201,162,39,0.4)` : 'none',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (isLocked) return
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.transform = 'scale(1.1)'
                    el.style.boxShadow = `0 0 48px ${finaleGlow}, 0 0 80px ${finaleGlow.replace('0.5', '0.2')}`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.transform = 'scale(1)'
                    el.style.boxShadow = isAvailable
                      ? `0 0 32px rgba(220,60,60,0.7), 0 0 60px rgba(220,60,60,0.3)`
                      : isDefeated ? `0 0 16px rgba(201,162,39,0.4)` : 'none'
                  }}
                >
                  {isDefeated ? (
                    <span style={{ fontSize: '30px' }}>👑</span>
                  ) : isLocked ? (
                    <span style={{ fontSize: '22px' }}>🔒</span>
                  ) : (
                    <>
                      <span style={{ fontSize: '22px', lineHeight: 1 }}>👑</span>
                      <span style={{ fontSize: '8px', fontFamily: D, color: 'rgba(220,60,60,0.9)', letterSpacing: '0.05em', marginTop: '2px' }}>×3</span>
                    </>
                  )}
                  {isDefeated && (
                    <div style={{
                      position: 'absolute', top: '-6px', right: '-6px',
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', boxShadow: `0 0 8px ${accentGlow}`,
                    }}>✓</div>
                  )}
                </button>
                <span style={{
                  fontFamily: D, fontSize: '9px', fontWeight: 800,
                  color: isDefeated ? 'rgba(201,162,39,0.8)' : isAvailable ? 'rgba(220,60,60,0.9)' : 'rgba(80,30,30,0.5)',
                  letterSpacing: '0.08em', textAlign: 'center', textTransform: 'uppercase',
                }}>
                  Final Battle
                </span>
              </div>
            )
          }

          // ── Regular node ─────────────────────────────────────────────────
          return (
            <div
              key={charId}
              style={{
                position: 'absolute',
                left: `${(nx / MAP_W) * 100}%`,
                top: `${(ny / MAP_H) * 100}%`,
                transform: 'translate(-50%, -50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              }}
            >
              <button
                onClick={() => !isLocked && onSelectOpponent(activeChapter, i)}
                disabled={isLocked}
                style={{
                  width: '74px', height: '74px',
                  borderRadius: '50%',
                  background: isDefeated
                    ? `radial-gradient(circle, ${accentGlow.replace('0.5', '0.2')} 0%, rgba(13,10,26,0.9) 100%)`
                    : isAvailable
                      ? `radial-gradient(circle, ${accentGlow.replace('0.5', '0.15')} 0%, rgba(13,10,26,0.95) 100%)`
                      : 'rgba(13,10,26,0.8)',
                  border: isDefeated
                    ? `2.5px solid ${accentGlow.replace('0.5', '0.8')}`
                    : isAvailable
                      ? `2.5px solid ${accentGlow.replace('0.5', '0.6')}`
                      : '2px solid rgba(138,117,96,0.2)',
                  cursor: isLocked ? 'default' : 'pointer',
                  opacity: isLocked ? 0.35 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'visible', padding: 0,
                  animation: isAvailable ? 'gold-pulse 2.4s ease-in-out infinite' : 'none',
                  boxShadow: isDefeated ? `0 0 14px ${accentGlow.replace('0.5', '0.3')}` : 'none',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  if (isLocked) return
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.transform = 'scale(1.12)'
                  el.style.boxShadow = `0 0 24px ${accentGlow}`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.transform = 'scale(1)'
                  el.style.boxShadow = isDefeated ? `0 0 14px ${accentGlow.replace('0.5', '0.3')}` : 'none'
                }}
              >
                {pieceImg && (
                  <img
                    src={pieceImg}
                    alt={CHAR_NAMES[charId]}
                    draggable={false}
                    style={{
                      width: '64px', height: '64px', objectFit: 'contain',
                      filter: isLocked ? 'grayscale(1) brightness(0.4)' : isDefeated ? 'brightness(0.8)' : 'none',
                    }}
                  />
                )}
                {isLocked && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                  }}>
                    🔒
                  </div>
                )}
                {isDefeated && (
                  <div style={{
                    position: 'absolute', top: '-6px', right: '-6px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', boxShadow: `0 0 8px ${accentGlow}`,
                  }}>
                    ✓
                  </div>
                )}
                {!isDefeated && (
                  <div style={{
                    position: 'absolute', bottom: '-4px', left: '-4px',
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: isAvailable ? accentGlow.replace('0.5', '0.9') : 'rgba(40,34,60,0.9)',
                    border: `1px solid ${isAvailable ? accentGlow.replace('0.5', '0.6') : 'rgba(138,117,96,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '9px', fontWeight: 700,
                    color: isAvailable ? '#0d0a1a' : 'rgba(138,117,96,0.5)',
                    fontFamily: B,
                  }}>
                    {i + 1}
                  </div>
                )}
              </button>

              <span style={{
                fontFamily: B, fontSize: '9px',
                fontWeight: isAvailable ? 700 : 600,
                color: isDefeated
                  ? accentGlow.replace('0.5', '0.7')
                  : isAvailable
                    ? 'var(--ivory)'
                    : 'rgba(138,117,96,0.4)',
                letterSpacing: '0.03em', textAlign: 'center',
                whiteSpace: 'nowrap', maxWidth: '80px', lineHeight: 1.2,
                textTransform: 'uppercase',
              }}>
                {CHAR_NAMES[charId]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Bottom hint */}
      {chProgress < 9 ? (
        <p style={{
          fontFamily: B, fontSize: '11px', color: 'rgba(138,117,96,0.5)',
          textAlign: 'center', marginTop: '12px', letterSpacing: '0.04em', maxWidth: '260px',
        }}>
          Defeat each champion to advance
        </p>
      ) : chProgress === 9 ? (
        <p style={{
          fontFamily: D, fontSize: '12px', color: 'rgba(220,60,60,0.85)',
          textAlign: 'center', marginTop: '12px', letterSpacing: '0.06em', maxWidth: '280px',
        }}>
          The villains await — face them together or fall alone
        </p>
      ) : (
        <p style={{
          fontFamily: D, fontSize: '13px', color: meta.accentColor,
          textAlign: 'center', marginTop: '12px', letterSpacing: '0.08em',
        }}>
          {activeChapter < 3 ? `Chapter ${activeChapter} complete — next chapter unlocked!` : 'All chapters defeated!'}
        </p>
      )}
    </div>
  )
}
