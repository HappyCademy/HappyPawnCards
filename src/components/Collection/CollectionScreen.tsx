import { useState } from 'react'
import { ALL_CARDS, RARITIES, type CardVariant, type Rarity } from '../../data/cards'

const D = 'var(--font-display)'
const B = 'var(--font-body)'

const CHAR_ORDER = [
  'happy-pawn', 'chessbeard', 'general-gambit', 'unipop',
  'robin-rook', 'crystal-queen', 'puzzle-pete', 'kings-guard', 'black-king', 'pirate-queen',
]

const CHAR_NAMES: Record<string, string> = {
  'happy-pawn': 'Happy Pawn', 'chessbeard': 'Chessbeard', 'black-king': 'Black King',
  'general-gambit': 'General Gambit', 'kings-guard': "King's Guard", 'puzzle-pete': 'Puzzle Pete',
  'crystal-queen': 'Crystal Queen', 'unipop': 'Unipop', 'robin-rook': 'Robin Rook',
  'pirate-queen': 'Pirate Queen',
}

const CHAR_CHIBI: Record<string, string> = {
  'happy-pawn':     '/images/characters/happy-pawn/basic-chibi.png',
  'chessbeard':     '/images/characters/chessbeard/basic-chibi.png',
  'general-gambit': '/images/characters/general-gambit/basic-chibi.png',
  'unipop':         '/images/characters/unipop/basic-chibi.png',
  'robin-rook':     '/images/characters/robin-rook/basic-chibi.png',
  'crystal-queen':  '/images/characters/crystal-queen/basic-chibi.png',
  'puzzle-pete':    '/images/characters/puzzle-pete/basic-chibi.png',
  'kings-guard':    '/images/characters/kings-guard/basic-chibi.png',
  'black-king':     '/images/characters/black-king/basic-chibi.png',
  'pirate-queen':   '/images/characters/pirate-queen/legendary-fullbody.png',
}

const RARITY_COLOR: Record<Rarity, string> = {
  basic:     '#94a3b8',
  baby:      '#4ade80',
  fullart:   '#60a5fa',
  foil:      '#94a3b8',
  golden:    '#facc15',
  legendary: '#c084fc',
  space:     '#a78bfa',
}

const RARITY_LABEL: Record<Rarity, string> = {
  basic: 'Basic', baby: 'Babies', fullart: 'Full Art',
  foil: 'Foil', golden: 'Golden', legendary: 'Legendary', space: 'Space',
}

interface Props {
  ownedCardIds: Set<string>
  onBack: () => void
}

