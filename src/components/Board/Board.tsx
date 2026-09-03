import { useState, useRef } from 'react'
import type { Square as ChessSquare, PieceSymbol, Color } from 'chess.js'
import type { BoardPiece, GameState, GameActions } from '../../hooks/useChessGame'
import type { CardVariant } from '../../data/cards'
import Piece from './Piece'
import {
  CARD_POWERS, BABY_PIECE_IMAGES,
  UNIPOP_PIECE_IMAGE, ROBIN_ROOK_PIECE_IMAGE, PUZZLE_PETE_PIECE_IMAGE,
  BLACK_KING_PIECE_IMAGE, CRYSTAL_QUEEN_PIECE_IMAGE, PIRATE_QUEEN_PIECE_IMAGE,
  HAPPY_PAWN_PIECE_IMAGE, KINGS_GUARD_PIECE_IMAGE,
  GENERAL_GAMBIT_PIECE_IMAGE,
} from '../../data/powers'
import SquareCell from './Square'
import RookChoiceMenu from './RookChoiceMenu'
import PromotionMenu from './PromotionMenu'
import FireTrail from '../animations/FireTrail'
import ArrowShot from '../animations/ArrowShot'

interface Props {
  board: (BoardPiece | null)[][]
  selectedSquare: GameState['selectedSquare']
  validTargets: GameState['validTargets']
  lastMove: GameState['lastMove']
  isCheck: GameState['isCheck']
  turn: GameState['turn']
  status: GameState['status']
  unipopState: GameState['unipopState']
  unipopPathCaptures: GameState['unipopPathCaptures']
  rookChoiceSquare: GameState['rookChoiceSquare']
  isRookShootMode: GameState['isRookShootMode']
  fireTrailSquares: GameState['fireTrailSquares']
  arrowShot: GameState['arrowShot']
  isChessbeardSelectMode: GameState['isChessbeardSelectMode']
  chessbeardSacrificeSquare: GameState['chessbeardSacrificeSquare']
  onSquareClick: GameActions['onSquareClick']
  onRookChoice: GameActions['onRookChoice']
  playerCards: CardVariant[]
  aiCards?: CardVariant[]
  crystalQueenVulnerable?: boolean
  respawnedSquares?: ChessSquare[]
  spaceChessbeardFrozenSquare?: ChessSquare | null
  isSpaceChessbeardFreezeMode?: boolean
  isSpaceHappyPawnPlaceMode?: boolean
  legendaryHappyPawnPromoteSquare?: ChessSquare | null
  onLegendaryHappyPawnPromote?: (piece: PieceSymbol) => void
  showSpecialPieces?: boolean
  onSpecialPieceClick?: (card: CardVariant | null) => void
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

export default function Board({
  board, selectedSquare, validTargets, lastMove,
  isCheck, turn, status, unipopState, unipopPathCaptures,
  rookChoiceSquare, isRookShootMode, fireTrailSquares, arrowShot,
  isChessbeardSelectMode, chessbeardSacrificeSquare,
  onSquareClick, onRookChoice, playerCards, aiCards = [],
  crystalQueenVulnerable = false, respawnedSquares = [] as ChessSquare[],
  spaceChessbeardFrozenSquare = null,
  isSpaceChessbeardFreezeMode = false,
  isSpaceHappyPawnPlaceMode = false,
  legendaryHappyPawnPromoteSquare = null,
  onLegendaryHappyPawnPromote,
  showSpecialPieces = false,
  onSpecialPieceClick,
}: Props) {
  function buildPieceCardMap(cards: CardVariant[]): Partial<Record<PieceSymbol, CardVariant>> {
    const map: Partial<Record<PieceSymbol, CardVariant>> = {}
    for (const card of cards) {
      const power = CARD_POWERS[card.characterId]
      if (!power) continue
      if (card.characterId === 'general-gambit') { map['p'] = card; continue }
      if (!power.pieceSymbol) continue
      const isActive = power.implemented
        || (card.rarity === 'legendary' && power.implementedLegendary)
        || (card.rarity === 'space' && power.implementedSpace)
      if (!isActive) continue
      map[power.pieceSymbol] = card
    }
    return map
  }

  function buildPieceImageMap(cards: CardVariant[]): Partial<Record<PieceSymbol, string>> {
    const map: Partial<Record<PieceSymbol, string>> = {}
    for (const card of cards) {
      const power = CARD_POWERS[card.characterId]
      if (!power) continue
      // Baby rarity → use character baby sprite on its associated piece
      if (card.rarity === 'baby') {
        const babyImg = BABY_PIECE_IMAGES[card.characterId]
        if (babyImg) {
          if (power.pieceSymbol) map[power.pieceSymbol] = babyImg
          else if (card.characterId === 'general-gambit') map['p'] = babyImg
        }
        continue
      }
      // General Gambit: sprite keyed by rarity
      if (card.characterId === 'general-gambit') {
        map['p'] = GENERAL_GAMBIT_PIECE_IMAGE[card.rarity] ?? '/images/characters/general-gambit/basic-piece.png'
        continue
      }
      if (!power.pieceSymbol) continue
      const isActive = power.implemented
        || (card.rarity === 'legendary' && power.implementedLegendary)
        || (card.rarity === 'space' && power.implementedSpace)
      if (!isActive) continue
      if (card.characterId === 'unipop') {
        map['n'] = UNIPOP_PIECE_IMAGE[card.rarity] ?? '/images/characters/unipop/piece.png'
      } else if (card.characterId === 'robin-rook') {
        map['r'] = ROBIN_ROOK_PIECE_IMAGE[card.rarity] ?? '/images/characters/robin-rook/piece.png'
      } else if (card.characterId === 'puzzle-pete') {
        map['b'] = PUZZLE_PETE_PIECE_IMAGE[card.rarity] ?? '/images/characters/puzzle-pete/piece.png'
      } else if (card.characterId === 'black-king') {
        map['k'] = BLACK_KING_PIECE_IMAGE[card.rarity] ?? '/images/characters/black-king/piece.png'
      } else if (card.characterId === 'kings-guard') {
        map['k'] = KINGS_GUARD_PIECE_IMAGE[card.rarity] ?? '/images/characters/kings-guard/piece.png'
      } else if (card.characterId === 'crystal-queen') {
        map['q'] = CRYSTAL_QUEEN_PIECE_IMAGE[card.rarity] ?? '/images/characters/crystal-queen/basic-piece.png'
      } else if (card.characterId === 'pirate-queen') {
        map['q'] = PIRATE_QUEEN_PIECE_IMAGE
      } else if (card.characterId === 'happy-pawn') {
        map['p'] = HAPPY_PAWN_PIECE_IMAGE[card.rarity] ?? '/images/characters/happy-pawn/piece.png'
      } else {
        map[power.pieceSymbol] = card.image
      }
    }
    return map
  }
  function buildPieceChibiMap(cards: CardVariant[]): Partial<Record<PieceSymbol, string>> {
    const map: Partial<Record<PieceSymbol, string>> = {}
    for (const card of cards) {
      const power = CARD_POWERS[card.characterId]
      if (!power) continue
      const isActive = power.implemented
        || (card.rarity === 'legendary' && power.implementedLegendary)
        || (card.rarity === 'space' && power.implementedSpace)
      if (!isActive) continue
      const sym: PieceSymbol | undefined = card.characterId === 'general-gambit' ? 'p' : power.pieceSymbol
      if (!sym) continue
      map[sym] = `/images/characters/${card.characterId}/${card.rarity}-chibi.png`
    }
    return map
  }

  const whitePieceImageMap = buildPieceImageMap(playerCards)
  const blackPieceImageMap = buildPieceImageMap(aiCards)
  const whitePieceCardMap = buildPieceCardMap(playerCards)
  const blackPieceCardMap = buildPieceCardMap(aiCards)
  const whitePieceChibiMap = buildPieceChibiMap(playerCards)
  const blackPieceChibiMap = buildPieceChibiMap(aiCards)

  const isUnipopBuildingPath = unipopState !== null && unipopState.destination !== null

  // Crystal Queen swap: identify which squares are swap targets (own n/b/r) vs normal moves
  const selectedPiece = (() => {
    if (!selectedSquare) return null
    for (const row of board) for (const p of row) { if (p?.square === selectedSquare) return p }
    return null
  })()
  const hasCQBaseActive = selectedPiece?.type === 'q' && (
    (selectedPiece.color === 'w' ? playerCards : aiCards)
      .some(c => CARD_POWERS[c.characterId]?.crystalQueenSwap)
  )

  // ── Drag and drop ─────────────────────────────────────────────────────────────
  const [dragging, setDragging] = useState<{
    from: ChessSquare; type: PieceSymbol; color: Color; cardImage?: string
    initX: number; initY: number
  } | null>(null)
  const [dragOver, setDragOver] = useState<ChessSquare | null>(null)
  const ghostRef = useRef<HTMLDivElement>(null)
  const pendingRef = useRef<{ sq: ChessSquare; startX: number; startY: number } | null>(null)
  const draggingRef = useRef(false)
  const dragOverRef = useRef<ChessSquare | null>(null)

  function getSquareAt(x: number, y: number): ChessSquare | null {
    const el = document.elementFromPoint(x, y)
    const sq = (el?.closest('[data-square]') as HTMLElement | null)?.dataset.square
    return (sq as ChessSquare | undefined) ?? null
  }

  function handleBoardPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (status !== 'playing') return
    const sq = getSquareAt(e.clientX, e.clientY)
    if (!sq) return

    let piece: BoardPiece | null = null
    outer: for (const row of board) {
      for (const p of row) { if (p?.square === sq) { piece = p; break outer } }
    }

    // Always prevent the subsequent click event so Square's onClick never fires
    e.preventDefault()

    if (!piece) {
      // Empty square — call immediately, no drag
      onSquareClick(sq)
      onSpecialPieceClick?.(null)
      return
    }

    const p = piece
    const cardImg = p.color === 'w' ? whitePieceImageMap[p.type] : blackPieceImageMap[p.type]
    const specialCard = p.color === 'w' ? whitePieceCardMap[p.type] : blackPieceCardMap[p.type]
    onSpecialPieceClick?.(specialCard ?? null)
    pendingRef.current = { sq, startX: e.clientX, startY: e.clientY }
    draggingRef.current = false

    const onMove = (me: PointerEvent) => {
      if (!pendingRef.current) return
      if (!draggingRef.current) {
        const d = Math.hypot(me.clientX - pendingRef.current.startX, me.clientY - pendingRef.current.startY)
        if (d < 6) return
        draggingRef.current = true
        setDragging({ from: pendingRef.current.sq, type: p.type, color: p.color, cardImage: cardImg, initX: me.clientX, initY: me.clientY })
      }
      if (ghostRef.current) {
        ghostRef.current.style.left = `${me.clientX}px`
        ghostRef.current.style.top = `${me.clientY}px`
      }
      const over = getSquareAt(me.clientX, me.clientY)
      if (over !== dragOverRef.current) { dragOverRef.current = over; setDragOver(over) }
    }

    const onUp = (ue: PointerEvent) => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      const wasDragging = draggingRef.current
      const pending = pendingRef.current
      pendingRef.current = null
      draggingRef.current = false
      dragOverRef.current = null
      setDragging(null)
      setDragOver(null)
      if (!pending) return
      if (wasDragging) {
        const toSq = getSquareAt(ue.clientX, ue.clientY)
        onSquareClick(pending.sq)
        // Some powers require deliberate multi-step clicks — drag just selects the piece
        const colorCards = p.color === 'w' ? playerCards : aiCards
        const isUnipopKnight = p.type === 'n' && colorCards.some(c => CARD_POWERS[c.characterId]?.unipopLPath)
        const isRobinRook   = p.type === 'r' && colorCards.some(c => CARD_POWERS[c.characterId]?.robinRookStay)
        const inSpecialMode = isChessbeardSelectMode || chessbeardSacrificeSquare !== null || isSpaceChessbeardFreezeMode
        if (toSq && toSq !== pending.sq && !isUnipopKnight && !isRobinRook && !inSpecialMode) {
          onSquareClick(toSq)
        }
      } else {
        onSquareClick(pending.sq)
      }
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }
  // ──────────────────────────────────────────────────────────────────────────────

