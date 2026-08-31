export type GameMode = 'vsComputer' | 'vsPlayer' | 'online' | 'campaign'

interface Props {
  onSelect: (mode: GameMode) => void
  isSignedIn: boolean
  onSignOut?: () => void
  userEmail?: string | null
  onCollection?: () => void
  onTestPowers?: () => void
}

const D = 'var(--font-display)'
const B = 'var(--font-body)'
const GOLD = 'var(--gold)'

export default function ModeSelectionScreen({ onSelect, isSignedIn, onSignOut, userEmail, onCollection, onTestPowers }: Props) {
  return (
    <div
      className="screen-bg min-h-screen flex flex-col items-center justify-center py-12 px-4"
    >
      {/* Auth badge */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isSignedIn ? (
          <>
            <span style={{ fontFamily: B, fontSize: '11px', color: 'var(--ivory-dim)' }}>{userEmail}</span>
            <button
              onClick={onSignOut}
              style={{
                fontFamily: B, fontSize: '11px', fontWeight: 700,
                color: 'rgba(138,117,96,0.7)', letterSpacing: '0.06em',
                background: 'none', border: 'none', cursor: 'pointer',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(138,117,96,0.7)' }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => onSelect('sign-in' as GameMode)}
            style={{
              fontFamily: B, fontSize: '11px', fontWeight: 700,
              color: 'var(--gold)', letterSpacing: '0.06em',
              background: 'rgba(201,162,39,0.08)',
              border: '1px solid rgba(201,162,39,0.3)',
              borderRadius: '8px', padding: '5px 12px',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,162,39,0.15)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,162,39,0.08)' }}
          >
            Sign In
          </button>
        )}
      </div>

      <header className="mb-10 text-center">
        <img
          src="/images/logo.svg"
          alt="Happy Pawn Cards"
          style={{
            height: 'clamp(64px, 12vw, 120px)',
            filter: 'drop-shadow(0 4px 24px rgba(201,162,39,0.45))',
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
          icon="⚔️"
          title="Campaign"
          description="Defeat each champion to claim their card"
          color="#e8a838"
          glow="rgba(232,168,56,0.4)"
          requiresAuth={!isSignedIn}
          onClick={() => onSelect('campaign')}
        />
        <ModeCard
          image="/images/robi/robi-letsplay.png"
          title="VS Computer"
          description="Quick match against the AI"
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
          requiresAuth={!isSignedIn}
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

      {onCollection && (
        <button
          onClick={onCollection}
          style={{
            marginTop: '28px',
            fontFamily: D, fontSize: '11px', fontWeight: 700,
            color: 'rgba(201,162,39,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase',
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(201,162,39,0.6)' }}
        >
          ♟ My Collection
        </button>
      )}

      {onTestPowers && (
        <button
          onClick={onTestPowers}
          style={{
            marginTop: '12px',
            fontFamily: B, fontSize: '10px', fontWeight: 600,
            color: 'rgba(138,117,96,0.4)', letterSpacing: '0.1em',
            background: 'none', border: 'none', cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(138,117,96,0.8)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(138,117,96,0.4)' }}
        >
          🧪 Test Powers
        </button>
      )}

      <p style={{
        marginTop: '20px',
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
  icon, image, title, description, color, glow, comingSoon, requiresAuth, onClick,
}: {
  icon?: string
  image?: string
  title: string
  description: string
  color: string
  glow: string
  comingSoon?: boolean
  requiresAuth?: boolean
  onClick: () => void
}) {
  const dimmed = comingSoon
  return (
    <button
      onClick={onClick}
      disabled={comingSoon}
      className="flex-1 flex flex-col items-center gap-4 focus:outline-none transition-all duration-200 group"
      style={{
        padding: '32px 24px',
        borderRadius: '20px',
        background: dimmed ? 'rgba(13,10,26,0.5)' : 'var(--glass-bg)',
        border: `1.5px solid ${dimmed ? 'rgba(138,117,96,0.2)' : 'rgba(201,162,39,0.3)'}`,
        backdropFilter: 'blur(14px)',
        cursor: dimmed ? 'default' : 'pointer',
        opacity: dimmed ? 0.45 : 1,
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (dimmed) return
        const el = e.currentTarget as HTMLButtonElement
        el.style.transform = 'translateY(-5px)'
        el.style.boxShadow = `0 20px 50px ${glow}, 0 0 0 1px ${color}55`
        el.style.borderColor = color + '70'
      }}
      onMouseLeave={e => {
        if (dimmed) return
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
      {requiresAuth && !comingSoon && (
        <span style={{
          position: 'absolute', top: '12px', right: '12px',
          fontSize: '14px',
        }}>
          🔒
        </span>
      )}

      {image
        ? <img src={image} alt={title} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} style={{ width: '96px', height: '96px', objectFit: 'contain', filter: 'drop-shadow(0 4px 16px rgba(201,162,39,0.3))' }} />
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

      {!comingSoon && !requiresAuth && (
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
      {requiresAuth && !comingSoon && (
        <span style={{
          marginTop: '4px',
          fontFamily: 'var(--font-display)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(201,162,39,0.5)',
        }}>
          Sign in to play
        </span>
      )}
    </button>
  )
}