export default function CollectionScreen({ ownedCardIds, onBack }: Props) {
  const [filterChar, setFilterChar] = useState<string | null>(null)

  const cards = filterChar
    ? ALL_CARDS.filter(c => c.characterId === filterChar)
    : [...ALL_CARDS].sort((a, b) => {
        const ai = CHAR_ORDER.indexOf(a.characterId)
        const bi = CHAR_ORDER.indexOf(b.characterId)
        if (ai !== bi) return ai - bi
        const ri = RARITIES.findIndex(r => r.key === a.rarity)
        const rj = RARITIES.findIndex(r => r.key === b.rarity)
        return ri - rj
      })

  const ownedCount = ALL_CARDS.filter(c => ownedCardIds.has(c.id)).length
  const totalCount = ALL_CARDS.length

  return (
    <div className="cards-bg min-h-screen flex flex-col items-center py-8 px-4">
      {/* Header */}
      <header style={{ width: '100%', maxWidth: '640px', marginBottom: '20px', position: 'relative', textAlign: 'center' }}>
        <button
          onClick={onBack}
          style={{ position: 'absolute', left: 0, top: '4px', fontFamily: B, color: 'var(--ivory-dim)', fontSize: '13px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.04em', padding: '4px 8px' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory-dim)' }}
        >
          ← Back
        </button>

        <p style={{ fontFamily: D, fontSize: '20px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
          Collection
        </p>
        <p style={{ fontFamily: B, fontSize: '11px', color: 'var(--ivory-dim)', marginTop: '4px', letterSpacing: '0.06em' }}>
          <span style={{ color: 'var(--gold-bright)', fontWeight: 700 }}>{ownedCount}</span> / {totalCount} cards
        </p>
      </header>

      {/* Character filter tabs */}
      <div style={{
        display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center',
        maxWidth: '640px', width: '100%', marginBottom: '20px',
      }}>
        <FilterTab
          label="All"
          active={filterChar === null}
          onClick={() => setFilterChar(null)}
        />
        {CHAR_ORDER.map(charId => (
          <FilterTab
            key={charId}
            chibi={CHAR_CHIBI[charId]}
            label={CHAR_NAMES[charId]}
            active={filterChar === charId}
            onClick={() => setFilterChar(charId === filterChar ? null : charId)}
          />
        ))}
      </div>

      {/* Card grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '10px',
        width: '100%',
        maxWidth: '640px',
      }}>
        {cards.map(card => (
          <CardTile key={card.id} card={card} owned={ownedCardIds.has(card.id)} />
        ))}
      </div>
    </div>
  )
}

function FilterTab({ label, chibi, active, onClick }: {
  label: string
  chibi?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: chibi ? '36px' : 'auto',
        height: '36px',
        padding: chibi ? '0' : '0 12px',
        borderRadius: '8px',
        border: `1.5px solid ${active ? 'var(--gold)' : 'rgba(201,162,39,0.2)'}`,
        background: active ? 'rgba(201,162,39,0.15)' : 'rgba(13,10,26,0.7)',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'all 0.15s',
        boxShadow: active ? '0 0 10px rgba(201,162,39,0.3)' : 'none',
        flexShrink: 0,
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201,162,39,0.5)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201,162,39,0.2)' }}
    >
      {chibi ? (
        <img src={chibi} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <span style={{ fontFamily: D, fontSize: '10px', fontWeight: 700, color: active ? 'var(--gold)' : 'var(--ivory-dim)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      )}
    </button>
  )
}

function CardTile({ card, owned }: { card: CardVariant; owned: boolean }) {
  const color = RARITY_COLOR[card.rarity]

  return (
    <div style={{
      borderRadius: '10px',
      border: `1.5px solid ${owned ? color + '80' : 'rgba(255,255,255,0.07)'}`,
      background: owned ? 'rgba(4,2,12,0.95)' : 'rgba(8,5,20,0.9)',
      overflow: 'hidden',
      boxShadow: owned ? `0 0 16px ${color}22` : 'none',
      position: 'relative',
      aspectRatio: '2 / 3',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Art area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <img
          src={card.image}
          alt={owned ? card.name : '?'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
            display: 'block',
            filter: owned ? 'none' : 'grayscale(1) brightness(0.15)',
          }}
        />

        {/* Mystery overlay */}
        {!owned && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '4px',
          }}>
            <span style={{ fontSize: '22px', opacity: 0.4 }}>?</span>
          </div>
        )}

        {/* Rarity glow strip at top for owned */}
        {owned && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: color,
            opacity: 0.7,
          }} />
        )}
      </div>

      {/* Rarity label bar */}
      <div style={{
        padding: '4px 4px 5px',
        background: owned ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.55)',
        borderTop: `1px solid ${owned ? color + '40' : 'rgba(255,255,255,0.05)'}`,
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: D, fontSize: '7px', fontWeight: 900,
          letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0,
          color: owned ? color : 'rgba(255,255,255,0.18)',
        }}>
          {owned ? RARITY_LABEL[card.rarity] : '???'}
        </p>
        <p style={{
          fontFamily: B, fontSize: '7px', fontWeight: 700,
          margin: '1px 0 0', letterSpacing: '0.04em',
          color: owned ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.12)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {owned ? CHAR_NAMES[card.characterId] : '???'}
        </p>
      </div>
    </div>
  )
}
