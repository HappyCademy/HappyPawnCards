import type { PieceSymbol, Color } from 'chess.js'
import { usePieceSet, pieceUrl } from '../../context/PieceSetContext'

interface Props {
  type: PieceSymbol
  color: Color
  cardImage?: string
}

export default function Piece({ type, color, cardImage }: Props) {
  const { pieceSet } = usePieceSet()

  if (cardImage) {
    const tint = color === 'w' ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.32)'
    return (
      <div style={{ position: 'relative', width: '78%', height: '78%', flexShrink: 0 }}>
        <img
          src={cardImage}
          alt={type}
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center bottom',
            display: 'block',
            userSelect: 'none',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: tint,
          mixBlendMode: 'normal',
          pointerEvents: 'none',
        }} />
      </div>
    )
  }

  return (
    <img
      src={pieceUrl(pieceSet, color, type)}
      alt={`${color}${type}`}
      draggable={false}
      style={{
        width: '88%',
        height: '88%',
        objectFit: 'contain',
        display: 'block',
        userSelect: 'none',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
      }}
    />
  )
}
