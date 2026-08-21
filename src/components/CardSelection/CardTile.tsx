import type { CardVariant } from '../../data/cards'
import { RARITIES } from '../../data/cards'

interface Props {
  card: CardVariant
  selectionIndex: 1 | 2 | null
  isConflicting?: boolean
  isComingSoon?: boolean
  onClick: () => void   // always opens the preview modal
}

export default function CardTile({ card, selectionIndex, isConflicting = false, isComingSoon = false, onClick }: Props) {
  const isSelected = selectionIndex !== null
  const rarityMeta = RARITIES.find(r => r.key === card.rarity)!
  const pickColor = selectionIndex === 1 ? '#facc15' : '#60a5fa'

  return (
    <button
      onClick={onClick}
      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '100%' }}
      className="relative group focus:outline-none flex flex-col items-center"
    >
      <div
        className="relative overflow-hidden transition-all duration-200"
        style={{
          borderRadius: '10px',
          opacity: isConflicting ? 0.35 : 1,
          boxShadow: isSelected
            ? `0 0 0 3px ${pickColor}, 0 8px 24px ${pickColor}66`
            : `0 0 0 1.5px ${rarityMeta.color}44, 0 4px 12px rgba(0,0,0,0.5)`,
          transform: isSelected ? 'scale(1.05)' : undefined,
        }}
      >
        <img
          src={card.image}
          alt={card.name}
          draggable={false}
          style={{ display: 'block', width: '100%', height: 'auto' }}
          className={`transition-all duration-200 ${!isSelected && !isConflicting ? 'group-hover:brightness-110 group-hover:scale-[1.02]' : ''}`}
        />

        {/* Conflicting piece overlay */}
        {isConflicting && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-end pb-4"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          >
            <span className="font-bold text-center px-2"
              style={{ fontSize: '10px', color: '#f87171', letterSpacing: '0.06em' }}>
              SAME PIECE
            </span>
          </div>
        )}

        {/* Coming soon overlay */}
        {isComingSoon && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-end pb-4"
            style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(1px)' }}
          >
            <span className="text-white font-bold text-center leading-tight px-2"
              style={{ fontSize: '11px', textShadow: '0 1px 4px rgba(0,0,0,0.8)', letterSpacing: '0.05em' }}>
              POWER
            </span>
            <span className="font-bold text-center leading-tight px-2"
              style={{ fontSize: '10px', color: '#facc15', letterSpacing: '0.08em' }}>
              COMING SOON
            </span>
          </div>
        )}

        {isSelected && (
          <div
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow"
            style={{ backgroundColor: pickColor, color: '#1a1a2e' }}
          >
            {selectionIndex}
          </div>
        )}
      </div>

      <p
        className="mt-1.5 text-center text-xs font-semibold leading-tight w-full"
        style={{ color: isSelected ? pickColor : '#94a3b8' }}
      >
        {card.name}
      </p>
    </button>
  )
}
