const D = "'Cinzel', Georgia, serif"
const B = "'Nunito', system-ui, sans-serif"

interface Props {
  onSelectCards: () => void
  onSelectPuzzles: () => void
  onSelectBotChallenge: () => void
  tokenBalance: number | null
  userEmail: string | null
}

export default function PlayZoneScreen({ onSelectCards, onSelectPuzzles, onSelectBotChallenge, tokenBalance, userEmail }: Props) {
  return (
    <div
      className="min-h-screen game-bg flex flex-col items-center justify-center px-6 py-12"
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '52px' }}>
        <img
          src="/images/logo.svg"
          alt="Happy Pawn"
          style={{
            height: 'clamp(64px, 12vw, 96px)',
            marginBottom: '20px',
            filter: 'drop-shadow(0 0 24px rgba(201,162,39,0.5))',
          }}
        />
        <h1 style={{
          fontFamily: D,
          color: 'var(--gold)',
          fontSize: 'clamp(18px, 5vw, 30px)',
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          margin: '0 0 10px',
        }}>
          Happy Pawn Play Zone
        </h1>
        <p style={{ fontFamily: B, color: 'var(--ivory-dim)', fontSize: '13px', opacity: 0.8, margin: '0 0 16px' }}>
          Choose your game
        </p>
        {tokenBalance !== null && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(201,162,39,0.12)',
            border: '1px solid rgba(201,162,39,0.3)',
            borderRadius: '50px',
            padding: '6px 16px',
          }}>
            <img src="/images/token.png" alt="token" style={{ width: '18px', height: '18px' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <span style={{ fontFamily: D, color: 'var(--gold)', fontSize: '13px', fontWeight: 700 }}>
              {tokenBalance} token{tokenBalance !== 1 ? 's' : ''}
            </span>
            {userEmail && (
              <span style={{ fontFamily: B, color: 'var(--ivory-dim)', fontSize: '11px', opacity: 0.6 }}>
                · {userEmail}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tiles */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
        width: '100%',
        maxWidth: '960px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {/* Happy Pawn Cards */}
        <ZoneTile
          thumbnail="/images/playzone/happy-pawn-cards.webp"
          title="Happy Pawn Cards"
          description="Play chess with character powers. Campaign, VS Computer, VS Player, or Online."
          accentColor="#c9a227"
          buttonBg="linear-gradient(135deg, #c9a227 0%, #f0c040 100%)"
          buttonColor="#0d0a1a"
          borderColor="rgba(201,162,39,0.35)"
          hoverBorderColor="rgba(201,162,39,0.65)"
          buttonLabel="Play Now →"
          onClick={onSelectCards}
        />

        {/* Chess Puzzles */}
        <ZoneTile
          thumbnail="/images/playzone/chess-puzzles.webp"
          title="Chess Puzzles"
          description="Train your tactics with rated puzzles. Streaks, themes & daily challenges powered by Lichess."
          accentColor="#7ba7f0"
          buttonBg="linear-gradient(135deg, #4a6eb5 0%, #7ba7f0 100%)"
          buttonColor="#ffffff"
          borderColor="rgba(80,120,200,0.35)"
          hoverBorderColor="rgba(80,120,200,0.65)"
          buttonLabel="Solve Puzzles →"
          onClick={onSelectPuzzles}
        />

        {/* Bot Challenge */}
        <ZoneTile
          thumbnail="/images/playzone/bot-challenge.webp"
          title="Bot Challenge"
          description="Battle 8 character bots — from Happy Pawn the eager beginner to the mighty Black King. Can you beat them all?"
          accentColor="#4ade80"
          buttonBg="linear-gradient(135deg, #16a34a 0%, #4ade80 100%)"
          buttonColor="#0d0a1a"
          borderColor="rgba(74,222,128,0.3)"
          hoverBorderColor="rgba(74,222,128,0.6)"
          buttonLabel="Challenge Bots →"
          onClick={onSelectBotChallenge}
        />
      </div>

      <p style={{
        fontFamily: B,
        color: 'rgba(138,117,96,0.4)',
        fontSize: '11px',
        marginTop: '48px',
        letterSpacing: '0.06em',
      }}>
        Puzzles powered by Lichess
      </p>
    </div>
  )
}

function ZoneTile({
  thumbnail, title, description,
  accentColor, buttonBg, buttonColor,
  borderColor, hoverBorderColor,
  buttonLabel, onClick,
}: {
  thumbnail: string
  title: string
  description: string
  accentColor: string
  buttonBg: string
  buttonColor: string
  borderColor: string
  hoverBorderColor: string
  buttonLabel: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 1 260px',
        minWidth: '240px',
        maxWidth: '300px',
        background: 'rgba(13,10,26,0.7)',
        border: `1.5px solid ${borderColor}`,
        borderRadius: '20px',
        padding: '0',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        overflow: 'hidden',
        transition: 'transform 0.18s, border-color 0.18s, box-shadow 0.18s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.transform = 'translateY(-5px)'
        el.style.borderColor = hoverBorderColor
        el.style.boxShadow = `0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px ${hoverBorderColor}`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.transform = ''
        el.style.borderColor = borderColor
        el.style.boxShadow = ''
      }}
    >
      <div style={{ width: '100%', height: '160px', overflow: 'hidden' }}>
        <img
          src={thumbnail}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
      <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h2 style={{
          fontFamily: D,
          color: accentColor,
          fontSize: '18px',
          fontWeight: 700,
          letterSpacing: '0.04em',
          margin: '0 0 10px',
        }}>
          {title}
        </h2>
        <p style={{
          fontFamily: B,
          color: 'var(--ivory-dim)',
          fontSize: '13px',
          lineHeight: 1.6,
          margin: '0 0 20px',
          flex: 1,
        }}>
          {description}
        </p>
        <span style={{
          display: 'inline-block',
          padding: '9px 22px',
          borderRadius: '50px',
          background: buttonBg,
          color: buttonColor,
          fontFamily: D,
          fontWeight: 700,
          fontSize: '12px',
          letterSpacing: '0.07em',
          alignSelf: 'flex-start',
        }}>
          {buttonLabel}
        </span>
      </div>
    </button>
  )
}
