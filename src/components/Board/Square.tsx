import type { Square as ChessSquare } from 'chess.js'
import type { BoardPiece } from '../../hooks/useChessGame'
import Piece from './Piece'

interface Props {
  square: ChessSquare
  piece: BoardPiece | null
  isLight: boolean
  isSelected: boolean
  isValidTarget: boolean
  isLastMove: boolean
  isKingInCheck: boolean
  isUnipopPath: boolean
  isUnipopCapture: boolean
  isShootTarget: boolean
  isChessbeardSelectable: boolean
  isChessbeardTarget: boolean
  isCrystalQueenVulnerable?: boolean
  isCrystalQueenProtected?: boolean
  isSpaceChessbeardFrozen?: boolean
  isSpaceHappyPawnTarget?: boolean
  isDraggingFrom?: boolean
  isDragOver?: boolean
  isUnipopStepTarget?: boolean
  isRespawning?: boolean
  showCoords: boolean
  rank?: string
  file?: string
  cardImage?: string
  showSpecial?: boolean
  specialPieceColor?: 'w' | 'b'
}

export default function Square({
  square, piece, isLight, isSelected, isValidTarget,
  isLastMove, isKingInCheck, isUnipopPath, isUnipopCapture, isShootTarget,
  isChessbeardSelectable, isChessbeardTarget,
  isCrystalQueenVulnerable = false, isCrystalQueenProtected = false,
  isSpaceChessbeardFrozen = false, isSpaceHappyPawnTarget = false,
  isDraggingFrom = false, isDragOver = false,
  isUnipopStepTarget = false, isRespawning = false,
  showCoords, rank, file, cardImage, showSpecial = false, specialPieceColor,
}: Props) {
  let bg = isLight ? '#f0d9b5' : '#b58863'

  if (isSelected)         bg = '#f6f669'
  else if (isUnipopPath)  bg = isLight ? '#d8c4f0' : '#b89ad8'
  else if (isLastMove)    bg = isLight ? '#cdd26a' : '#aaa23a'
  else if (isKingInCheck) bg = '#ff6b6b'

  return (
    <div
      data-square={square}
      className="relative flex items-center justify-center cursor-pointer overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      {showCoords && rank && (
        <span className="absolute top-0.5 left-1 text-xs font-bold leading-none"
          style={{ color: isLight ? '#b58863' : '#f0d9b5', fontSize: '10px' }}>
          {rank}
        </span>
      )}
      {showCoords && file && (
        <span className="absolute bottom-0.5 right-1 text-xs font-bold leading-none"
          style={{ color: isLight ? '#b58863' : '#f0d9b5', fontSize: '10px' }}>
          {file}
        </span>
      )}

      {/* Unipop path step (phases 0 & 1): purple dot — works on any piece including friendlies */}
      {isUnipopStepTarget && (
        <div className="absolute rounded-full pointer-events-none"
          style={{ width: '32%', height: '32%', backgroundColor: 'rgba(139,92,246,0.7)', boxShadow: '0 0 8px rgba(139,92,246,0.6)' }} />
      )}

      {/* Valid move dot (empty square) */}
      {isValidTarget && !piece && !isShootTarget && !isChessbeardSelectable && !isChessbeardTarget && !isUnipopStepTarget && (
        <div className="absolute rounded-full"
          style={{ width: '33%', height: '33%', backgroundColor: 'rgba(0,0,0,0.2)' }} />
      )}

      {/* Valid capture ring */}
      {isValidTarget && piece && !isShootTarget && !isChessbeardSelectable && !isChessbeardTarget && !isUnipopStepTarget && (
        <div className="absolute inset-0"
          style={{ boxShadow: 'inset 0 0 0 4px rgba(0,0,0,0.25)', borderRadius: '50%', margin: '-2px' }} />
      )}

      {/* Robin Rook shoot target highlight */}
      {isShootTarget && (
        <div className="absolute inset-0"
          style={{ backgroundColor: 'rgba(249,115,22,0.35)', boxShadow: 'inset 0 0 0 3px rgba(249,115,22,0.8)' }} />
      )}

      {/* Chessbeard: own piece selectable for sacrifice */}
      {isChessbeardSelectable && (
        <div className="absolute inset-0"
          style={{ backgroundColor: 'rgba(185,28,28,0.28)', boxShadow: 'inset 0 0 0 3px rgba(239,68,68,0.85)' }} />
      )}

      {/* Chessbeard: opponent piece to destroy */}
      {isChessbeardTarget && (
        <div className="absolute inset-0"
          style={{ backgroundColor: 'rgba(220,38,38,0.42)', boxShadow: 'inset 0 0 0 3px rgba(185,28,28,0.9)' }} />
      )}

      {/* Crystal Queen: vulnerable — danger ring */}
      {isCrystalQueenVulnerable && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: 'inset 0 0 0 3px rgba(239,68,68,0.9)', backgroundColor: 'rgba(239,68,68,0.15)' }} />
      )}

      {/* Crystal Queen: protected — crystal shimmer */}
      {isCrystalQueenProtected && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: 'inset 0 0 0 3px rgba(168,85,247,0.7)', backgroundColor: 'rgba(168,85,247,0.08)' }} />
      )}

      {/* Unipop capture warning: red overlay on enemy in path */}
      {isUnipopCapture && (
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(220,38,38,0.45)' }} />
      )}

      {/* Drag-over drop target ring */}
      {isDragOver && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: 'inset 0 0 0 3px rgba(255,255,255,0.75)' }} />
      )}

      {/* Space Chessbeard: this piece is frozen for opponent */}
      {isSpaceChessbeardFrozen && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: 'rgba(99,102,241,0.22)', boxShadow: 'inset 0 0 0 3px rgba(129,140,248,0.9)' }} />
      )}

      {/* Space Happy Pawn: empty placement target */}
      {isSpaceHappyPawnTarget && !piece && (
        <div className="absolute rounded-full"
          style={{ width: '33%', height: '33%', backgroundColor: 'rgba(74,222,128,0.5)' }} />
      )}

      {/* Respawn dirt effect */}
      {isRespawning && (
        <div className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: '45%',
            background: 'linear-gradient(to top, rgba(80,45,15,0.75), transparent)',
            animation: 'dirt-rise 1.4s ease-out both',
          }}
        />
      )}

      {/* Special piece pip — top-right corner */}
      {specialPieceColor && !showSpecial && (
        <div className="absolute pointer-events-none" style={{
          top: '3px', right: '3px',
          width: '7px', height: '7px',
          borderRadius: '50%',
          background: specialPieceColor === 'w' ? 'rgba(251,191,36,0.95)' : 'rgba(192,132,252,0.95)',
          boxShadow: specialPieceColor === 'w'
            ? '0 0 4px rgba(251,191,36,0.7)'
            : '0 0 4px rgba(192,132,252,0.7)',
          zIndex: 5,
        }} />
      )}

      {piece && (
        <div style={{
          opacity: isDraggingFrom ? 0.25 : 1,
          animation: isRespawning ? 'pawn-rise 1.2s ease-out both' : undefined,
        }}>
          <Piece
            type={piece.type}
            color={piece.color}
            cardImage={cardImage}
            showSpecial={showSpecial}
          />
        </div>
      )}
    </div>
  )
}
