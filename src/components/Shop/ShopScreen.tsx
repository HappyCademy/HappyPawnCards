import { useState } from 'react'
import { ALL_CARDS, type CardVariant, type Rarity } from '../../data/cards'
import { RARITIES } from '../../data/cards'

const D = 'var(--font-display)'
const B = 'var(--font-body)'

const PACK_COST = 100
const PACK_RARITIES: Rarity[] = ['baby', 'fullart', 'golden']

// Weighted rarity distribution for a pack (out of 100)
const RARITY_WEIGHTS: Record<string, number> = { baby: 50, fullart: 30, golden: 20 }

function pickRarity(): Rarity {
  const roll = Math.random() * 100
  let cum = 0
  for (const [key, weight] of Object.entries(RARITY_WEIGHTS)) {
    cum += weight
    if (roll < cum) return key as Rarity
  }
  return 'baby'
}

export function generatePackCards(): CardVariant[] {
  const pool = ALL_CARDS.filter(c => PACK_RARITIES.includes(c.rarity) && c.characterId !== 'pirate-queen')
  const picks: CardVariant[] = []
  for (let i = 0; i < 4; i++) {
    const rarity = pickRarity()
    const candidates = pool.filter(c => c.rarity === rarity)
    picks.push(candidates[Math.floor(Math.random() * candidates.length)])
  }
  return picks
}

// ── Booster pack reveal overlay ────────────────────────────────────────────────