  // Crystal Queen: find which color has the immune queen and locate her on the board
  const crystalQueenColor: Color | null =
    playerCards.some(c => c.rarity === 'space' && CARD_POWERS[c.characterId]?.crystalQueenImmune) ? 'w' :
    aiCards.some(c => c.rarity === 'space' && CARD_POWERS[c.characterId]?.crystalQueenImmune) ? 'b' :
    null
  const crystalQueenSquare: ChessSquare | null = crystalQueenColor
    ? (() => {
        for (const row of board) {
          for (const p of row) {
            if (p?.type === 'q' && p.color === crystalQueenColor) return p.square
          }
        }
        return null
      })()
    : null

  const kingInCheckSquare: ChessSquare | null = (() => {
    if (!isCheck || status !== 'playing') return null
    for (let r = 0; r < 8; r++)
      for (let f = 0; f < 8; f++) {
        const p = board[r][f]
        if (p?.type === 'k' && p.color === turn) return p.square
      }
    return null
  })()

  const unipopPathSquares = unipopState?.path ?? []

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '560px' }}>
      <div
        className="grid shadow-2xl rounded-sm overflow-hidden"
        style={{
          gridTemplateColumns: 'repeat(8, 1fr)',
          gridTemplateRows: 'repeat(8, 1fr)',
          width: '100%',
          aspectRatio: '1',
          border: '3px solid #8b7355',
          touchAction: 'none',
        }}
        onPointerDown={handleBoardPointerDown}
      >
        {board.map((row, rowIdx) =>
          row.map((piece, colIdx) => {
            const file = FILES[colIdx]
            const rank = RANKS[rowIdx]
            const square = (file + rank) as ChessSquare
            const isLight = (rowIdx + colIdx) % 2 === 0
            const isLastMoveSquare = lastMove?.from === square || lastMove?.to === square
            const isUnipopPath = unipopPathSquares.includes(square)
            const isUnipopCapture = unipopPathCaptures.includes(square)
            const isShootTarget = isRookShootMode && validTargets.includes(square)
            const isChessbeardSelectable = isChessbeardSelectMode && validTargets.includes(square)
            const isChessbeardTarget = chessbeardSacrificeSquare !== null && validTargets.includes(square)
            const isCrystalQueenVulnerable = crystalQueenVulnerable && crystalQueenSquare === square
            const isCrystalQueenProtected = !crystalQueenVulnerable && crystalQueenSquare === square
            const isSpaceChessbeardFrozen = spaceChessbeardFrozenSquare === square
            const isSpaceHappyPawnTarget = isSpaceHappyPawnPlaceMode && validTargets.includes(square)
            const isCrystalQueenSwapTarget = hasCQBaseActive && validTargets.includes(square)
              && !!piece && piece.color === selectedPiece!.color
              && (piece.type === 'n' || piece.type === 'b' || piece.type === 'r')
            const cardImage = piece
              ? (piece.color === 'w' ? whitePieceImageMap[piece.type] : blackPieceImageMap[piece.type])
              : undefined
            const chibiImage = piece
              ? (piece.color === 'w' ? whitePieceChibiMap[piece.type] : blackPieceChibiMap[piece.type])
              : undefined

            return (
              <SquareCell
                key={square}
                square={square}
                piece={piece}
                isLight={isLight}
                isSelected={selectedSquare === square}
                isValidTarget={validTargets.includes(square)}
                isLastMove={isLastMoveSquare}
                isKingInCheck={kingInCheckSquare === square}
                isUnipopPath={isUnipopPath}
                isUnipopCapture={isUnipopCapture}
                isShootTarget={isShootTarget}
                isChessbeardSelectable={isChessbeardSelectable}
                isChessbeardTarget={isChessbeardTarget}
                isCrystalQueenVulnerable={isCrystalQueenVulnerable}
                isCrystalQueenProtected={isCrystalQueenProtected}
                isCrystalQueenSwapTarget={isCrystalQueenSwapTarget}
                isSpaceChessbeardFrozen={isSpaceChessbeardFrozen}
                isSpaceHappyPawnTarget={isSpaceHappyPawnTarget}
                isDraggingFrom={dragging?.from === square}
                isDragOver={dragOver === square}
                isUnipopStepTarget={isUnipopBuildingPath && validTargets.includes(square)}
                isRespawning={respawnedSquares.includes(square)}
                showCoords={true}
                rank={colIdx === 0 ? rank : undefined}
                file={rowIdx === 7 ? file : undefined}
                cardImage={cardImage}
                chibiImage={chibiImage}
                showSpecial={showSpecialPieces}
              />
            )
          })
        )}
      </div>

      {/* Game-over click blocker */}
      {status !== 'playing' && (
        <div className="absolute inset-0 z-10" style={{ cursor: 'default' }} />
      )}

      {/* Drag ghost — follows cursor via ref, no re-renders during move */}
      {dragging && (
        <div
          ref={ghostRef}
          className="pointer-events-none flex items-center justify-center"
          style={{
            position: 'fixed',
            zIndex: 9999,
            left: dragging.initX,
            top: dragging.initY,
            transform: 'translate(-50%, -50%)',
            width: '64px',
            height: '64px',
            opacity: 0.9,
          }}
        >
          <Piece type={dragging.type} color={dragging.color} cardImage={dragging.cardImage} showSpecial={showSpecialPieces} />
        </div>
      )}

      {/* Overlays */}
      <FireTrail squares={fireTrailSquares} />
      {arrowShot && <ArrowShot from={arrowShot.from} to={arrowShot.to} />}
      {rookChoiceSquare && (
        <RookChoiceMenu
          square={rookChoiceSquare}
          onChoice={onRookChoice}
          onClose={() => onSquareClick(rookChoiceSquare)}
        />
      )}
      {legendaryHappyPawnPromoteSquare && onLegendaryHappyPawnPromote && (
        <PromotionMenu
          square={legendaryHappyPawnPromoteSquare}
          onChoice={onLegendaryHappyPawnPromote}
        />
      )}
    </div>
  )
}
