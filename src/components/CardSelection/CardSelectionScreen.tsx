import { useState } from 'react'
import { RARITIES, getCardsByRarity, type CardVariant, type Rarity, type RarityMeta } from '../../data/cards'
import { CARD_POWERS } from '../../data/powers'
import CardTile from './CardTile'

const RARITY_GRADIENTS: Record<string, string> = {
  basic:     'linear-gradient(135deg, #4b5563, #9ca3af)',
  baby:      'linear-gradient(135deg, #16a34a, #4ade80)',
  fullart:   'linear-gradient(135deg, #1d4ed8, #60a5fa)',
  foil:      'linear-gradient(135deg, #0e7490, #22d3ee)',
  golden:    'linear-gradient(135deg, #b45309, #facc15)',
  legendary: 'linear-gradient(135deg, #6d28d9, #e879f9)',
  space:     'linear-gradient(135deg, #1e1b4b, #4c1d95, #7c3aed, #a78bfa)',
}

const D = 'var(--font-display)'
const B = 'var(--font-body)'

interface Props {
  onDone: (picks: [CardVariant, CardVariant]) => void
  onBack: () => void
  playerLabel?: string
  buttonLabel?: string
}

export default function CardSelectionScreen({
  onDone,
  onBack,
  playerLabel = 'Pick 2 cards to bring into battle',
  buttonLabel = '⚔ Start Game',
}: Props) {
  const [activeRarity, setActiveRarity] = useState<Rarity>('basic')
  const [picks, setPicks] = useState<[CardVariant | null, CardVariant | null]>([null, null])
  const [previewCard, setPreviewCard] = useState<CardVariant | null>(null)

  const visibleCards = getCardsByRarity(activeRarity).filter(card => {
    const power = CARD_POWERS[card.characterId]
    if (!power) return false
    // Legendary-only characters don't appear in non-legendary tabs
    if (!power.implemented && power.implementedLegendary && activeRarity !== 'legendary') return false
    // Characters superseded at legendary by another character are hidden in the legendary tab
    if (power.legendaryUpgrade && activeRarity === 'legendary') return false
    return true
  })

  function pieceSymbolOf(c: CardVariant) {
    return CARD_POWERS[c.characterId]?.pieceSymbol ?? null
  }

  function isConflicting(card: CardVariant): boolean {
    const sym = pieceSymbolOf(card)
    if (!sym) return false
    return picks.some(p => p && p.id !== card.id && pieceSymbolOf(p) === sym)
  }

  function isComingSoon(card: CardVariant): boolean {
    const power = CARD_POWERS[card.characterId]
    if (!power) return true
    if (card.rarity === 'legendary' && power.implementedLegendary) return false
    if (card.rarity === 'space' && power.implementedSpace) return false
    if (!power.implemented) return true
    return false
  }

  function handleCardClick(card: CardVariant) {
    if (isConflicting(card) || isComingSoon(card)) return
    const [p1, p2] = picks
    if (p1?.id === card.id) { setPicks([null, p2]); return }
    if (p2?.id === card.id) { setPicks([p1, null]); return }
    if (!p1) { setPicks([card, p2]); return }
    if (!p2) { setPicks([p1, card]); return }
    setPicks([p2, card])
  }

  function handleModalAction(card: CardVariant) {
    handleCardClick(card)
    setPreviewCard(null)
  }

  function getSelectionIndex(card: CardVariant): 1 | 2 | null {
    if (picks[0]?.id === card.id) return 1
    if (picks[1]?.id === card.id) return 2
    return null
  }

  const canStart = picks[0] !== null && picks[1] !== null

  return (
    <div
      className="cards-bg min-h-screen flex flex-col items-center py-8 px-4"
    >
      {/* Header */}
      <header className="mb-8 text-center relative w-full max-w-3xl">
        <button
          onClick={onBack}
          style={{
            position: 'absolute', left: 0, top: '4px',
            fontFamily: B, color: 'var(--ivory-dim)', fontSize: '13px',
            fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer',
            letterSpacing: '0.04em', padding: '4px 8px', transition: 'color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory-dim)' }}
        >
          ← Back
        </button>
        <h1 style={{
          fontFamily: D,
          fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
          fontWeight: 700,
          color: 'var(--gold-bright)',
          letterSpacing: '0.06em',
          textShadow: '0 0 30px rgba(201,162,39,0.45), 0 2px 16px rgba(0,0,0,0.9)',
          marginBottom: '8px',
        }}>
          ♟ Happy Pawn Cards
        </h1>
        <p style={{
          fontFamily: B,
          color: 'var(--ivory-dim)',
          fontSize: '13px',
          letterSpacing: '0.06em',
        }}>
          {playerLabel}
        </p>
      </header>

      {/* Pick slots */}
      <div className="flex gap-10 mb-8">
        <SlotPreview label="Card 1" card={picks[0]} color="var(--gold-bright)" />
        <SlotPreview label="Card 2" card={picks[1]} color="#a08fff" />
      </div>

      {/* Rarity tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1" style={{ maxWidth: '100%' }}>
        {RARITIES.map(r => (
          <RarityTab
            key={r.key}
            rarity={r}
            isActive={r.key === activeRarity}
            onClick={() => setActiveRarity(r.key)}
          />
        ))}
      </div>

      {/* Card grid — 3×3 */}
      <div
        className="grid gap-4 mb-8"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '520px', width: '100%' }}
      >
        {visibleCards.map(card => (
          <CardTile
            key={card.id}
            card={card}
            selectionIndex={getSelectionIndex(card)}
            isConflicting={isConflicting(card)}
            isComingSoon={isComingSoon(card)}
            onClick={() => setPreviewCard(card)}
          />
        ))}
      </div>

      {/* Confirm button — kit PLAY style */}
      <button
        onClick={() => canStart && onDone([picks[0]!, picks[1]!])}
        disabled={!canStart}
        style={{
          padding: '16px 64px',
          borderRadius: '50px',
          fontSize: '15px',
          fontWeight: 700,
          fontFamily: D,
          letterSpacing: '0.1em',
          cursor: canStart ? 'pointer' : 'not-allowed',
          border: canStart ? '2px solid var(--gold)' : '2px solid rgba(255,255,255,0.08)',
          background: canStart
            ? 'linear-gradient(160deg, #3a1060 0%, #1a0d36 100%)'
            : 'rgba(13,10,26,0.5)',
          color: canStart ? 'var(--gold-bright)' : '#334155',
          boxShadow: canStart
            ? '0 0 0 1px rgba(201,162,39,0.2), 0 8px 32px rgba(201,162,39,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
            : 'none',
          transition: 'all 0.2s',
          textTransform: 'uppercase',
          backdropFilter: 'blur(8px)',
        }}
        onMouseEnter={e => { if (canStart) { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(-2px)'; b.style.boxShadow = '0 12px 40px rgba(201,162,39,0.4)' } }}
        onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'none'; b.style.boxShadow = canStart ? '0 8px 32px rgba(201,162,39,0.3)' : 'none' }}
      >
        {canStart ? `♛ ${buttonLabel}` : '♟ Pick 2 cards to continue'}
      </button>

      {/* Card preview modal */}
      {previewCard && (
        <CardPreviewModal
          card={previewCard}
          selectionIndex={getSelectionIndex(previewCard)}
          isConflicting={isConflicting(previewCard)}
          isComingSoon={isComingSoon(previewCard)}
          onAction={() => handleModalAction(previewCard)}
          onClose={() => setPreviewCard(null)}
        />
      )}
    </div>
  )
}