function BoosterPackOpen({ cards, ownedBefore, onClose }: {
  cards: CardVariant[]
  ownedBefore: Set<string>
  onClose: () => void
}) {
  const [revealed, setReveal] = useState<Set<number>>(new Set())
  const [allRevealed, setAllRevealed] = useState(false)

  function revealCard(i: number) {
    const next = new Set(revealed)
    next.add(i)
    setReveal(next)
    if (next.size === cards.length) setAllRevealed(true)
  }

  function revealAll() {
    setReveal(new Set(cards.map((_, i) => i)))
    setAllRevealed(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(20px)' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <p style={{ fontFamily: D, fontSize: '22px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0, textShadow: '0 0 30px rgba(201,162,39,0.6)' }}>
          Booster Pack
        </p>
        <p style={{ fontFamily: B, fontSize: '12px', color: 'var(--ivory-dim)', marginTop: '6px', letterSpacing: '0.06em' }}>
          {allRevealed ? 'Pack opened!' : 'Tap cards to reveal'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', padding: '0 16px' }}>
        {cards.map((card, i) => {
          const isRevealed = revealed.has(i)
          const isNew = !ownedBefore.has(card.id)
          const rm = RARITIES.find(r => r.key === card.rarity)!

          return (
            <div
              key={i}
              onClick={() => !isRevealed && revealCard(i)}
              style={{
                width: '110px',
                cursor: isRevealed ? 'default' : 'pointer',
                position: 'relative',
                transform: isRevealed ? 'scale(1)' : 'scale(0.97)',
                transition: 'transform 0.25s ease',
              }}
            >
              {/* Card face */}
              <div style={{
                width: '110px', height: '154px',
                borderRadius: '10px',
                overflow: 'hidden',
                border: isRevealed ? `2px solid ${rm.color}` : '2px solid rgba(201,162,39,0.25)',
                boxShadow: isRevealed
                  ? `0 0 24px ${rm.glow}, 0 8px 32px rgba(0,0,0,0.6)`
                  : '0 4px 20px rgba(0,0,0,0.5)',
                position: 'relative',
                transition: 'border-color 0.3s, box-shadow 0.3s',
              }}>
                {isRevealed ? (
                  <img
                    src={card.image}
                    alt={card.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(135deg, #1a1030 0%, #0d0820 50%, #150d2a 100%)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>
                    <span style={{ fontSize: '32px', filter: 'drop-shadow(0 0 12px rgba(201,162,39,0.6))', color: 'var(--gold)' }}>♟</span>
                    <span style={{ fontFamily: B, fontSize: '9px', color: 'rgba(201,162,39,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      Tap to reveal
                    </span>
                  </div>
                )}
              </div>

              {/* NEW badge */}
              {isRevealed && isNew && (
                <div style={{
                  position: 'absolute', top: '-8px', right: '-8px',
                  background: '#4ade80', color: '#052e16',
                  fontFamily: D, fontSize: '9px', fontWeight: 900,
                  padding: '3px 7px', borderRadius: '10px',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  boxShadow: '0 0 12px rgba(74,222,128,0.6)',
                  zIndex: 2,
                }}>
                  NEW!
                </div>
              )}

              {/* Card name + rarity label */}
              {isRevealed && (
                <div style={{ textAlign: 'center', marginTop: '6px' }}>
                  <p style={{ fontFamily: D, fontSize: '9px', fontWeight: 700, color: 'var(--ivory)', margin: 0, lineHeight: 1.3, letterSpacing: '0.04em' }}>
                    {card.name}
                  </p>
                  <p style={{ fontFamily: B, fontSize: '9px', color: rm.color, margin: 0 }}>
                    {rm.label}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '28px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {!allRevealed && (
          <button
            onClick={revealAll}
            style={{
              padding: '10px 24px', borderRadius: '50px',
              background: 'rgba(13,10,26,0.8)', border: '1.5px solid rgba(201,162,39,0.35)',
              color: 'var(--gold)', fontFamily: B, fontSize: '12px', fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.06em',
            }}
          >
            Reveal All
          </button>
        )}
        {allRevealed && (
          <button
            onClick={onClose}
            style={{
              padding: '14px 40px', borderRadius: '50px',
              background: 'linear-gradient(135deg, #c9a227 0%, #f0c040 50%, #c9a227 100%)',
              border: '2px solid #f0c040',
              color: '#0d0a1a', fontFamily: D, fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase',
              boxShadow: '0 4px 24px rgba(201,162,39,0.5)',
            }}
          >
            ✓ Collect Cards
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main shop screen ──────────────────────────────────────────────────────────

interface Props {
  coins: number
  ownedCardIds: Set<string>
  onBuyPack: () => CardVariant[]
  onBack: () => void
}

export default function ShopScreen({ coins, ownedCardIds, onBuyPack, onBack }: Props) {
  const [openedPack, setOpenedPack] = useState<{ cards: CardVariant[]; ownedBefore: Set<string> } | null>(null)

  function handleBuy() {
    if (coins < PACK_COST) return
    const ownedBefore = new Set(ownedCardIds)
    const cards = onBuyPack()
    if (cards.length > 0) {
      setOpenedPack({ cards, ownedBefore })
    }
  }

  const canAfford = coins >= PACK_COST

  return (
    <div className="screen-bg min-h-screen flex flex-col items-center py-8 px-4">
      {/* Header */}
      <header style={{ width: '100%', maxWidth: '400px', marginBottom: '24px', textAlign: 'center', position: 'relative' }}>
        <button
          onClick={onBack}
          style={{
            position: 'absolute', left: 0, top: '4px',
            fontFamily: B, color: 'var(--ivory-dim)', fontSize: '13px', fontWeight: 600,
            background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.04em',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory-dim)' }}
        >
          ← Back
        </button>

        <img
          src="/images/logo.svg"
          alt="Happy Pawn Cards"
          style={{ height: 'clamp(40px, 8vw, 56px)', filter: 'drop-shadow(0 2px 12px rgba(201,162,39,0.45))', marginBottom: '6px' }}
        />
        <p style={{ fontFamily: B, color: 'var(--ivory-dim)', fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: '4px' }}>
          Card Shop
        </p>

        {/* Coin balance */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.35)',
          borderRadius: '20px', padding: '5px 14px', marginTop: '10px',
        }}>
          <span style={{ fontSize: '14px' }}>🪙</span>
          <span style={{ fontFamily: D, fontSize: '15px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.06em' }}>
            {coins.toLocaleString()}
          </span>
          <span style={{ fontFamily: B, fontSize: '10px', color: 'rgba(201,162,39,0.55)', letterSpacing: '0.04em' }}>coins</span>
        </div>
      </header>

      {/* Pack card */}
      <div style={{
        width: '100%', maxWidth: '340px',
        background: 'rgba(8,5,20,0.92)',
        border: '1.5px solid rgba(201,162,39,0.3)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 0 40px rgba(201,162,39,0.08), 0 16px 40px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(16px)',
      }}>
        {/* Pack illustration */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '8px',
          marginBottom: '20px', padding: '16px 0',
        }}>
          {(['golden', 'fullart', 'baby'] as Rarity[]).map((r, i) => {
            const rm = RARITIES.find(x => x.key === r)!
            return (
              <div key={r} style={{
                width: '60px', height: '84px',
                borderRadius: '7px',
                background: `linear-gradient(160deg, ${rm.glow} 0%, rgba(0,0,0,0.8) 100%)`,
                border: `2px solid ${rm.color}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 20px ${rm.glow}`,
                transform: `rotate(${(i - 1) * 5}deg) translateY(${Math.abs(i - 1) * -4}px)`,
                position: 'relative',
                zIndex: 3 - Math.abs(i - 1),
              }}>
                <span style={{ fontSize: '22px', filter: `drop-shadow(0 0 8px ${rm.color})` }}>♟</span>
              </div>
            )
          })}
        </div>

        <p style={{ fontFamily: D, fontSize: '18px', fontWeight: 700, color: 'var(--ivory)', textAlign: 'center', margin: '0 0 6px', letterSpacing: '0.06em' }}>
          Booster Pack
        </p>
        <p style={{ fontFamily: B, fontSize: '12px', color: 'var(--ivory-dim)', textAlign: 'center', margin: '0 0 16px', lineHeight: 1.5 }}>
          4 cards drawn from the Baby, Full Art &amp; Golden rarity pools.
        </p>

        {/* Rarity odds */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '20px' }}>
          {[
            { label: 'Baby', color: '#4ade80', chance: '50%' },
            { label: 'Full Art', color: '#60a5fa', chance: '30%' },
            { label: 'Golden', color: '#facc15', chance: '20%' },
          ].map(({ label, color, chance }) => (
            <div key={label} style={{
              padding: '4px 10px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}44`,
              textAlign: 'center',
            }}>
              <p style={{ fontFamily: D, fontSize: '8px', color, fontWeight: 700, margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
              <p style={{ fontFamily: B, fontSize: '10px', color: 'var(--ivory-dim)', margin: 0 }}>{chance}</p>
            </div>
          ))}
        </div>

        {/* Buy button */}
        <button
          onClick={handleBuy}
          disabled={!canAfford}
          style={{
            width: '100%', padding: '14px', borderRadius: '50px',
            background: canAfford
              ? 'linear-gradient(135deg, #c9a227 0%, #f0c040 50%, #c9a227 100%)'
              : 'rgba(13,10,26,0.5)',
            border: canAfford ? '2px solid #f0c040' : '2px solid rgba(255,255,255,0.08)',
            color: canAfford ? '#0d0a1a' : '#334155',
            fontFamily: D, fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em',
            cursor: canAfford ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase',
            boxShadow: canAfford ? '0 4px 24px rgba(201,162,39,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
          onMouseEnter={e => { if (canAfford) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none' }}
        >
          <span>🪙</span>
          <span>{PACK_COST} — Open Pack</span>
        </button>

        {!canAfford && (
          <p style={{ fontFamily: B, fontSize: '11px', color: 'rgba(248,113,113,0.6)', textAlign: 'center', marginTop: '8px' }}>
            Need {PACK_COST - coins} more coins — keep playing to earn!
          </p>
        )}
      </div>

      {/* How to earn coins */}
      <div style={{
        width: '100%', maxWidth: '340px', marginTop: '16px',
        background: 'rgba(8,5,20,0.6)',
        border: '1px solid rgba(201,162,39,0.12)',
        borderRadius: '14px', padding: '16px',
      }}>
        <p style={{ fontFamily: D, fontSize: '10px', color: 'rgba(201,162,39,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px' }}>
          How to earn coins
        </p>
        {[
          { icon: '⚔', label: 'Campaign Win', coins: '+80' },
          { icon: '🎮', label: 'VS Computer Win', coins: '+50' },
          { icon: '🤝', label: 'Draw', coins: '+20' },
          { icon: '♟', label: 'Any Loss', coins: '+15' },
        ].map(({ icon, label, coins: c }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ fontFamily: B, fontSize: '12px', color: 'var(--ivory-dim)' }}>{icon} {label}</span>
            <span style={{ fontFamily: D, fontSize: '12px', fontWeight: 700, color: 'var(--gold)' }}>{c}</span>
          </div>
        ))}
      </div>

      {/* Booster pack opening overlay */}
      {openedPack && (
        <BoosterPackOpen
          cards={openedPack.cards}
          ownedBefore={openedPack.ownedBefore}
          onClose={() => setOpenedPack(null)}
        />
      )}
    </div>
  )
}
