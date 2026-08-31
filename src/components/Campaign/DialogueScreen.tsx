import { useState, useEffect } from 'react'
import { CAMPAIGN_DIALOGUE, type CampaignChapter } from '../../data/dialogue'

const D = 'var(--font-display)'
const B = 'var(--font-body)'

const CHAR_NAMES: Record<string, string> = {
  'happy-pawn': 'Happy Pawn', 'chessbeard': 'Chessbeard', 'black-king': 'Black King',
  'general-gambit': 'General Gambit', 'kings-guard': "King's Guard", 'puzzle-pete': 'Puzzle Pete',
  'crystal-queen': 'Crystal Queen', 'unipop': 'Unipop', 'robin-rook': 'Robin Rook',
}

const BASIC_FULLBODY: Record<string, string> = {
  'happy-pawn':     '/images/characters/happy-pawn/basic-fullbody.png',
  'chessbeard':     '/images/characters/chessbeard/basic-fullbody.png',
  'black-king':     '/images/characters/black-king/basic-fullbody.png',
  'general-gambit': '/images/characters/general-gambit/basic-fullbody.png',
  'kings-guard':    '/images/characters/kings-guard/basic-fullbody.png',
  'puzzle-pete':    '/images/characters/puzzle-pete/basic-fullbody.png',
  'crystal-queen':  '/images/characters/crystal-queen/basic-fullbody.png',
  'unipop':         '/images/characters/unipop/basic-fullbody.png',
  'robin-rook':     '/images/characters/robin-rook/basic-fullbody.png',
}

const LEGENDARY_FULLBODY: Partial<Record<string, string>> = {
  'happy-pawn':     '/images/characters/happy-pawn/legendary-fullbody.png',
  'chessbeard':     '/images/characters/chessbeard/legendary-fullbody.png',
  'general-gambit': '/images/characters/general-gambit/legendary-fullbody.png',
  'kings-guard':    '/images/characters/kings-guard/legendary-fullbody.png',
  'crystal-queen':  '/images/characters/crystal-queen/legendary-fullbody.png',
  'unipop':         '/images/characters/unipop/legendary-fullbody.png',
  'robin-rook':     '/images/characters/robin-rook/legendary-fullbody.png',
}

const SPACE_FULLBODY: Partial<Record<string, string>> = {
  'general-gambit': '/images/characters/general-gambit/space-fullbody.png',
  'unipop':         '/images/characters/unipop/space-fullbody.png',
  'puzzle-pete':    '/images/characters/puzzle-pete/space-fullbody.png',
  'crystal-queen':  '/images/characters/crystal-queen/space-fullbody.png',
  'happy-pawn':     '/images/characters/happy-pawn/space-fullbody.png',
  'robin-rook':     '/images/characters/robin-rook/space-fullbody.png',
  'kings-guard':    '/images/characters/kings-guard/space-fullbody.png',
  'black-king':     '/images/characters/black-king/space-fullbody.png',
}

function getPortrait(charId: string, chapter: CampaignChapter): string {
  if (chapter === 3) return SPACE_FULLBODY[charId] ?? BASIC_FULLBODY[charId] ?? ''
  if (chapter === 2) return LEGENDARY_FULLBODY[charId] ?? BASIC_FULLBODY[charId] ?? ''
  return BASIC_FULLBODY[charId] ?? ''
}

const CHAPTER_META: Record<CampaignChapter, { label: string; accent: string; glow: string }> = {
  1: { label: 'Standard',  accent: 'rgba(201,162,39,1)',  glow: 'rgba(201,162,39,0.4)'  },
  2: { label: 'Legendary', accent: 'rgba(192,132,252,1)', glow: 'rgba(192,132,252,0.4)' },
  3: { label: 'Space',     accent: 'rgba(167,139,250,1)', glow: 'rgba(167,139,250,0.4)' },
}

// Characters who are "villains" get a different color scheme
const VILLAIN_CHARS = new Set(['puzzle-pete', 'kings-guard', 'black-king'])

interface Props {
  charId: string
  chapter: CampaignChapter
  phase: 'pre' | 'postWin' | 'postLose'
  onContinue: () => void
  continueLabel?: string
  onBack?: () => void
  linesOverride?: string[]
  headerLabel?: string
}