// ── Card preview modal ────────────────────────────────────────────────────────

function CardPreviewModal({ card, selectionIndex, isConflicting, isComingSoon, onAction, onClose }: {
  card: CardVariant
  selectionIndex: 1 | 2 | null
  isConflicting: boolean
  isComingSoon: boolean
  onAction: () => void
  onClose: () => void
}) {
  const power = CARD_POWERS[card.characterId]
  const rarityMeta = RARITIES.find(r => r.key === card.rarity)!
  const isSelected = selectionIndex !== null
  const pickColor = selectionIndex === 1 ? 'var(--gold-bright)' : '#a08fff'
  const gradient = RARITY_GRADIENTS[card.rarity]

  let actionLabel: string
  let actionEnabled: boolean
  let actionStyle: React.CSSProperties

  if (isComingSoon) {
    actionLabel = '✨ Coming Soon'
    actionEnabled = false
    actionStyle = { background: 'rgba(255,255,255,0.04)', color: '#475569', border: '1.5px solid rgba(255,255,255,0.08)' }
  } else if (isConflicting && !isSelected) {
    actionLabel = "⚠ Same Piece — Can't Pick"
    actionEnabled = false
    actionStyle = { background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1.5px solid rgba(248,113,113,0.25)' }
  } else if (isSelected) {
    actionLabel = '✕ Deselect'
    actionEnabled = true
    actionStyle = { background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1.5px solid rgba(255,255,255,0.12)' }
  } else {
    actionLabel = '✓ Pick this card'
    actionEnabled = true
    actionStyle = {
      background: 'linear-gradient(135deg, #c9a227 0%, #f0c040 100%)',
      color: '#0d0a1a',
      border: 'none',
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          background: 'rgba(13,10,26,0.92)',
          border: `1.5px solid ${rarityMeta.color}55`,
          borderRadius: '24px',
          padding: '28px 24px',
          maxWidth: '340px',
          width: '90vw',
          boxShadow: `0 0 0 1px ${rarityMeta.color}22, 0 32px 80px rgba(0,0,0,0.8), 0 0 60px ${rarityMeta.glow}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute' as const, top: '14px', right: '18px',
            background: 'none', border: 'none', color: '#475569', fontSize: '18px',
            cursor: 'pointer', lineHeight: 1, padding: '4px', fontFamily: 'var(--font-body)',
          }}
        >
          ✕
        </button>

        {/* Rarity badge */}
        <div style={{
          padding: '3px 12px', borderRadius: '20px',
          background: gradient, fontSize: '11px', fontWeight: 800,
          color: '#fff', letterSpacing: '0.08em',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          alignSelf: 'flex-start',
          fontFamily: 'var(--font-display)',
        }}>
          {rarityMeta.label.toUpperCase()}
        </div>

        {/* Card image */}
        <div style={{
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: isSelected
            ? `0 0 0 3px ${pickColor}, 0 12px 40px rgba(0,0,0,0.6)`
            : `0 0 0 2px ${rarityMeta.color}55, 0 12px 40px rgba(0,0,0,0.6)`,
          transition: 'box-shadow 0.2s',
        }}>
          <img
            src={card.image}
            alt={card.name}
            draggable={false}
            style={{ display: 'block', width: '200px', height: 'auto' }}
          />
        </div>

        {/* Name */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            margin: 0, fontSize: '20px', fontWeight: 700,
            color: 'var(--ivory)', letterSpacing: '0.04em',
            fontFamily: 'var(--font-display)',
          }}>
            {card.name}
          </h2>
          {isSelected && (
            <span style={{
              display: 'inline-block', marginTop: '4px',
              fontSize: '11px', fontWeight: 800, color: pickColor, letterSpacing: '0.08em',
              fontFamily: 'var(--font-display)',
            }}>
              CARD {selectionIndex} SELECTED
            </span>
          )}
        </div>

        {/* Power */}
        {power?.powerLabel && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--gold-dim)',
            borderRadius: '14px',
            padding: '14px 16px',
            width: '100%',
          }}>
            <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
              {card.rarity === 'space' && power.spacePowerLabel ? power.spacePowerLabel : power.powerLabel}
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--ivory-dim)', lineHeight: 1.55, fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              {card.rarity === 'space' && power.spacePowerDescription ? power.spacePowerDescription : power.powerDescription}
            </p>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={actionEnabled ? onAction : undefined}
          style={{
            width: '100%', padding: '13px',
            borderRadius: '14px',
            fontSize: '14px', fontWeight: 800,
            cursor: actionEnabled ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-display)',
            ...actionStyle,
          }}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  )
}

function RarityTab({ rarity, isActive, onClick }: {
  rarity: RarityMeta; level?: number; isActive: boolean; onClick: () => void
}) {
  const gradient = RARITY_GRADIENTS[rarity.key]

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center focus:outline-none flex-shrink-0 transition-all duration-200"
      style={{
        padding: '10px 16px',
        borderRadius: '14px',
        background: isActive ? gradient : 'rgba(13,10,26,0.6)',
        border: isActive ? 'none' : '1px solid rgba(201,162,39,0.15)',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        boxShadow: isActive ? `0 4px 18px ${rarity.glow}, 0 0 0 1px ${rarity.color}44` : 'none',
        transform: isActive ? 'translateY(-2px)' : 'none',
        fontFamily: 'var(--font-display)',
      }}
    >
      <span
        className="text-sm font-bold whitespace-nowrap tracking-wide"
        style={{ color: isActive ? '#fff' : rarity.color, textShadow: isActive ? '0 1px 4px rgba(0,0,0,0.4)' : 'none' }}
      >
        {rarity.label}
      </span>
    </button>
  )
}

function SlotPreview({ label, card, color }: { label: string; card: CardVariant | null; color: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: '10px', fontWeight: 600,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color,
      }}>
        {label}
      </p>
      <div style={{
        width: '72px', height: '100px', borderRadius: '10px',
        border: `2px ${card ? 'solid' : 'dashed'} ${card ? color : 'rgba(201,162,39,0.15)'}`,
        overflow: 'hidden',
        background: 'rgba(13,10,26,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
        boxShadow: card ? `0 0 16px ${color}44` : 'none',
        backdropFilter: 'blur(8px)',
      }}>
        {card
          ? <img src={card.image} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ color: 'rgba(201,162,39,0.15)', fontSize: '22px' }}>♟</span>
        }
      </div>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '11px', textAlign: 'center', lineHeight: 1.3,
        color: card ? 'var(--ivory)' : '#334155',
        maxWidth: '72px',
      }}>
        {card ? card.name : '—'}
      </p>
    </div>
  )
}
