import { useState } from 'react'
import { ALL_CARDS, type CardVariant, type Rarity } from '../../data/cards'
import { CARD_POWERS } from '../../data/powers'

const D = 'var(--font-display)'
const B = 'var(--font-body)'

const DISPLAY_CHAR_IDS = [
  'happy-pawn', 'chessbeard', 'black-king', 'general-gambit', 'kings-guard',
  'puzzle-pete', 'crystal-queen', 'unipop', 'robin-rook',
]

const CHAR_NAMES: Record<string, string> = {
  'happy-pawn': 'Happy Pawn', 'chessbeard': 'Chessbeard', 'black-king': 'Black King',
  'general-gambit': 'General Gambit', 'kings-guard': "King's Guard", 'puzzle-pete': 'Puzzle Pete',
  'crystal-queen': 'Crystal Queen', 'unipop': 'Unipop', 'robin-rook': 'Robin Rook',
  'pirate-queen': 'Pirate Queen',
}

// Standard fullbody for step 1 character grid — always uses the basic (regular) variant
const CHAR_FULLBODY: Record<string, string> = {
  'happy-pawn':     '/images/characters/happy-pawn/basic-fullbody.png',
  'chessbeard':     '/images/characters/chessbeard/basic-fullbody.png',
  'black-king':     '/images/characters/black-king/basic-fullbody.png',
  'general-gambit': '/images/characters/general-gambit/basic-fullbody.png',
  'kings-guard':    '/images/characters/kings-guard/basic-fullbody.png',
  'puzzle-pete':    '/images/characters/puzzle-pete/basic-fullbody.png',
  'pirate-queen':   '/images/characters/pirate-queen/basic-fullbody.png',
  'crystal-queen':  '/images/characters/crystal-queen/basic-fullbody.png',
  'unipop':         '/images/characters/unipop/basic-fullbody.png',
  'robin-rook':     '/images/characters/robin-rook/basic-fullbody.png',
}

// Chibi/face image for baby rarity
const CHAR_CHIBI: Partial<Record<string, string>> = {
  'happy-pawn':     '/images/characters/happy-pawn/basic-chibi.png',
  'chessbeard':     '/images/characters/chessbeard/basic-chibi.png',
  'general-gambit': '/images/characters/general-gambit/basic-chibi.png',
  'puzzle-pete':    '/images/characters/puzzle-pete/basic-chibi.png',
  'crystal-queen':  '/images/characters/crystal-queen/basic-chibi.png',
  'unipop':         '/images/characters/unipop/basic-chibi.png',
  'robin-rook':     '/images/characters/robin-rook/basic-chibi.png',
  'kings-guard':    '/images/characters/kings-guard/basic-chibi.png',
  'black-king':     '/images/characters/black-king/basic-chibi.png',
}

// Fullbody specific to golden variants (populated as assets are generated)
const CHAR_GOLDEN_FULLBODY: Partial<Record<string, string>> = {
  'happy-pawn':     '/images/characters/happy-pawn/golden-fullbody.png',
  'unipop':         '/images/characters/unipop/golden-fullbody.png',
  'robin-rook':     '/images/characters/robin-rook/golden-fullbody.png',
  'puzzle-pete':    '/images/characters/puzzle-pete/golden-fullbody.png',
  'general-gambit': '/images/characters/general-gambit/golden-fullbody.png',
  'chessbeard':     '/images/characters/chessbeard/golden-fullbody.png',
  'crystal-queen':  '/images/characters/crystal-queen/golden-fullbody.png',
  'kings-guard':    '/images/characters/kings-guard/golden-fullbody.png',
  'black-king':     '/images/characters/black-king/golden-fullbody.png',
}

// Fullbody specific to legendary variants
const CHAR_LEGENDARY_FULLBODY: Partial<Record<string, string>> = {
  'unipop':        '/images/characters/unipop/legendary-fullbody.png',
  'robin-rook':    '/images/characters/robin-rook/legendary-fullbody.png',
  'pirate-queen':  '/images/characters/pirate-queen/legendary-fullbody.png',
  'kings-guard':   '/images/characters/kings-guard/legendary-fullbody.png',
  'happy-pawn':    '/images/characters/happy-pawn/legendary-fullbody.png',
  'crystal-queen':  '/images/characters/crystal-queen/legendary-fullbody.png',
  'general-gambit': '/images/characters/general-gambit/legendary-fullbody.png',
  'chessbeard':     '/images/characters/chessbeard/legendary-fullbody.png',
}

// Fullbody specific to space variants
const CHAR_SPACE_FULLBODY: Partial<Record<string, string>> = {
  'general-gambit': '/images/characters/general-gambit/space-fullbody.png',
  'unipop':         '/images/characters/unipop/space-fullbody.png',
  'puzzle-pete':    '/images/characters/puzzle-pete/space-fullbody.png',
  'crystal-queen':  '/images/characters/crystal-queen/space-fullbody.png',
  'happy-pawn':     '/images/characters/happy-pawn/space-fullbody.png',
  'robin-rook':     '/images/characters/robin-rook/space-fullbody.png',
  'kings-guard':    '/images/characters/kings-guard/space-fullbody.png',
  'black-king':     '/images/characters/black-king/space-fullbody.png',
}

