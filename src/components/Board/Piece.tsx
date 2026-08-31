import type { PieceSymbol, Color } from 'chess.js'
import { usePieceSet, pieceUrl } from '../../context/PieceSetContext'

interface Props {
  type: PieceSymbol
  color: Color
  cardImage?: string
  showSpecial?: boolean
}

export default function Piece({ type, color, cardImage, showSpecial }: Props) {
  const { pieceSet } = usePieceSet()

  if (cardImage && showSpecial) {
    return (
      <img
        src={cardImage}
        alt={type}
        draggable={false}
        style={{
          width: '78%',
          height: '78%',
          objectFit: 'contain',
          objectPosition: 'center bottom',
          display: 'block',
          userSelect: 'none',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
        }}
      />
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
