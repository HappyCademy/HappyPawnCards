export type GameMode = 'vsComputer' | 'vsPlayer' | 'online'

interface Props {
  onSelect: (mode: GameMode) => void
}

const D = 'var(--font-display)'
const B = 'var(--font-body)'
const GOLD = 'var(--gold)'

export default function ModeSelectionScreen({ onSelect }: Props) {
  return (
    <div
      className="screen-bg min-h-screen flex flex-col items-center justify-center py-12 px-4"
    >
      <header className="mb-10 text-center">
        <img
          src="/images/banner.png"
          alt="Happy Pawn Cards"
          style={{
            width: 'clamp(320px, 80vw, 780px)',
            borderRadius: '16px',
            filter: 'drop-shadow(0 4px 32px rgba(0,0,0,0.6))',
            marginBottom: '20px',
          }}
        />
        <p style={{
          fontFamily: B,
          color: 'var(--ivory-dim)',
          fontSize: '12px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          opacity: 0.8,
        }}>
          Choose your game mode
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
        <ModeCard
          image="/images/robi/robi-letsplay.png"
          title="VS Computer"
          description="Play against the AI opponent"
          color="#c9a227"
          glow="rgba(201,162,39,0.4)"
          onClick={() => onSelect('vsComputer')}
        />
        <ModeCard
          icon="🤝"
          title="VS Player"
          description="Pass & play on the same device"
          color="#a08fff"
          glow="rgba(160,143,255,0.35)"
          onClick={() => onSelect('vsPlayer')}
        />
        <ModeCard
          icon="🌐"
          title="Online"
          description="Play with a friend online"
          color="#8a7560"
          glow="rgba(138,117,96,0.2)"
          comingSoon
          onClick={() => {}}
        />
      </div>

      <p style={{
        marginTop: '48px',
        fontFamily: D,
        fontSize: '10px',
        color: 'rgba(201,162,39,0.35)',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
      }}>
        The Chess Card Game
      </p>
    </div>
  )
}

function ModeCard({
  icon, image, title, description, color, glow, comingSoon, onClick,
}: {
  icon?: string
  image?: string
  title: string
  description: string
  color: string
  glow: string
  comingSoon?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={comingSoon}
      className="flex-1 flex flex-col items-center gap-4 focus:outline-none transition-all duration-200 group"
      style={{
        padding: '32px 24px',
        borderRadius: '20px',
        background: comingSoon ? 'rgba(13,10,26,0.5)' : 'var(--glass-bg)',
        border: `1.5px solid ${comingSoon ? 'rgba(138,117,96,0.2)' : 'rgba(201,162,39,0.3)'}`,
        backdropFilter: 'blur(14px)',
        cursor: comingSoon ? 'default' : 'pointer',
        opacity: comingSoon ? 0.45 : 1,
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (comingSoon) return
        const el = e.currentTarget as HTMLButtonElement
        el.style.transform = 'translateY(-5px)'
        el.style.boxShadow = `0 20px 50px ${glow}, 0 0 0 1px ${color}55`
        el.style.borderColor = color + '70'
      }}
      onMouseLeave={e => {
        if (comingSoon) return
        const el = e.currentTarget as HTMLButtonElement
        el.style.transform = 'none'
        el.style.boxShadow = 'none'
        el.style.borderColor = 'rgba(201,162,39,0.3)'
      }}
    >
      {comingSoon && (
        <span style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'rgba(138,117,96,0.15)',
          border: '1px solid rgba(138,117,96,0.3)',
          borderRadius: '6px', padding: '2px 8px',
          fontSize: '10px', fontWeight: 700, color: '#8a7560',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          fontFamily: 'var(--font-body)',
        }}>
          Soon
        </span>
      )}

      {image
        ? <img src={image} alt={title} style={{ width: '96px', height: '96px', objectFit: 'contain', filter: 'drop-shadow(0 4px 16px rgba(201,162,39,0.3))' }} />
        : <span style={{ fontSize: '48px', lineHeight: 1, filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.5))' }}>{icon}</span>
      }

      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: '16px',
        fontWeight: 600,
        color: comingSoon ? 'var(--ivory-dim)' : 'var(--ivory)',
        letterSpacing: '0.06em',
      }}>
        {title}
      </span>

      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: '12px',
        color: '#60504a',
        textAlign: 'center',
        lineHeight: 1.5,
      }}>
        {description}
      </span>

      {!comingSoon && (
        <span style={{
          marginTop: '4px',
          fontFamily: 'var(--font-display)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: GOLD,
        }}>
          Play →
        </span>
      )}
    </button>
  )
}