// Fullbody specific to full-art variants
const CHAR_FULLART_FULLBODY: Partial<Record<string, string>> = {
  'black-king':     '/images/characters/black-king/fullart-fullbody.png',
  'general-gambit': '/images/characters/general-gambit/fullart-fullbody.png',
  'unipop':         '/images/characters/unipop/fullart-fullbody.png',
  'kings-guard':    '/images/characters/kings-guard/fullart-fullbody.png',
  'chessbeard':     '/images/characters/chessbeard/fullart-fullbody.png',
  'crystal-queen':  '/images/characters/crystal-queen/fullart-fullbody.png',
  'puzzle-pete':    '/images/characters/puzzle-pete/fullart-fullbody.png',
  'robin-rook':     '/images/characters/robin-rook/fullart-fullbody.png',
  'happy-pawn':     '/images/characters/happy-pawn/fullart-fullbody.png',
}

// Baby-specific chibi (used instead of CHAR_CHIBI when available)
const CHAR_BABY_CHIBI: Partial<Record<string, string>> = {
  'crystal-queen':  '/images/characters/crystal-queen/baby-chibi.png',
  'black-king':     '/images/characters/black-king/baby-chibi.png',
  'general-gambit': '/images/characters/general-gambit/baby-chibi.png',
  'happy-pawn':     '/images/characters/happy-pawn/baby-chibi.png',
  'robin-rook':     '/images/characters/robin-rook/baby-chibi.png',
  'kings-guard':    '/images/characters/kings-guard/baby-chibi.png',
  'chessbeard':     '/images/characters/chessbeard/baby-chibi.png',
  'unipop':         '/images/characters/unipop/baby-chibi.png',
  'puzzle-pete':    '/images/characters/puzzle-pete/baby-chibi.png',
}

const RARITY_META: Partial<Record<Rarity, { label: string; color: string; glow: string }>> = {
  basic:     { label: 'Basic',    color: '#94a3b8', glow: 'rgba(148,163,184,0.35)' },
  baby:      { label: 'Baby',     color: '#4ade80', glow: 'rgba(74,222,128,0.35)'  },
  fullart:   { label: 'Full Art', color: '#60a5fa', glow: 'rgba(96,165,250,0.35)'  },
  golden:    { label: 'Golden',   color: '#facc15', glow: 'rgba(250,204,21,0.35)'  },
  legendary: { label: 'Legendary',color: '#c084fc', glow: 'rgba(192,132,252,0.45)' },
  space:     { label: 'Space',    color: '#a78bfa', glow: 'rgba(167,139,250,0.5)'  },
}

type PowerType = 'standard' | 'space' | 'legendary'
type FlowStep = 'character' | 'power' | 'look'
const STEP_ORDER: Record<FlowStep, number> = { character: 0, power: 1, look: 2 }

interface PowerOption {
  type: PowerType
  label: string
  description: string
  rarities: string
  available: boolean
}

function getMaxPicks(ownedCardIds?: Set<string>): number {
  if (!ownedCardIds) return 2
  const ownedCharIds = new Set<string>()
  for (const cardId of ownedCardIds) {
    const card = ALL_CARDS.find(c => c.id === cardId)
    if (card) ownedCharIds.add(card.characterId)
  }
  const charIds = Array.from(ownedCharIds)
  for (let i = 0; i < charIds.length; i++) {
    for (let j = i + 1; j < charIds.length; j++) {
      const sym1 = CARD_POWERS[charIds[i]]?.pieceSymbol
      const sym2 = CARD_POWERS[charIds[j]]?.pieceSymbol
      if (!sym1 || !sym2 || sym1 !== sym2) return 2
    }
  }
  return Math.min(charIds.length, 1)
}

function getRepCard(charId: string): CardVariant | undefined {
  const power = CARD_POWERS[charId]
  if (!power?.implemented && power?.implementedSpace)
    return ALL_CARDS.find(c => c.characterId === charId && c.rarity === 'space')
  return ALL_CARDS.find(c => c.characterId === charId && c.rarity === 'basic')
}

function getImplementedPowerCount(charId: string): number {
  const power = CARD_POWERS[charId]
  if (!power) return 0
  let n = 0
  if (power.implemented) n++
  if (power.implementedSpace) n++
  if (power.legendaryUpgrade && CARD_POWERS[power.legendaryUpgrade]?.implementedLegendary) n++
  if (!power.legendaryUpgrade && power.implementedLegendary) n++
  return n
}

function getSelectablePowerCount(charId: string, ownedCardIds?: Set<string>): number {
  if (!ownedCardIds) return getImplementedPowerCount(charId)
  return getPowerOptions(charId).filter(o => {
    if (!o.available) return false
    return getCardsForPower(charId, o.type).some(c => ownedCardIds.has(c.id))
  }).length
}