export default function DialogueScreen({ charId, chapter, phase, onContinue, continueLabel, onBack, linesOverride, headerLabel }: Props) {
  const [lineIdx, setLineIdx] = useState(0)
  useEffect(() => { setLineIdx(0) }, [charId, linesOverride])

  const dialogue = CAMPAIGN_DIALOGUE[charId]
  const chKey = `ch${chapter}` as 'ch1' | 'ch2' | 'ch3'
  const lines: string[] = linesOverride ?? dialogue?.[chKey]?.[phase] ?? ['...']

  const portrait = getPortrait(charId, chapter)
  const meta = CHAPTER_META[chapter]
  const isVillain = VILLAIN_CHARS.has(charId)
  const isLastLine = lineIdx >= lines.length - 1

  const charAccent = isVillain
    ? (charId === 'black-king' ? 'rgba(220,60,60,1)' : charId === 'kings-guard' ? 'rgba(180,80,80,1)' : 'rgba(248,113,113,1)')
    : charId === 'crystal-queen' ? 'rgba(167,139,250,1)'
    : charId === 'robin-rook' ? 'rgba(148,163,184,1)'
    : meta.accent

  const bgGradient = isVillain
    ? 'linear-gradient(160deg, #1a0505 0%, #0d0505 50%, #0a0808 100%)'
    : phase === 'postWin'
      ? 'linear-gradient(160deg, #0d1a05 0%, #060d03 50%, #080a05 100%)'
      : 'linear-gradient(160deg, #0a080d 0%, #050310 50%, #0a080f 100%)'

  const phaseLabel = phase === 'pre' ? '' : phase === 'postWin' ? 'Victory!' : 'Defeat'

  function handleNext() {
    if (isLastLine) {
      onContinue()
    } else {
      setLineIdx(i => i + 1)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(16px)' }}
    >
      <div style={{
        width: '100%', maxWidth: '480px',
        background: bgGradient,
        border: `1.5px solid ${charAccent}44`,
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: `0 0 80px ${charAccent}22, 0 32px 80px rgba(0,0,0,0.9)`,
        display: 'flex', flexDirection: 'column',
        margin: '0 16px',
      }}>
        {/* Chapter badge */}
        <div style={{
          padding: '10px 20px',
          background: 'rgba(0,0,0,0.4)',
          borderBottom: `1px solid ${charAccent}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  fontFamily: B, fontSize: '11px', fontWeight: 600,
                  color: 'rgba(138,117,96,0.55)', background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0, letterSpacing: '0.04em', transition: 'color 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory-dim)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(138,117,96,0.55)' }}
              >
                ← Map
              </button>
            )}
            <span style={{
              fontFamily: B, fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: meta.accent,
            }}>
              {headerLabel ?? `Chapter ${chapter} — ${meta.label}`}
            </span>
          </div>
          {phaseLabel && (
            <span style={{
              fontFamily: D, fontSize: '11px', fontWeight: 700,
              color: phase === 'postWin' ? '#4ade80' : '#f87171',
              letterSpacing: '0.08em',
            }}>
              {phaseLabel}
            </span>
          )}
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', alignItems: 'flex-end', minHeight: '280px' }}>
          {/* Portrait */}
          <div style={{
            width: '160px', flexShrink: 0,
            background: `linear-gradient(160deg, rgba(0,0,0,0.2) 0%, ${charAccent}14 100%)`,
            borderRight: `1px solid ${charAccent}22`,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
            minHeight: '280px',
          }}>
            {/* Subtle glow behind portrait */}
            <div style={{
              position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: '140px', height: '200px',
              background: `radial-gradient(ellipse at bottom, ${charAccent}20 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />
            {portrait && (
              <img
                src={portrait}
                alt={CHAR_NAMES[charId]}
                draggable={false}
                style={{
                  height: '240px', width: '150px',
                  objectFit: 'contain', objectPosition: 'bottom center',
                  position: 'relative', zIndex: 1,
                  filter: `drop-shadow(0 8px 24px ${charAccent}44)`,
                }}
              />
            )}
          </div>

          {/* Dialogue text area */}
          <div style={{
            flex: 1, padding: '20px 20px 20px 16px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            minHeight: '280px',
          }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
              <p style={{
                fontFamily: D, fontSize: '14px', fontWeight: 700,
                color: charAccent, margin: 0, letterSpacing: '0.04em',
              }}>
                {CHAR_NAMES[charId]}
              </p>

              {/* Speech bubble */}
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${charAccent}30`,
                borderRadius: '12px',
                padding: '14px 16px',
                position: 'relative',
              }}>
                {/* Tail pointing left */}
                <div style={{
                  position: 'absolute', left: '-8px', top: '20px',
                  width: 0, height: 0,
                  borderTop: '7px solid transparent',
                  borderBottom: '7px solid transparent',
                  borderRight: `8px solid ${charAccent}30`,
                }} />
                <p style={{
                  fontFamily: B, fontSize: '13px', lineHeight: 1.65,
                  color: 'var(--ivory)', margin: 0,
                }}>
                  {lines[lineIdx]}
                </p>
              </div>

              {/* Line progress dots */}
              {lines.length > 1 && (
                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                  {lines.map((_, i) => (
                    <div key={i} style={{
                      width: i === lineIdx ? '16px' : '5px', height: '5px',
                      borderRadius: '3px',
                      background: i <= lineIdx ? charAccent : `${charAccent}33`,
                      transition: 'all 0.2s',
                    }} />
                  ))}
                </div>
              )}
            </div>

            {/* Continue button */}
            <button
              onClick={handleNext}
              style={{
                marginTop: '16px',
                padding: '11px 20px', borderRadius: '50px',
                background: isLastLine
                  ? `linear-gradient(135deg, ${charAccent.replace('1)', '0.25)')} 0%, ${charAccent.replace('1)', '0.1)')} 100%)`
                  : 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${isLastLine ? charAccent : charAccent.replace('1)', '0.3)')}`,
                color: isLastLine ? charAccent : 'var(--ivory-dim)',
                fontFamily: D, fontWeight: 700, fontSize: '12px',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: isLastLine ? `0 0 20px ${charAccent.replace('1)', '0.2)')}` : 'none',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.transform = 'none'
              }}
            >
              {isLastLine
                ? (continueLabel ?? (phase === 'pre' ? '⚔ Fight!' : 'Continue →'))
                : 'Next ›'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
