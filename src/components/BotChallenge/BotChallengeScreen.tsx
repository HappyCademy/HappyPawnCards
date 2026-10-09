import { useState } from 'react'
import type { BotCharacterDef } from '../../data/botCharacters'
import { BOT_CHARACTERS } from '../../data/botCharacters'

const D = "'Cinzel', Georgia, serif"
const B = "'Nunito', system-ui, sans-serif"

interface Props {
  onSelect: (bot: BotCharacterDef) => void
  onBack: () => void
}

function StarRating({ level }: { level: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} style={{ fontSize: '8px', color: i < level ? '#f59e0b' : 'rgba(255,255,255,0.15)' }}>
          ★
        </span>
      ))}
    </div>
  )
}

function BotTile({ bot, onClick }: { bot: BotCharacterDef; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? `linear-gradient(160deg, ${bot.themeColor}22 0%, rgba(13,10,26,0.95) 100%)`
          : `linear-gradient(160deg, ${bot.themeColor}11 0%, rgba(13,10,26,0.85) 100%)`,
        border: `1.5px solid ${hovered ? bot.themeColor + '88' : bot.themeColor + '33'}`,
        borderRadius: '16px',
        padding: '0',
        cursor: 'pointer',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-4px) scale(1.02)' : 'none',
        boxShadow: hovered ? `0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px ${bot.themeColor}44` : '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'transform 0.18s, border-color 0.18s, background 0.18s, box-shadow 0.18s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        width: '100%',
      }}
    >
      {/* Portrait */}
      <div style={{ width: '100%', aspectRatio: '3/4', position: 'relative', overflow: 'hidden', maxHeight: '160px' }}>
        <img
          src={bot.portraitSrc}
          alt={bot.displayName}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            display: 'block',
            filter: hovered ? 'brightness(1.1)' : 'brightness(0.9)',
            transition: 'filter 0.18s',
          }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
        {/* Level badge */}
        <div style={{
          position: 'absolute', top: '8px', left: '8px',
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          border: `1px solid ${bot.themeColor}66`,
          borderRadius: '20px', padding: '2px 8px',
          fontFamily: D, fontSize: '10px', color: bot.themeColor,
          letterSpacing: '0.05em', fontWeight: 700,
        }}>
          LVL {bot.level}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 10px 14px', width: '100%' }}>
        <p style={{
          fontFamily: D, color: bot.themeColor,
          fontSize: '13px', fontWeight: 700,
          letterSpacing: '0.04em', margin: '0 0 4px',
        }}>
          {bot.displayName}
        </p>
        <StarRating level={bot.level} />
        <p style={{
          fontFamily: B, color: 'rgba(220,205,185,0.6)',
          fontSize: '10px', lineHeight: 1.4, margin: '6px 0 10px',
        }}>
          {bot.tagline}
        </p>
        <span style={{
          display: 'inline-block',
          padding: '5px 14px',
          borderRadius: '20px',
          background: hovered ? bot.themeColor : 'transparent',
          border: `1px solid ${bot.themeColor}88`,
          color: hovered ? '#0d0a1a' : bot.themeColor,
          fontFamily: D, fontWeight: 700, fontSize: '10px',
          letterSpacing: '0.06em',
          transition: 'background 0.18s, color 0.18s',
        }}>
          Challenge!
        </span>
      </div>
    </button>
  )
}

export default function BotChallengeScreen({ onSelect, onBack }: Props) {
  return (
    <div className="min-h-screen game-bg flex flex-col items-center px-4 py-10">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <p style={{
          fontFamily: D, color: 'var(--gold)', fontSize: '11px',
          letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 8px',
        }}>
          Bot Challenge
        </p>
        <h1 style={{
          fontFamily: D, color: 'var(--ivory)',
          fontSize: 'clamp(20px, 5vw, 32px)', fontWeight: 800,
          letterSpacing: '0.06em', margin: '0 0 10px',
        }}>
          Choose Your Opponent
        </h1>
        <p style={{ fontFamily: B, color: 'var(--ivory-dim)', fontSize: '13px', opacity: 0.75, margin: 0 }}>
          9 characters — each stronger than the last. Can you beat them all?
        </p>
      </div>

      {/* Character grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '12px',
        width: '100%',
        maxWidth: '720px',
      }}>
        {BOT_CHARACTERS.map(bot => (
          <BotTile key={bot.characterId} bot={bot} onClick={() => onSelect(bot)} />
        ))}
      </div>

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          marginTop: '28px',
          fontFamily: B, color: 'var(--ivory-dim)',
          background: 'none', border: 'none',
          cursor: 'pointer', fontSize: '13px',
        }}
      >
        ← Play Zone
      </button>
    </div>
  )
}