function getPowerOptions(charId: string): PowerOption[] {
  const power = CARD_POWERS[charId]
  if (!power) return []
  const opts: PowerOption[] = []
  opts.push({
    type: 'standard',
    label: power.powerLabel ?? '❓ Standard',
    description: power.powerDescription ?? '',
    rarities: 'Basic · Baby · Full Art · Golden',
    available: !!power.implemented,
  })
  if (power.spacePowerLabel) {
    opts.push({
      type: 'space',
      label: power.spacePowerLabel,
      description: power.spacePowerDescription ?? '',
      rarities: 'Space',
      available: !!power.implementedSpace,
    })
  }
  if (power.legendaryUpgrade) {
    const up = CARD_POWERS[power.legendaryUpgrade]
    if (up) {
      opts.push({
        type: 'legendary',
        label: up.powerLabel ?? '🌟 Legendary',
        description: up.powerDescription ?? '',
        rarities: 'Legendary',
        available: !!up.implementedLegendary,
      })
    }
  } else if (power.legendaryPowerLabel) {
    opts.push({
      type: 'legendary',
      label: power.legendaryPowerLabel,
      description: power.legendaryPowerDescription ?? '',
      rarities: 'Legendary',
      available: !!power.implementedLegendary,
    })
  }
  return opts
}

function getCardsForPower(charId: string, powerType: PowerType): CardVariant[] {
  const STANDARD: Rarity[] = ['basic', 'baby', 'fullart', 'golden']
  if (powerType === 'standard') return ALL_CARDS.filter(c => c.characterId === charId && STANDARD.includes(c.rarity))
  if (powerType === 'space') return ALL_CARDS.filter(c => c.characterId === charId && c.rarity === 'space')
  if (powerType === 'legendary') {
    const upgradeId = CARD_POWERS[charId]?.legendaryUpgrade
    if (upgradeId) return ALL_CARDS.filter(c => c.characterId === upgradeId && c.rarity === 'legendary')
    return ALL_CARDS.filter(c => c.characterId === charId && c.rarity === 'legendary')
  }
  return []
}

// Returns the character portrait to show in step 3 for a given variant
function getVariantPortrait(charId: string, powerType: PowerType, rarity: Rarity): string {
  if (rarity === 'baby') return CHAR_BABY_CHIBI[charId] ?? CHAR_CHIBI[charId] ?? CHAR_FULLBODY[charId] ?? ''
  if (rarity === 'fullart') return CHAR_FULLART_FULLBODY[charId] ?? CHAR_FULLBODY[charId] ?? ''
  if (rarity === 'golden') return CHAR_GOLDEN_FULLBODY[charId] ?? CHAR_FULLBODY[charId] ?? ''
  if (powerType === 'space') return CHAR_SPACE_FULLBODY[charId] ?? CHAR_FULLBODY[charId] ?? ''
  if (powerType === 'legendary') {
    const upgradeId = CARD_POWERS[charId]?.legendaryUpgrade
    if (upgradeId) return CHAR_LEGENDARY_FULLBODY[upgradeId] ?? CHAR_FULLBODY[upgradeId] ?? CHAR_FULLBODY[charId] ?? ''
    return CHAR_LEGENDARY_FULLBODY[charId] ?? CHAR_FULLBODY[charId] ?? ''
  }
  return CHAR_FULLBODY[charId] ?? ''
}

interface Props {
  onDone: (picks: CardVariant[]) => void
  onBack: () => void
  playerLabel?: string
  buttonLabel?: string
  ownedCardIds?: Set<string>
  maxPicksOverride?: number
}

export default function CardSelectionScreen({
  onDone, onBack,
  playerLabel = 'Pick 2 cards to bring into battle',
  buttonLabel = '⚔ Start Game',
  ownedCardIds,
  maxPicksOverride,
}: Props) {
  const [step, setStep] = useState<FlowStep>('character')
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null)
  const [selectedPower, setSelectedPower] = useState<PowerType | null>(null)
  const [picks, setPicks] = useState<[CardVariant | null, CardVariant | null]>([null, null])

  const pickCount = picks.filter(Boolean).length
  const maxPicks = Math.min(getMaxPicks(ownedCardIds), maxPicksOverride ?? 2)
  // In campaign (ownedCardIds provided), can always start (even with 0 cards)
  const canStart = ownedCardIds !== undefined ? true : pickCount === maxPicks

  function pieceSymOf(c: CardVariant | null) {
    if (!c) return null
    return CARD_POWERS[c.characterId]?.pieceSymbol ?? null
  }

  function isConflicting(card: CardVariant): boolean {
    const sym = CARD_POWERS[card.characterId]?.pieceSymbol ?? null
    if (!sym) return false
    return picks.some(p => p && p.id !== card.id && pieceSymOf(p) === sym)
  }

  function isCharConflicting(charId: string): boolean {
    const sym = CARD_POWERS[charId]?.pieceSymbol ?? null
    if (!sym) return false
    return picks.some(p => p && pieceSymOf(p) === sym && p.characterId !== charId && p.characterId !== CARD_POWERS[charId]?.legendaryUpgrade)
  }

  function isCharPicked(charId: string): boolean {
    return picks.some(p => {
      if (!p) return false
      if (p.characterId === charId) return true
      if (charId === 'puzzle-pete' && p.characterId === 'pirate-queen') return true
      return false
    })
  }

  function handleCharClick(charId: string) {
    if (isCharConflicting(charId)) return
    const opts = getPowerOptions(charId).filter(o => {
      if (!o.available) return false
      if (!ownedCardIds) return true
      return getCardsForPower(charId, o.type).some(c => ownedCardIds.has(c.id))
    })
    if (opts.length === 0) return
    setSelectedCharId(charId)
    if (opts.length === 1) {
      setSelectedPower(opts[0].type)
      setStep('look')
    } else {
      setStep('power')
    }
  }

  function handlePowerClick(power: PowerType) {
    setSelectedPower(power)
    setStep('look')
  }

  function handleCardPick(card: CardVariant) {
    if (isConflicting(card)) return
    const [p1, p2] = picks
    let newPicks: [CardVariant | null, CardVariant | null]
    if (maxPicks === 1) {
      newPicks = p1?.id === card.id ? [null, null] : [card, null]
    } else if (p1?.id === card.id) newPicks = [null, p2]
    else if (p2?.id === card.id) newPicks = [p1, null]
    else if (!p1) newPicks = [card, p2]
    else if (!p2) newPicks = [p1, card]
    else newPicks = [p2, card]
    setPicks(newPicks)
    setStep('character')
    setSelectedCharId(null)
    setSelectedPower(null)
  }

  function handleBack() {
    if (step === 'look') {
      const availOpts = getPowerOptions(selectedCharId!).filter(o => o.available)
      if (availOpts.length <= 1) { setStep('character'); setSelectedCharId(null); setSelectedPower(null) }
      else { setStep('power'); setSelectedPower(null) }
    } else if (step === 'power') {
      setStep('character'); setSelectedCharId(null)
    } else {
      onBack()
    }
  }

  const stepIdx = STEP_ORDER[step]
  const defaultLabel = maxPicks === 1 ? 'Pick a card to bring into battle' : 'Pick 2 cards to bring into battle'
  const breadcrumb = step === 'character' ? (playerLabel === 'Pick 2 cards to bring into battle' || playerLabel === 'Pick a card to bring into battle' ? defaultLabel : playerLabel)
    : step === 'power' ? `${CHAR_NAMES[selectedCharId!]} — Choose a power`
    : `${CHAR_NAMES[selectedCharId!]} — Choose your look`

  return (
    <div className="cards-bg min-h-screen flex flex-col items-center py-8 px-4">
      {/* Header */}
      <header className="mb-5 text-center relative w-full max-w-3xl">
        <button
          onClick={handleBack}
          style={{ position: 'absolute', left: 0, top: '4px', fontFamily: B, color: 'var(--ivory-dim)', fontSize: '13px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.04em', padding: '4px 8px', transition: 'color 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory-dim)' }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src="/images/logo.svg" alt="Happy Pawn Cards" style={{ height: 'clamp(48px, 8vw, 72px)', filter: 'drop-shadow(0 2px 12px rgba(201,162,39,0.35))', marginBottom: '6px' }} />
        </div>
        <p style={{ fontFamily: B, color: 'var(--ivory-dim)', fontSize: '12px', letterSpacing: '0.06em' }}>
          {breadcrumb}
        </p>
      </header>

      {/* Pick slots */}
      <div className="flex gap-10 mb-5">
        <SlotPreview label="Card 1" card={picks[0]} color="var(--gold-bright)" />
        {maxPicks >= 2 && <SlotPreview label="Card 2" card={picks[1]} color="#a08fff" />}
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-5">
        {(['character', 'power', 'look'] as FlowStep[]).map((s, i) => {
          const idx = STEP_ORDER[s]
          const active = step === s
          const done = idx < stepIdx
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                background: active ? 'var(--gold)' : done ? 'rgba(201,162,39,0.35)' : 'rgba(201,162,39,0.08)',
                border: `1.5px solid ${active ? 'var(--gold)' : 'rgba(201,162,39,0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 800,
                color: active ? '#0d0a1a' : done ? 'rgba(201,162,39,0.7)' : 'rgba(201,162,39,0.3)',
                fontFamily: D,
              }}>{done ? '✓' : i + 1}</div>
              <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: D, color: active ? 'var(--gold)' : 'rgba(201,162,39,0.3)' }}>
                {s === 'character' ? 'Character' : s === 'power' ? 'Power' : 'Look'}
              </span>
              {i < 2 && <span style={{ color: 'rgba(201,162,39,0.2)', fontSize: '11px', marginLeft: '-2px' }}>›</span>}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      {step === 'character' && (
        <CharacterGrid
          isCharConflicting={isCharConflicting}
          isCharPicked={isCharPicked}
          onSelect={handleCharClick}
          ownedCardIds={ownedCardIds}
        />
      )}
      {step === 'power' && selectedCharId && (
        <PowerSelection
          characterId={selectedCharId}
          onSelect={handlePowerClick}
          ownedCardIds={ownedCardIds}
        />
      )}
      {step === 'look' && selectedCharId && selectedPower && (
        <LookSelection
          characterId={selectedCharId}
          powerType={selectedPower}
          picks={picks}
          isConflicting={isConflicting}
          onPick={handleCardPick}
          ownedCardIds={ownedCardIds}
        />
      )}

      {/* Confirm */}
      <button
        onClick={() => canStart && onDone(picks.filter((p): p is CardVariant => p !== null))}
        disabled={!canStart}
        style={{
          marginTop: '28px', padding: '16px 64px', borderRadius: '50px',
          fontSize: '15px', fontWeight: 700, fontFamily: D, letterSpacing: '0.1em',
          cursor: canStart ? 'pointer' : 'not-allowed',
          border: canStart ? '2px solid var(--gold)' : '2px solid rgba(255,255,255,0.08)',
          background: canStart ? 'linear-gradient(160deg, #3a1060 0%, #1a0d36 100%)' : 'rgba(13,10,26,0.5)',
          color: canStart ? 'var(--gold-bright)' : '#334155',
          boxShadow: canStart ? '0 0 0 1px rgba(201,162,39,0.2), 0 8px 32px rgba(201,162,39,0.3), inset 0 1px 0 rgba(255,255,255,0.06)' : 'none',
          transition: 'all 0.2s', textTransform: 'uppercase', backdropFilter: 'blur(8px)',
        }}
        onMouseEnter={e => { if (canStart) { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(-2px)'; b.style.boxShadow = '0 12px 40px rgba(201,162,39,0.4)' } }}
        onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'none'; b.style.boxShadow = canStart ? '0 8px 32px rgba(201,162,39,0.3)' : 'none' }}
      >
        {ownedCardIds !== undefined
          ? (pickCount === 0 ? '⚔ Fight without card powers' : `♛ ${buttonLabel}`)
          : (canStart ? `♛ ${buttonLabel}` : `♟ Pick ${maxPicks} card${maxPicks !== 1 ? 's' : ''} to continue`)}
      </button>
    </div>
  )
}

// ── Step 1: Character grid (Street Fighter style) ─────────────────────────────

function CharacterGrid({ isCharConflicting, isCharPicked, onSelect, ownedCardIds }: {
  isCharConflicting: (id: string) => boolean
  isCharPicked: (id: string) => boolean
  onSelect: (id: string) => void
  ownedCardIds?: Set<string>
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [lastClicked, setLastClicked] = useState<string>(DISPLAY_CHAR_IDS[0])
  const featured = hovered ?? lastClicked

  const featuredCount = getSelectablePowerCount(featured, ownedCardIds)
  const featuredSelectable = featuredCount > 0
  const featuredConflicting = isCharConflicting(featured)
  const featuredPicked = isCharPicked(featured)

  function handleClick(charId: string) {
    const selectable = getSelectablePowerCount(charId, ownedCardIds) > 0
    if (!selectable || isCharConflicting(charId)) return
    if (featured === charId) {
      onSelect(charId)
    } else {
      setLastClicked(charId)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '520px', width: '100%' }}>

      {/* ── Featured character panel ── */}
      <div style={{
        width: '100%', borderRadius: '16px', overflow: 'hidden',
        background: 'rgba(8,5,20,0.92)',
        border: `2px solid ${featuredPicked ? 'rgba(201,162,39,0.7)' : featuredConflicting ? 'rgba(248,113,113,0.4)' : 'rgba(201,162,39,0.2)'}`,
        boxShadow: featuredPicked ? '0 0 28px rgba(201,162,39,0.25)' : 'none',
        backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'flex-end',
        minHeight: '160px',
        position: 'relative',
      }}>
        {/* Subtle diagonal stripe background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 18px, rgba(201,162,39,0.025) 18px, rgba(201,162,39,0.025) 19px)',
          pointerEvents: 'none',
        }} />

        {/* Big character art */}
        <div style={{ width: '130px', flexShrink: 0, height: '168px', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <img
            key={featured}
            src={CHAR_FULLBODY[featured]}
            alt={CHAR_NAMES[featured]}
            draggable={false}
            style={{
              height: '160px', width: '130px', objectFit: 'contain', objectPosition: 'bottom center',
              filter: !featuredSelectable || featuredConflicting ? 'grayscale(0.7) brightness(0.45)' : 'drop-shadow(0 4px 16px rgba(0,0,0,0.6))',
              transition: 'filter 0.2s',
            }}
          />
        </div>

        {/* Character info */}
        <div style={{ flex: 1, padding: '16px 16px 18px 8px', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
          <p style={{
            fontFamily: D, fontSize: '21px', fontWeight: 700, margin: 0,
            color: featuredPicked ? 'var(--gold)' : featuredConflicting ? '#f87171' : 'var(--ivory)',
            letterSpacing: '0.04em', lineHeight: 1.1,
            textShadow: featuredPicked ? '0 0 20px rgba(201,162,39,0.5)' : 'none',
          }}>
            {CHAR_NAMES[featured]}
          </p>

          {featuredPicked ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(201,162,39,0.18)', border: '1px solid rgba(201,162,39,0.45)', fontFamily: B, fontSize: '10px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', width: 'fit-content' }}>
              ✓ Picked
            </span>
          ) : featuredConflicting ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '20px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', fontFamily: B, fontSize: '10px', fontWeight: 700, color: '#f87171', letterSpacing: '0.06em', width: 'fit-content' }}>
              Piece conflict
            </span>
          ) : !featuredSelectable ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '20px', background: 'rgba(30,20,50,0.8)', fontFamily: B, fontSize: '10px', fontWeight: 700, color: 'rgba(138,117,96,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', width: 'fit-content' }}>
              {getImplementedPowerCount(featured) === 0 ? 'Coming soon' : '🔒 Not unlocked'}
            </span>
          ) : (
            <span style={{ fontFamily: B, fontSize: '12px', color: 'rgba(201,162,39,0.55)', letterSpacing: '0.02em' }}>
              {featuredCount === 1 ? '1 power available' : `${featuredCount} powers available`}
            </span>
          )}

          {/* Tap/click hint */}
          {featuredSelectable && !featuredConflicting && !featuredPicked && (
            <span style={{ fontFamily: B, fontSize: '10px', color: 'rgba(201,162,39,0.3)', letterSpacing: '0.06em', marginTop: '4px' }}>
              {hovered != null ? 'Click to select →' : 'Tap again to select →'}
            </span>
          )}
        </div>
      </div>

      {/* ── Chibi portrait grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '5px', width: '100%' }}>
        {DISPLAY_CHAR_IDS.map(charId => {
          const selectable = getSelectablePowerCount(charId, ownedCardIds) > 0
          const conflicting = isCharConflicting(charId)
          const picked = isCharPicked(charId)
          const isActive = charId === featured
          const chibi = CHAR_CHIBI[charId]

          return (
            <button
              key={charId}
              onClick={() => handleClick(charId)}
              onMouseEnter={() => setHovered(charId)}
              onMouseLeave={() => setHovered(null)}
              disabled={!selectable || conflicting}
              style={{
                padding: 0, border: 'none', cursor: selectable && !conflicting ? 'pointer' : 'not-allowed',
                borderRadius: '6px', overflow: 'hidden',
                outline: picked
                  ? '2.5px solid rgba(201,162,39,0.95)'
                  : isActive
                    ? '2px solid rgba(201,162,39,0.6)'
                    : conflicting
                      ? '2px solid rgba(248,113,113,0.3)'
                      : '2px solid rgba(201,162,39,0.12)',
                outlineOffset: '1px',
                opacity: !selectable ? 0.28 : conflicting ? 0.32 : 1,
                transform: isActive && !conflicting && selectable ? 'translateY(-3px)' : 'none',
                transition: 'transform 0.12s, outline 0.1s',
                boxShadow: picked ? '0 0 12px rgba(201,162,39,0.5)' : isActive ? '0 4px 14px rgba(0,0,0,0.5)' : 'none',
                background: 'rgba(8,5,20,0.9)',
              }}
            >
              <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden' }}>
                {chibi ? (
                  <img
                    src={chibi}
                    alt={CHAR_NAMES[charId]}
                    draggable={false}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                      filter: !selectable || conflicting ? 'grayscale(1) brightness(0.35)' : 'none',
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>?</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

    </div>
  )
}

// ── Step 2: Power selection ────────────────────────────────────────────────────

function PowerVideo({ charId, powerType }: { charId: string; powerType: PowerType }) {
  const [err, setErr] = useState(false)
  const src = `/images/powers/${charId}-${powerType}.mp4`

  if (err) return null

  return (
    <div style={{
      width: '100%', borderRadius: '10px', overflow: 'hidden',
      background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,162,39,0.12)',
      aspectRatio: '16/9',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <video
        src={src}
        autoPlay loop muted playsInline
        onError={() => setErr(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  )
}

function PowerSelection({ characterId, onSelect, ownedCardIds }: {
  characterId: string
  onSelect: (p: PowerType) => void
  ownedCardIds?: Set<string>
}) {
  const opts = getPowerOptions(characterId).filter(o => {
    if (!o.available) return false
    if (!ownedCardIds) return true
    return getCardsForPower(characterId, o.type).some(c => ownedCardIds.has(c.id))
  })
  const repCard = getRepCard(characterId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '520px', width: '100%' }}>
      {/* Character badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 20px', borderRadius: '14px', background: 'rgba(13,10,26,0.7)', border: '1px solid rgba(201,162,39,0.15)', backdropFilter: 'blur(12px)' }}>
        {repCard && <img src={repCard.image} alt={CHAR_NAMES[characterId]} style={{ width: '56px', height: 'auto', borderRadius: '6px' }} draggable={false} />}
        <div>
          <p style={{ fontFamily: D, fontSize: '17px', fontWeight: 700, color: 'var(--ivory)', margin: 0, letterSpacing: '0.04em' }}>{CHAR_NAMES[characterId]}</p>
          <p style={{ fontFamily: B, fontSize: '11px', color: 'var(--ivory-dim)', margin: '3px 0 0' }}>Choose a power variant</p>
        </div>
      </div>

      {/* Power options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        {opts.map(opt => {
          const accentColor = opt.type === 'space' ? '#818cf8' : opt.type === 'legendary' ? '#c084fc' : 'var(--gold)'
          const borderColor = opt.type === 'space' ? 'rgba(129,140,248,0.35)' : opt.type === 'legendary' ? 'rgba(192,132,252,0.35)' : 'rgba(201,162,39,0.3)'
          const glowColor = opt.type === 'space' ? 'rgba(129,140,248,0.18)' : opt.type === 'legendary' ? 'rgba(192,132,252,0.18)' : 'rgba(201,162,39,0.15)'
          return (
            <button
              key={opt.type}
              onClick={() => opt.available && onSelect(opt.type)}
              disabled={!opt.available}
              style={{
                padding: '14px 18px', borderRadius: '14px', textAlign: 'left',
                background: opt.available ? 'rgba(13,10,26,0.75)' : 'rgba(13,10,26,0.4)',
                border: `1.5px solid ${opt.available ? borderColor : 'rgba(201,162,39,0.1)'}`,
                cursor: opt.available ? 'pointer' : 'not-allowed',
                opacity: opt.available ? 1 : 0.45,
                transition: 'all 0.15s', backdropFilter: 'blur(12px)',
              }}
              onMouseEnter={e => {
                if (!opt.available) return
                const el = e.currentTarget as HTMLButtonElement
                el.style.transform = 'translateY(-2px)'
                el.style.boxShadow = `0 8px 24px ${glowColor}`
                el.style.borderColor = accentColor === 'var(--gold)' ? 'rgba(201,162,39,0.6)' : accentColor + '70'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.transform = 'none'
                el.style.boxShadow = 'none'
                el.style.borderColor = opt.available ? borderColor : 'rgba(201,162,39,0.1)'
              }}
            >
              {/* Label row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: D, fontSize: '13px', fontWeight: 700, color: accentColor, letterSpacing: '0.04em' }}>
                  {opt.label}
                </span>
                <span style={{ fontSize: '9px', fontWeight: 700, color: accentColor, opacity: 0.55, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: B }}>
                  {opt.rarities}
                </span>
                {!opt.available && <span style={{ fontSize: '9px', fontWeight: 700, color: '#8a7560', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: B }}>Soon</span>}
              </div>

              {/* Video / gif preview */}
              <PowerVideo charId={characterId} powerType={opt.type} />

              {/* Description */}
              <p style={{ fontFamily: B, fontSize: '11px', color: 'var(--ivory-dim)', margin: '10px 0 0', lineHeight: 1.55 }}>
                {opt.description}
              </p>

              {opt.available && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <span style={{ fontSize: '20px', opacity: 0.35, lineHeight: 1 }}>›</span>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 3: Look / variant selection (Street Fighter skin picker) ─────────────

function LookSelection({ characterId, powerType, picks, isConflicting, onPick, ownedCardIds }: {
  characterId: string
  powerType: PowerType
  picks: [CardVariant | null, CardVariant | null]
  isConflicting: (card: CardVariant) => boolean
  onPick: (card: CardVariant) => void
  ownedCardIds?: Set<string>
}) {
  const cards = getCardsForPower(characterId, powerType)
  const [hovered, setHovered] = useState<CardVariant | null>(null)

  const activePick = picks.find(p => p && cards.some(c => c.id === p.id)) ?? null
  const preview = hovered ?? activePick ?? cards[0] ?? null
  const previewPortrait = preview ? getVariantPortrait(characterId, powerType, preview.rarity) : ''
  const previewRm = preview ? RARITY_META[preview.rarity] : null
  const previewColor = previewRm?.color ?? '#94a3b8'
  const accentColor = powerType === 'space' ? '#818cf8' : powerType === 'legendary' ? '#c084fc' : 'var(--gold)'

  return (
    <div style={{
      width: '100%', maxWidth: '560px',
      background: 'rgba(4,2,12,0.97)',
      border: `2px solid ${accentColor === 'var(--gold)' ? 'rgba(201,162,39,0.35)' : accentColor + '55'}`,
      borderRadius: '14px',
      overflow: 'hidden',
      boxShadow: `0 0 60px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.05)`,
    }}>

      {/* Header bar */}
      <div style={{
        padding: '8px 16px',
        background: 'rgba(0,0,0,0.55)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: D, fontSize: '10px', letterSpacing: '0.22em', color: 'rgba(201,162,39,0.7)', textTransform: 'uppercase' }}>
          Select Skin
        </span>
        <span style={{ fontFamily: D, fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: previewColor, transition: 'color 0.2s' }}>
          {previewRm?.label ?? ''}
        </span>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Left panel — large character preview */}
        <div style={{
          width: '190px', flexShrink: 0,
          background: `linear-gradient(160deg, rgba(4,2,12,0.9) 0%, ${previewColor}14 100%)`,
          borderRight: `1px solid ${previewColor}28`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
          padding: '12px 8px 14px',
          minHeight: '270px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'background 0.25s',
        }}>
          {/* Scanlines */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)',
          }} />
          {/* Corner accent lines */}
          <div style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderTop: `2px solid ${previewColor}70`, borderLeft: `2px solid ${previewColor}70`, zIndex: 2, transition: 'border-color 0.25s' }} />
          <div style={{ position: 'absolute', bottom: 8, right: 8, width: 20, height: 20, borderBottom: `2px solid ${previewColor}70`, borderRight: `2px solid ${previewColor}70`, zIndex: 2, transition: 'border-color 0.25s' }} />

          {previewPortrait && (
            <img
              key={preview?.id}
              src={previewPortrait}
              alt={preview?.name ?? ''}
              style={{
                width: '160px', height: '190px',
                objectFit: 'contain', objectPosition: 'bottom',
                filter: `drop-shadow(0 4px 24px ${previewColor}55)`,
                position: 'relative', zIndex: 2,
                transition: 'filter 0.25s',
              }}
            />
          )}

          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginTop: '10px' }}>
            <p style={{ fontFamily: D, fontSize: '12px', fontWeight: 800, color: 'var(--ivory)', letterSpacing: '0.06em', margin: '0 0 3px', textTransform: 'uppercase' }}>
              {CHAR_NAMES[characterId]}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <div style={{ height: '1px', width: '14px', background: previewColor, opacity: 0.5, transition: 'background 0.25s' }} />
              <p style={{ fontFamily: B, fontSize: '9px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: previewColor, margin: 0, transition: 'color 0.25s' }}>
                {previewRm?.label ?? ''}
              </p>
              <div style={{ height: '1px', width: '14px', background: previewColor, opacity: 0.5, transition: 'background 0.25s' }} />
            </div>
          </div>
        </div>

        {/* Right panel — skin grid */}
        <div style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
          }}>
            {cards.map(card => {
              const isPicked = picks.some(p => p?.id === card.id)
              const conflicting = isConflicting(card)
              const isOwned = !ownedCardIds || ownedCardIds.has(card.id)
              const isLocked = !isOwned
              const rm = RARITY_META[card.rarity]
              const rarityColor = rm?.color ?? '#94a3b8'
              const rarityGlow = rm?.glow ?? 'rgba(148,163,184,0.3)'
              const portrait = getVariantPortrait(characterId, powerType, card.rarity)
              const isHov = hovered?.id === card.id

              return (
                <button
                  key={card.id}
                  onClick={() => !conflicting && !isLocked && onPick(card)}
                  onMouseEnter={() => !conflicting && !isLocked && setHovered(card)}
                  onMouseLeave={() => setHovered(null)}
                  disabled={conflicting || isLocked}
                  style={{
                    padding: 0, border: 'none', cursor: conflicting || isLocked ? 'not-allowed' : 'pointer',
                    borderRadius: '6px', overflow: 'hidden',
                    outline: isPicked
                      ? `3px solid ${rarityColor}`
                      : isHov
                        ? `2px solid ${rarityColor}80`
                        : isLocked
                          ? '2px solid rgba(255,255,255,0.04)'
                          : '2px solid rgba(255,255,255,0.07)',
                    outlineOffset: isPicked ? '2px' : '0px',
                    opacity: conflicting ? 0.18 : 1,
                    boxShadow: isPicked
                      ? `0 0 18px ${rarityGlow}, 0 0 5px ${rarityColor}50`
                      : isHov ? `0 0 10px ${rarityGlow}` : 'none',
                    background: 'rgba(0,0,0,0.6)',
                    position: 'relative',
                    transform: isHov && !conflicting && !isLocked && !isPicked ? 'scale(1.06)' : 'none',
                    transition: 'transform 0.1s, box-shadow 0.12s, outline 0.1s',
                    aspectRatio: '1',
                  }}
                >
                  <img
                    src={portrait}
                    alt={card.name}
                    draggable={false}
                    style={{
                      width: '100%', height: '100%', objectFit: 'contain',
                      objectPosition: 'center bottom', display: 'block',
                      filter: conflicting ? 'grayscale(1) brightness(0.15)' : isLocked ? 'grayscale(0.5) brightness(0.5)' : undefined,
                    }}
                  />

                  {/* Locked overlay */}
                  {isLocked && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.55)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '2px',
                    }}>
                      <span style={{ fontSize: '14px' }}>🔒</span>
                      <span style={{ fontFamily: D, fontSize: '6px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {card.rarity === 'legendary' ? 'Campaign' : card.rarity === 'space' ? 'Campaign' : 'Shop'}
                      </span>
                    </div>
                  )}

                  {/* Rarity label bar */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '3px 4px',
                    background: isPicked ? rarityColor : 'rgba(0,0,0,0.78)',
                    borderTop: `1px solid ${isPicked ? rarityColor : 'rgba(255,255,255,0.08)'}`,
                    transition: 'background 0.12s',
                  }}>
                    <p style={{
                      fontFamily: D, fontSize: '7px', fontWeight: 900,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: isPicked ? '#000' : rarityColor,
                      margin: 0, textAlign: 'center',
                      transition: 'color 0.12s',
                    }}>
                      {rm?.label ?? card.rarity}
                    </p>
                  </div>

                  {/* Selected checkmark badge */}
                  {isPicked && (
                    <div style={{
                      position: 'absolute', top: '3px', right: '3px',
                      background: rarityColor, borderRadius: '3px',
                      width: '14px', height: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontFamily: D, fontSize: '8px', fontWeight: 900, color: '#000', lineHeight: 1 }}>✓</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <p style={{ fontFamily: B, fontSize: '10px', color: 'rgba(255,255,255,0.18)', margin: 0, textAlign: 'center', letterSpacing: '0.08em' }}>
            {cards.length} skin{cards.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Slot preview ──────────────────────────────────────────────────────────────

function SlotPreview({ label, card, color }: { label: string; card: CardVariant | null; color: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p style={{ fontFamily: D, fontSize: '10px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color }}>
        {label}
      </p>
      <div style={{
        width: '72px', height: '100px', borderRadius: '10px',
        border: `2px ${card ? 'solid' : 'dashed'} ${card ? color : 'rgba(201,162,39,0.15)'}`,
        overflow: 'hidden', background: 'rgba(13,10,26,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s', boxShadow: card ? `0 0 16px ${color}44` : 'none',
        backdropFilter: 'blur(8px)',
      }}>
        {card
          ? <img src={card.image} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ color: 'rgba(201,162,39,0.15)', fontSize: '22px' }}>♟</span>
        }
      </div>
      <p style={{ fontFamily: B, fontSize: '11px', textAlign: 'center', lineHeight: 1.3, color: card ? 'var(--ivory)' : '#334155', maxWidth: '72px' }}>
        {card ? card.name : '—'}
      </p>
    </div>
  )
}
