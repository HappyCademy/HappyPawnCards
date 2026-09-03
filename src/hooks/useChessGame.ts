import { useState, useRef, useCallback, useEffect } from 'react'
import { Chess } from 'chess.js'
import type { Square, PieceSymbol, Color } from 'chess.js'
import { getBestMove } from '../engine/minimax'
import { isKingOnBoard, getPseudoLegalTargets, applyPseudoLegalMove } from '../engine/pseudolegal'
import { getPuzzlePeteBishopTargets } from '../engine/puzzlepete'
import type { CardVariant } from '../data/cards'
import { CARD_POWERS } from '../data/powers'
import {
  type UnipopState,
  getUnipopTargets,
  getPathSquares,
  applyUnipopMove,
  getLegendaryUnipopTargets,
} from '../engine/unipop'
import { getRookShootTargets, getAllDirShootTargets, applyRookShoot } from '../engine/robinrook'
import { getPirateQueenTargets } from '../engine/piratequeen'
import { getBlackKingTargets, applyBlackKingCapture, toggleTurn } from '../engine/blackking'
import { getHappyPawnTargets, applyHappyPawnPush, getSpaceHappyPawnPlacementTargets, applySpaceHappyPawnPlace } from '../engine/happypawn'
import {
  getChessbeardSelectablePieces, getChessbeardTargets, applyChessbeardSacrifice,
} from '../engine/chessbeard'
import { getKingsGuardTeleportSquares, applyKingsGuardTeleport } from '../engine/kingsguard'
import { getCrystalQueenSwapTargets, applyCrystalQueenSwap } from '../engine/crystalqueen'
import {
  playMove, playCapture, playCheck, playPower, playWin, playLose, playTimerTick,
} from '../utils/sounds'
import { tryAIPowerMove } from '../engine/aipowers'

export type GameStatus = 'playing' | 'white-wins' | 'black-wins' | 'draw'

export interface OnlineSyncState {
  fen: string
  moveHistory: string[]
  lastMove: { from: string; to: string } | null
  crystalQueenVulnerable: boolean
  spaceChessbeardFrozenSquare: string | null
  status: GameStatus
}

export interface BoardPiece {
  type: PieceSymbol
  color: Color
  square: Square
}

export interface GameState {
  board: (BoardPiece | null)[][]
  selectedSquare: Square | null
  validTargets: Square[]
  turn: Color
  status: GameStatus
  isCheck: boolean
  moveHistory: string[]
  lastMove: { from: Square; to: Square } | null
  isAIThinking: boolean
  unipopState: UnipopState | null
  unipopBonusSquare: Square | null
  unipopPathCaptures: Square[]
  rookChoiceSquare: Square | null
  isRookShootMode: boolean
  fireTrailSquares: Square[]
  arrowShot: { from: Square; to: Square } | null
  blackKingBonusSquare: Square | null
  isChessbeardSelectMode: boolean
  chessbeardSacrificeSquare: Square | null
  chessbeardAvailable: boolean
  isSpaceHappyPawnPlaceMode: boolean
  isSpaceChessbeardFreezeMode: boolean
  spaceChessbeardFrozenSquare: Square | null
  spaceHappyPawnAvailable: boolean
  crystalQueenVulnerable: boolean
  respawnedSquares: Square[]
  legendaryHappyPawnPromoteSquare: Square | null
  timeLeft: number
  timedOut: Color | null
  resignedBy: Color | null
  gameMode: GameMode
}

export interface GameActions {
  onSquareClick: (square: Square) => void
  onRookChoice: (mode: 'move' | 'shoot') => void
  onSkipBlackKingBonus: () => void
  onChessbeardActivate: () => void
  onSpaceHappyPawnPlace: () => void
  onLegendaryHappyPawnPromote: (piece: PieceSymbol) => void
  onNewGame: () => void
  onUndo: () => void
  onResign: () => void
  applyExternalTurn: (state: OnlineSyncState) => void
}

// ── Pure helpers (outside hook) ────────────────────────────────────────────────

function getStatus(chess: Chess): GameStatus {
  if (!isKingOnBoard(chess, 'w')) return 'black-wins'
  if (!isKingOnBoard(chess, 'b')) return 'white-wins'
  if (chess.isStalemate()) return chess.turn() === 'w' ? 'black-wins' : 'white-wins'
  if (chess.isDraw()) return 'draw'
  return 'playing'
}

function buildBoard(chess: Chess): (BoardPiece | null)[][] {
  return chess.board().map((row, r) =>
    row.map((piece, f) => {
      if (!piece) return null
      const sq = (String.fromCharCode(97 + f) + (8 - r)) as Square
      return { ...piece, square: sq }
    })
  )
}

function countPawnsInReserve(chess: Chess, color: Color): number {
  let onBoard = 0
  for (const row of chess.board()) {
    for (const p of row) {
      if (p?.type === 'p' && p.color === color) onBoard++
    }
  }
  return Math.max(0, 8 - onBoard)
}

/** Files where pawns of `color` were lost between two board states. */
function capturedPawnFiles(before: Chess, after: Chess, color: Color): string[] {
  const count = (chess: Chess) => {
    let total = 0
    const byFile = new Map<string, number>()
    for (const row of chess.board()) {
      for (const p of row) {
        if (p?.type === 'p' && p.color === color) {
          total++
          byFile.set(p.square[0], (byFile.get(p.square[0]) ?? 0) + 1)
        }
      }
    }
    return { total, byFile }
  }
  const b = count(before), a = count(after)
  // If total pawn count didn't decrease, no pawn was captured (it just moved files)
  if (a.total >= b.total) return []
  const lost: string[] = []
  for (const [file, n] of b.byFile) {
    if ((a.byFile.get(file) ?? 0) < n) lost.push(file)
  }
  return lost
}

/** Add a pawn back on rank 2 (white) or rank 7 (black) on the given file, if the square is empty. */
function respawnPawn(chess: Chess, file: string, color: Color): Chess {
  const rank = color === 'w' ? '2' : '7'
  const sq = (file + rank) as Square
  if (chess.get(sq)) return chess   // occupied — pawn dies for good

  const pawnChar = color === 'w' ? 'P' : 'p'
  const fi = sq.charCodeAt(0) - 97
  const ri = parseInt(sq[1]) - 1
  const fenRi = 7 - ri
  const parts = chess.fen().split(' ')
  const rows = parts[0].split('/')

  let exp = ''
  for (const ch of rows[fenRi]) {
    if (ch >= '1' && ch <= '8') exp += '1'.repeat(parseInt(ch))
    else exp += ch
  }
  exp = exp.slice(0, fi) + pawnChar + exp.slice(fi + 1)

  let comp = '', blanks = 0
  for (const ch of exp) {
    if (ch === '1') blanks++
    else { if (blanks) { comp += blanks; blanks = 0 } comp += ch }
  }
  if (blanks) comp += blanks
  rows[fenRi] = comp

  const newFen = [rows.join('/'), ...parts.slice(1)].join(' ')
  try { return new Chess(newFen, { skipValidation: true }) } catch { return chess }
}

function replacePieceAt(chess: Chess, sq: Square, piece: PieceSymbol): Chess {
  const existing = chess.get(sq)
  if (!existing) return chess
  const newChar = existing.color === 'w' ? piece.toUpperCase() : piece.toLowerCase()
  const fi = sq.charCodeAt(0) - 97
  const fenRi = 8 - parseInt(sq[1])
  const parts = chess.fen().split(' ')
  const rows = parts[0].split('/')
  let exp = ''
  for (const ch of rows[fenRi]) {
    if (ch >= '1' && ch <= '8') exp += '1'.repeat(parseInt(ch))
    else exp += ch
  }
  exp = exp.slice(0, fi) + newChar + exp.slice(fi + 1)
  let comp = '', blanks = 0
  for (const ch of exp) {
    if (ch === '1') blanks++
    else { if (blanks) { comp += blanks; blanks = 0 } comp += ch }
  }
  if (blanks) comp += blanks
  rows[fenRi] = comp
  const newFen = [rows.join('/'), ...parts.slice(1)].join(' ')
  try { return new Chess(newFen, { skipValidation: true }) } catch { return chess }
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export type GameMode = 'vsComputer' | 'vsPlayer' | 'online'

interface Options {
  playerCards: CardVariant[]
  aiCards?: CardVariant[]
  gameMode?: GameMode
  onlineConfig?: { myColor: 'w' | 'b'; onTurnComplete: (state: OnlineSyncState) => void }
}

export function useChessGame({ playerCards, aiCards = [], gameMode = 'vsComputer', onlineConfig }: Options): GameState & GameActions {
  const chessRef = useRef(new Chess())
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [validTargets, setValidTargets] = useState<Square[]>([])
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null)
  const [unipopState, setUnipopState] = useState<UnipopState | null>(null)
  const [unipopBonusSquare, setUnipopBonusSquare] = useState<Square | null>(null)
  const [unipopPathCaptures, setUnipopPathCaptures] = useState<Square[]>([])
  const [rookChoiceSquare, setRookChoiceSquare] = useState<Square | null>(null)
  const [isRookShootMode, setIsRookShootMode] = useState(false)
  const [fireTrailSquares, setFireTrailSquares] = useState<Square[]>([])
  const [arrowShot, setArrowShot] = useState<{ from: Square; to: Square } | null>(null)
  const [blackKingBonusSquare, setBlackKingBonusSquare] = useState<Square | null>(null)
  const [isChessbeardSelectMode, setIsChessbeardSelectMode] = useState(false)
  const [chessbeardSacrificeSquare, setChessbeardSacrificeSquare] = useState<Square | null>(null)
  const [crystalQueenVulnerable, setCrystalQueenVulnerable] = useState(false)
  const [respawnedSquares, setRespawnedSquares] = useState<Square[]>([])
  const [timeLeft, setTimeLeft] = useState(60)
  const [timedOut, setTimedOut] = useState<Color | null>(null)
  const [resignedBy, setResignedBy] = useState<Color | null>(null)
  const [gameActive, setGameActive] = useState(false)
  const [isSpaceHappyPawnPlaceMode, setIsSpaceHappyPawnPlaceMode] = useState(false)
  const [isSpaceChessbeardFreezeMode, setIsSpaceChessbeardFreezeMode] = useState(false)
  const [spaceChessbeardFrozenSquare, setSpaceChessbeardFrozenSquare] = useState<Square | null>(null)
  const [freezeSetByColor, setFreezeSetByColor] = useState<Color | null>(null)
  const [legendaryHappyPawnPromoteSquare, setLegendaryHappyPawnPromoteSquare] = useState<Square | null>(null)
  const promotePendingRef = useRef<{ before: Chess; from: Square } | null>(null)
  const fenHistoryRef = useRef<Array<{ fen: string; moveCount: number }>>([])
  const moveHistoryRef = useRef<string[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevPieceCountRef = useRef(32)
  const prevStatusRef = useRef<GameStatus>('playing')
  const [tick, setTick] = useState(0)
  const onTurnCompleteRef = useRef(onlineConfig?.onTurnComplete)
  useEffect(() => { onTurnCompleteRef.current = onlineConfig?.onTurnComplete }, [onlineConfig?.onTurnComplete])
  const bump = useCallback(() => setTick(t => t + 1), [])

  const chess = chessRef.current

  // In vsPlayer/online mode, powers come from whichever player's turn it currently is
  const currentCards = (gameMode === 'vsPlayer' || gameMode === 'online')
    ? (chess.turn() === 'w' ? playerCards : aiCards)
    : playerCards
  const hasLegendaryUnipop = currentCards.some(c => c.rarity === 'legendary' && CARD_POWERS[c.characterId]?.unipopLPath)
  const hasSpaceUnipop   = currentCards.some(c => c.rarity === 'space' && CARD_POWERS[c.characterId]?.unipopLPath)
  const hasUnipop        = !hasSpaceUnipop && !hasLegendaryUnipop && currentCards.some(c => CARD_POWERS[c.characterId]?.unipopLPath)
  const hasSpaceRobinRook = currentCards.some(c => c.rarity === 'space' && CARD_POWERS[c.characterId]?.robinRookStay)
  const hasRobinRook     = currentCards.some(c => CARD_POWERS[c.characterId]?.robinRookStay)
  const hasPuzzlePete    = currentCards.some(c => CARD_POWERS[c.characterId]?.puzzlePeteBounce)
  const hasPirateQueen   = currentCards.some(c => CARD_POWERS[c.characterId]?.pirateQueenBounce)
  const hasBlackKing     = currentCards.some(c => CARD_POWERS[c.characterId]?.blackKingCapture)
  const hasHappyPawn     = currentCards.some(c => CARD_POWERS[c.characterId]?.happyPawnPush)
  const hasCrystalQueenBase = currentCards.some(c => CARD_POWERS[c.characterId]?.crystalQueenSwap)
  const hasKingsGuard    = currentCards.some(c => CARD_POWERS[c.characterId]?.kingsGuardBlock)
  const hasChessbeard    = currentCards.some(c => CARD_POWERS[c.characterId]?.chessbeardSacrifice)
  const hasSpaceChessbeard = currentCards.some(c => c.rarity === 'space' && CARD_POWERS[c.characterId]?.chessbeardSacrifice)
  const hasSpaceHappyPawn  = currentCards.some(c => c.rarity === 'space' && CARD_POWERS[c.characterId]?.happyPawnPush)
  const hasLegendaryHappyPawn = currentCards.some(c => c.rarity === 'legendary' && CARD_POWERS[c.characterId]?.happyPawnPush)
  const hasPlayerGambit  = playerCards.some(c => CARD_POWERS[c.characterId]?.generalGambitRespawn)
  const hasAIGambit      = aiCards.some(c => CARD_POWERS[c.characterId]?.generalGambitRespawn)

  // Crystal Queen: the player color that holds the space crystal queen (if any)
  const crystalQueenColor: Color | null =
    playerCards.some(c => c.rarity === 'space' && CARD_POWERS[c.characterId]?.crystalQueenImmune) ? 'w' :
    aiCards.some(c => c.rarity === 'space' && CARD_POWERS[c.characterId]?.crystalQueenImmune) ? 'b' :
    null
  const hasCrystalQueen = crystalQueenColor !== null

  // Apply General Gambit respawns: any pawn captured in this half-move respawns instantly.
  function withRespawns(before: Chess, after: Chess): Chess {
    let result = after
    if (hasPlayerGambit) {
      for (const f of capturedPawnFiles(before, result, 'w')) {
        result = respawnPawn(result, f, 'w')
      }
    }
    if (hasAIGambit) {
      for (const f of capturedPawnFiles(before, result, 'b')) {
        result = respawnPawn(result, f, 'b')
      }
    }
    if (hasPlayerGambit || hasAIGambit) {
      const spawned: Square[] = []
      for (let fi = 0; fi < 8; fi++) {
        const fc = String.fromCharCode(97 + fi)
        for (const [rank, color] of [['2', 'w'], ['7', 'b']] as const) {
          const sq = (fc + rank) as Square
          const pb = before.get(sq), pa = result.get(sq)
          if (pa?.type === 'p' && pa.color === color && !(pb?.type === 'p' && pb.color === color)) {
            spawned.push(sq)
          }
        }
      }
      if (spawned.length > 0) setRespawnedSquares(spawned)
    }
    return result
  }

  function getCrystalQueenSquare(c: Chess, color: Color): Square | null {
    for (const row of c.board()) {
      for (const p of row) {
        if (p?.type === 'q' && p.color === color) return p.square as Square
      }
    }
    return null
  }

  function applyImmunityFilter(targets: Square[], attackerColor: Color): Square[] {
    if (!hasCrystalQueen || crystalQueenVulnerable || !crystalQueenColor || attackerColor === crystalQueenColor) {
      return targets
    }
    const cqSq = getCrystalQueenSquare(chess, crystalQueenColor)
    return cqSq ? targets.filter(sq => sq !== cqSq) : targets
  }

  function clearSelection() {
    setSelectedSquare(null)
    setValidTargets([])
    setUnipopState(null)
    setUnipopBonusSquare(null)
    setUnipopPathCaptures([])
    setRookChoiceSquare(null)
    setIsRookShootMode(false)
    setBlackKingBonusSquare(null)
    setIsChessbeardSelectMode(false)
    setChessbeardSacrificeSquare(null)
    setIsSpaceHappyPawnPlaceMode(false)
    setIsSpaceChessbeardFreezeMode(false)
  }

  function formatMoveNotation(before: Chess, from: Square, to: Square): string {
    const piece = before.get(from)
    const captured = before.get(to)
    const sym = piece && piece.type !== 'p' ? piece.type.toUpperCase() : ''
    return sym + from + (captured ? 'x' : '-') + to
  }

  function completeTurn(before: Chess, after: Chess, fromSq: Square, toSq: Square) {
    fenHistoryRef.current.push({ fen: before.fen(), moveCount: moveHistoryRef.current.length })
    moveHistoryRef.current.push(formatMoveNotation(before, fromSq, toSq))
    const withR = withRespawns(before, after)
    chessRef.current = withR
    setLastMove({ from: fromSq, to: toSq })
    if (hasSpaceChessbeard) {
      const opponentColor = withR.turn()
      const targets: Square[] = []
      for (const row of withR.board()) {
        for (const p of row) {
          if (p && p.color === opponentColor) targets.push(p.square as Square)
        }
      }
      if (targets.length > 0) {
        setIsSpaceChessbeardFreezeMode(true)
        setSelectedSquare(null)
        setValidTargets(targets)
        setUnipopState(null)
        setUnipopBonusSquare(null)
        setUnipopPathCaptures([])
        setRookChoiceSquare(null)
        setIsRookShootMode(false)
        setBlackKingBonusSquare(null)
        setIsChessbeardSelectMode(false)
        setChessbeardSacrificeSquare(null)
        setIsSpaceHappyPawnPlaceMode(false)
        return
      }
    }
    clearSelection()
    bump()
  }

  // ESC key cancels any active selection or special mode
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (unipopBonusSquare) {
        chessRef.current = toggleTurn(chessRef.current)
        bump()
      }
      clearSelection()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [unipopBonusSquare])  // eslint-disable-line react-hooks/exhaustive-deps

  // Online sync: after every bump, if it's the opponent's turn, write state to Firestore
  useEffect(() => {
    if (!onlineConfig || !tick) return
    if (chessRef.current.turn() === onlineConfig.myColor) return  // still my turn
    onTurnCompleteRef.current?.({
      fen: chessRef.current.fen(),
      moveHistory: [...moveHistoryRef.current],
      lastMove,
      crystalQueenVulnerable,
      spaceChessbeardFrozenSquare: spaceChessbeardFrozenSquare as string | null,
      status: getStatus(chessRef.current),
    })
  }, [tick])  // eslint-disable-line react-hooks/exhaustive-deps

  function applyExternalTurn(state: OnlineSyncState) {
    chessRef.current = new Chess(state.fen, { skipValidation: true })
    setCrystalQueenVulnerable(state.crystalQueenVulnerable)
    setSpaceChessbeardFrozenSquare(state.spaceChessbeardFrozenSquare as Square | null)
    moveHistoryRef.current = [...state.moveHistory]
    fenHistoryRef.current = []
    setLastMove(state.lastMove ? state.lastMove as { from: Square; to: Square } : null)
    clearSelection()
    bump()
  }

  function triggerFireTrail(squares: Square[]) {
    setFireTrailSquares(squares)
    setTimeout(() => setFireTrailSquares([]), 900 + squares.length * 150 + 200)
  }

  function triggerArrowShot(from: Square, to: Square) {
    setArrowShot({ from, to })
    setTimeout(() => setArrowShot(null), 900)
  }

  const onRookChoice = useCallback((mode: 'move' | 'shoot') => {
    if (!rookChoiceSquare) return
    const sq = rookChoiceSquare
    setRookChoiceSquare(null)
    if (mode === 'move') {
      setSelectedSquare(sq)
      setValidTargets(getPseudoLegalTargets(chess, sq))
      setIsRookShootMode(false)
    } else {
      setSelectedSquare(sq)
      setValidTargets(hasSpaceRobinRook ? getAllDirShootTargets(chess, sq) : getRookShootTargets(chess, sq))
      setIsRookShootMode(true)
    }
  }, [chess, rookChoiceSquare, hasSpaceRobinRook])  // eslint-disable-line react-hooks/exhaustive-deps

  const onSquareClick = useCallback((square: Square) => {
    if (getStatus(chess) !== 'playing' || resignedBy !== null) return
    if (onlineConfig && chess.turn() !== onlineConfig.myColor) return

    // ── Legendary Happy Pawn: waiting for promotion choice ────────────────────
    if (legendaryHappyPawnPromoteSquare) return

    // ── Space Chessbeard: picking freeze target ──────────────────────────────
    if (isSpaceChessbeardFreezeMode) {
      if (validTargets.includes(square)) {
        setSpaceChessbeardFrozenSquare(square)
        setFreezeSetByColor(chess.turn() === 'w' ? 'b' : 'w')
        setIsSpaceChessbeardFreezeMode(false)
        setSelectedSquare(null)
        setValidTargets([])
        bump()
      }
      return
    }

    // ── Space Happy Pawn: place a pawn from reserve ──────────────────────────
    if (isSpaceHappyPawnPlaceMode) {
      if (validTargets.includes(square)) {
        const before = chess
        const placed = applySpaceHappyPawnPlace(chess, square)
        completeTurn(before, placed, square, square)
      }
      return
    }

    // In vsComputer mode black's clicks are blocked (AI handles black's turn)
    if (gameMode === 'vsComputer' && chess.turn() === 'b') return

    const piece = chess.get(square)
    const isMyPiece = piece && piece.color === chess.turn()

    // ── Rook choice popup open ───────────────────────────────────────────
    if (rookChoiceSquare) {
      clearSelection()
      if (!isMyPiece) return
    }

    // ── Robin Rook shoot mode ────────────────────────────────────────────
    if (isRookShootMode && selectedSquare) {
      if (validTargets.includes(square)) {
        const before = chess
        const shot = applyRookShoot(chess, square)
        triggerArrowShot(selectedSquare, square)
        setIsRookShootMode(false)
        completeTurn(before, shot, selectedSquare, square)
        return
      }
      // Any click that isn't a valid shoot target cancels shoot mode (never falls through)
      setIsRookShootMode(false)
      clearSelection()
      return
    }

    // ── Unipop L-path mode ───────────────────────────────────────────────
    if (unipopState) {
      if (unipopState.destination === null) {
        // Phase 0: pick destination
        if (validTargets.includes(square)) {
          const newState: UnipopState = { ...unipopState, destination: square }
          setUnipopState(newState)
          setValidTargets(getUnipopTargets(chess, newState))
          return
        }
        clearSelection(); return
      } else {
        // Phase 1: pick corner (L-path direction) → execute immediately
        if (validTargets.includes(square)) {
          const pathSquares = getPathSquares(unipopState.knightSquare, unipopState.destination, square)
          const before = chess
          const moved = applyUnipopMove(chess, unipopState.knightSquare, pathSquares)
          triggerFireTrail(pathSquares)
          completeTurn(before, moved, unipopState.knightSquare, unipopState.destination)
          return
        }
        clearSelection(); return
      }
    }

    // ── Chessbeard: selecting piece to sacrifice ─────────────────────────
    if (isChessbeardSelectMode) {
      if (validTargets.includes(square)) {
        // Own eligible piece — advance to target-picking phase
        const targets = getChessbeardTargets(chess, square, hasSpaceChessbeard)
        setChessbeardSacrificeSquare(square)
        setIsChessbeardSelectMode(false)
        setSelectedSquare(square)
        setValidTargets(targets)
        // don't bump — turn hasn't changed
      } else if (!isMyPiece) {
        // Clicked enemy piece or empty square — cancel
        clearSelection()
      }
      // Own piece not eligible (e.g. pawn): silently ignore, keep mode active
      return
    }

    // ── Chessbeard: picking opponent piece to destroy ─────────────────────
    if (chessbeardSacrificeSquare) {
      if (validTargets.includes(square)) {
        const before = chess
        const sacrificed = applyChessbeardSacrifice(chess, chessbeardSacrificeSquare, square)
        completeTurn(before, sacrificed, chessbeardSacrificeSquare, square)
        return
      }
      if (square === chessbeardSacrificeSquare || (isMyPiece && piece && piece.type !== 'k')) {
        // Re-click sacrifice piece OR clicked a different own piece — re-enter select
        setChessbeardSacrificeSquare(null)
        setIsChessbeardSelectMode(true)
        setSelectedSquare(null)
        setValidTargets(getChessbeardSelectablePieces(chess, hasSpaceChessbeard))
        return
      }
      clearSelection()
      return
    }

    // ── Space Unipop bonus jump ──────────────────────────────────────────
    if (unipopBonusSquare) {
      // Clicking the knight itself (e.g. start of a drag) should not cancel the bonus
      if (square === unipopBonusSquare) return
      if (validTargets.includes(square)) {
        const before = chess
        const moved = applyPseudoLegalMove(chess, unipopBonusSquare, square)
        completeTurn(before, moved, unipopBonusSquare, square)
        return
      }
      // Skip / cancel — end turn properly
      chessRef.current = toggleTurn(chess)
      clearSelection()
      bump()
      return
    }

    // ── Black King bonus move ────────────────────────────────────────────
    if (blackKingBonusSquare) {
      if (square === blackKingBonusSquare) { clearSelection(); return }
      if (validTargets.includes(square)) {
        const before = chess
        const targetPiece = chess.get(square)
        if (targetPiece && targetPiece.color === chess.turn()) {
          // Friendly capture → chain another bonus move (unlimited as long as king keeps eating friendlies)
          const moved = applyBlackKingCapture(chess, blackKingBonusSquare, square, true)
          chessRef.current = withRespawns(before, moved)
          setLastMove({ from: blackKingBonusSquare, to: square })
          setBlackKingBonusSquare(square)
          setSelectedSquare(square)
          setValidTargets(getBlackKingTargets(chessRef.current, square))
          return
        }
        // Normal move or enemy capture → end turn
        const moved = applyPseudoLegalMove(chess, blackKingBonusSquare, square)
        completeTurn(before, moved, blackKingBonusSquare, square)
        return
      }
      return
    }

    // ── Normal move ──────────────────────────────────────────────────────
    if (selectedSquare) {
      if (validTargets.includes(square)) {
        const before = chess
        const targetPiece = chess.get(square)
        if (hasBlackKing && chess.get(selectedSquare)?.type === 'k'
            && targetPiece && targetPiece.color === chess.turn()) {
          // Black King friendly capture — king stays active for bonus move
          const moved = applyBlackKingCapture(chess, selectedSquare, square, true)
          chessRef.current = withRespawns(before, moved)
          setLastMove({ from: selectedSquare, to: square })
          setBlackKingBonusSquare(square)
          setSelectedSquare(square)
          setValidTargets(getBlackKingTargets(chessRef.current, square))
          // no bump — turn has not changed, AI should not trigger
          return
        }
        // Space Unipop — knight first jump grants a second jump
        if (hasSpaceUnipop && chess.get(selectedSquare)?.type === 'n') {
          const moved = applyPseudoLegalMove(chess, selectedSquare, square)
          const giveback = toggleTurn(moved)  // flip back to current player for bonus jump
          chessRef.current = withRespawns(before, giveback)
          setLastMove({ from: selectedSquare, to: square })
          setUnipopBonusSquare(square)
          setSelectedSquare(null)
          setValidTargets(getPseudoLegalTargets(chessRef.current, square))
          // no bump — turn hasn't truly changed, AI should not trigger
          return
        }
        let moved: Chess
        if (hasCrystalQueenBase && chess.get(selectedSquare)?.type === 'q' && targetPiece?.color === chess.turn()) {
          moved = applyCrystalQueenSwap(chess, selectedSquare, square)
        } else if (hasKingsGuard && chess.get(selectedSquare)?.type === 'p' && chess.isCheck()) {
          moved = applyKingsGuardTeleport(chess, selectedSquare, square)
        } else if (hasHappyPawn && chess.get(selectedSquare)?.type === 'p') {
          moved = applyHappyPawnPush(chess, selectedSquare, square)
        } else {
          moved = applyPseudoLegalMove(chess, selectedSquare, square)
        }
        // Detect crystal queen capture → becomes vulnerable
        if (hasCrystalQueen && crystalQueenColor) {
          const movingPiece = chess.get(selectedSquare)
          if (movingPiece?.type === 'q' && movingPiece.color === crystalQueenColor && targetPiece) {
            setCrystalQueenVulnerable(true)
          }
        }
        // Legendary Happy Pawn: pawn reaching rank 6 triggers early promotion
        const promoteRank = chess.turn() === 'w' ? '6' : '3'
        if (hasLegendaryHappyPawn && chess.get(selectedSquare)?.type === 'p' && square[1] === promoteRank) {
          const withR = withRespawns(before, moved)
          chessRef.current = withR
          promotePendingRef.current = { before, from: selectedSquare }
          setLegendaryHappyPawnPromoteSquare(square)
          setLastMove({ from: selectedSquare, to: square })
          clearSelection()
          return  // don't bump — AI must not trigger until promotion is resolved
        }
        completeTurn(before, moved, selectedSquare, square)
        return
      }
      if (isMyPiece) {
        if (square === spaceChessbeardFrozenSquare) return
        selectPiece(square, piece); return
      }
      clearSelection()
      return
    }

    if (isMyPiece) {
      if (square === spaceChessbeardFrozenSquare) return
      selectPiece(square, piece)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chess, selectedSquare, validTargets, unipopState, unipopBonusSquare, rookChoiceSquare, isRookShootMode,
      blackKingBonusSquare, isChessbeardSelectMode, chessbeardSacrificeSquare,
      isSpaceChessbeardFreezeMode, isSpaceHappyPawnPlaceMode, spaceChessbeardFrozenSquare,
      legendaryHappyPawnPromoteSquare,
      hasUnipop, hasSpaceUnipop, hasLegendaryUnipop, hasRobinRook, hasSpaceRobinRook, hasPuzzlePete, hasPirateQueen,
      hasCrystalQueenBase, hasBlackKing, hasKingsGuard, hasHappyPawn, hasChessbeard, hasSpaceChessbeard, hasSpaceHappyPawn,
      hasLegendaryHappyPawn, hasPlayerGambit, hasAIGambit, hasCrystalQueen, crystalQueenVulnerable, bump])

  function selectPiece(square: Square, piece: { type: PieceSymbol; color: Color }) {
    setSelectedSquare(square)
    if (hasLegendaryUnipop && piece.type === 'n') {
      setValidTargets(applyImmunityFilter(getLegendaryUnipopTargets(chess, square), piece.color))
    } else if (hasSpaceUnipop && piece.type === 'n') {
      setValidTargets(applyImmunityFilter(getPseudoLegalTargets(chess, square), piece.color))
    } else if (hasUnipop && piece.type === 'n') {
      const state: UnipopState = { knightSquare: square, destination: null, path: [] }
      setUnipopState(state)
      setValidTargets(applyImmunityFilter(getUnipopTargets(chess, state), piece.color))
      setUnipopPathCaptures([])
    } else if (hasRobinRook && piece.type === 'r') {
      const shootTargets = hasSpaceRobinRook ? getAllDirShootTargets(chess, square) : getRookShootTargets(chess, square)
      if (shootTargets.length > 0) {
        setRookChoiceSquare(square)
        setValidTargets([])
      } else {
        setValidTargets(getPseudoLegalTargets(chess, square))
      }
    } else if (hasCrystalQueenBase && piece.type === 'q') {
      const normalTargets = applyImmunityFilter(getPseudoLegalTargets(chess, square), piece.color)
      const swapTargets = getCrystalQueenSwapTargets(chess, square)
      setValidTargets([...normalTargets, ...swapTargets])
    } else if (hasPirateQueen && piece.type === 'q') {
      setValidTargets(applyImmunityFilter(getPirateQueenTargets(chess, square), piece.color))
    } else if (hasPuzzlePete && piece.type === 'b') {
      setValidTargets(applyImmunityFilter(getPuzzlePeteBishopTargets(chess, square), piece.color))
    } else if (hasBlackKing && piece.type === 'k') {
      setValidTargets(applyImmunityFilter(getBlackKingTargets(chess, square), piece.color))
    } else if (hasKingsGuard && piece.type === 'p' && chess.isCheck()) {
      setValidTargets(applyImmunityFilter(getKingsGuardTeleportSquares(chess, square), piece.color))
    } else if (hasHappyPawn && piece.type === 'p') {
      setValidTargets(applyImmunityFilter(getHappyPawnTargets(chess, square), piece.color))
    } else {
      setValidTargets(applyImmunityFilter(getPseudoLegalTargets(chess, square), piece.color))
    }
  }

  const onSkipBlackKingBonus = useCallback(() => {
    if (!blackKingBonusSquare) return
    chessRef.current = toggleTurn(chessRef.current)
    clearSelection()
    bump()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blackKingBonusSquare, bump])

  const onChessbeardActivate = useCallback(() => {
    if (getStatus(chessRef.current) !== 'playing') return
    const selectables = getChessbeardSelectablePieces(chessRef.current, hasSpaceChessbeard)
    setIsChessbeardSelectMode(true)
    setChessbeardSacrificeSquare(null)
    setSelectedSquare(null)
    setValidTargets(selectables)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSpaceChessbeard])

  const onSpaceHappyPawnPlace = useCallback(() => {
    const cur = chessRef.current
    if (getStatus(cur) !== 'playing') return
    if (countPawnsInReserve(cur, cur.turn()) === 0) return
    setIsSpaceHappyPawnPlaceMode(true)
    setSelectedSquare(null)
    setValidTargets(getSpaceHappyPawnPlacementTargets(cur))
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const onLegendaryHappyPawnPromote = useCallback((piece: PieceSymbol) => {
    if (!legendaryHappyPawnPromoteSquare || !promotePendingRef.current) return
    const promoted = replacePieceAt(chessRef.current, legendaryHappyPawnPromoteSquare, piece)
    chessRef.current = promoted
    setLegendaryHappyPawnPromoteSquare(null)
    promotePendingRef.current = null
    clearSelection()
    bump()
  }, [legendaryHappyPawnPromoteSquare, bump])  // eslint-disable-line react-hooks/exhaustive-deps

  // Timer: reset to 60s on each move
  useEffect(() => {
    setTimeLeft(60)
  }, [lastMove])

  // Timer: count down every second; pause on AI turn, Black King bonus, or game over
  useEffect(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    const cur = chessRef.current
    if (
      !gameActive ||
      !lastMove ||
      timedOut !== null ||
      resignedBy !== null ||
      getStatus(cur) !== 'playing' ||
      (gameMode === 'vsComputer' && cur.turn() === 'b') ||
      !!blackKingBonusSquare
    ) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setTimedOut(chessRef.current.turn())
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMove, timedOut, resignedBy, gameMode, blackKingBonusSquare, gameActive])

  // ── Sound effects ─────────────────────────────────────────────────────────────

  // Move / capture sound + check sting
  useEffect(() => {
    if (!lastMove) { prevPieceCountRef.current = 32; return }
    const cur = chessRef.current
    const count = cur.board().flat().filter(Boolean).length
    if (count < prevPieceCountRef.current) playCapture()
    else playMove()
    prevPieceCountRef.current = count
    if (cur.isCheck()) setTimeout(playCheck, 130)
  }, [lastMove])  // eslint-disable-line react-hooks/exhaustive-deps

  // Crystal Queen vulnerability reset: when it's the CQ player's turn, she's no longer vulnerable
  useEffect(() => {
    if (!hasCrystalQueen || !crystalQueenVulnerable || !crystalQueenColor) return
    if (chessRef.current.turn() === crystalQueenColor) {
      setCrystalQueenVulnerable(false)
    }
  }, [lastMove])  // eslint-disable-line react-hooks/exhaustive-deps

  // Space Chessbeard freeze clears when the freeze-setter's turn comes back
  useEffect(() => {
    if (!freezeSetByColor || !spaceChessbeardFrozenSquare) return
    if (chessRef.current.turn() === freezeSetByColor) {
      setSpaceChessbeardFrozenSquare(null)
      setFreezeSetByColor(null)
    }
  }, [tick])  // eslint-disable-line react-hooks/exhaustive-deps

  // Win / lose sound (fires once on transition to game-over)
  useEffect(() => {
    const cur = chessRef.current
    const status: GameStatus = timedOut
      ? (timedOut === 'w' ? 'black-wins' : 'white-wins')
      : resignedBy
      ? (resignedBy === 'w' ? 'black-wins' : 'white-wins')
      : getStatus(cur)
    if (prevStatusRef.current === 'playing' && status !== 'playing') {
      if (status === 'white-wins') playWin()
      else if (status === 'black-wins') playLose()
    }
    prevStatusRef.current = status
  }, [tick, timedOut, resignedBy])  // eslint-disable-line react-hooks/exhaustive-deps

  // Clear respawn animation after it plays
  useEffect(() => {
    if (respawnedSquares.length === 0) return
    const t = setTimeout(() => setRespawnedSquares([]), 1400)
    return () => clearTimeout(t)
  }, [respawnedSquares])

  // Power sounds — Unipop fire trail
  useEffect(() => {
    if (fireTrailSquares.length > 0) playPower()
  }, [fireTrailSquares])  // eslint-disable-line react-hooks/exhaustive-deps

  // Power sounds — Robin Rook arrow
  useEffect(() => {
    if (arrowShot) playPower()
  }, [arrowShot])  // eslint-disable-line react-hooks/exhaustive-deps

  // Timer tick for last 10 seconds
  useEffect(() => {
    if (timeLeft > 0 && timeLeft <= 10) playTimerTick()
  }, [timeLeft])  // eslint-disable-line react-hooks/exhaustive-deps

  // AI trigger — only in vsComputer mode
  useEffect(() => {
    if (gameMode !== 'vsComputer') return
    const cur = chessRef.current
    if (cur.turn() !== 'b' || getStatus(cur) !== 'playing' || resignedBy !== null) return
    setIsAIThinking(true)
    const timer = setTimeout(() => {
      const before = chessRef.current

      // The player's crystal queen is immune unless vulnerable — AI must not capture her
      const immuneCQSquare = (hasCrystalQueen && !crystalQueenVulnerable && crystalQueenColor === 'w')
        ? getCrystalQueenSquare(before, 'w') : null

      // Try a card power move first (random chance per power)
      const powerMove = tryAIPowerMove(before, aiCards)
      if (powerMove && powerMove.to !== immuneCQSquare) {
        chessRef.current = withRespawns(before, powerMove.newChess)
        setLastMove({ from: powerMove.from, to: powerMove.to })
        moveHistoryRef.current.push(formatMoveNotation(before, powerMove.from, powerMove.to))
        bump()
      } else {
        // Fall back to minimax
        const bestMove = getBestMove(before.fen(), 1)
        if (bestMove && bestMove.to !== immuneCQSquare) {
          const moved = applyPseudoLegalMove(before, bestMove.from, bestMove.to)
          chessRef.current = withRespawns(before, moved)
          setLastMove({ from: bestMove.from, to: bestMove.to })
          moveHistoryRef.current.push(formatMoveNotation(before, bestMove.from, bestMove.to))
          bump()
        } else if (immuneCQSquare) {
          // Best move would capture immune CQ — fall back to a random legal move that doesn't
          const safeMoves = before.moves({ verbose: true }).filter((m: any) => m.to !== immuneCQSquare)
          if (safeMoves.length > 0) {
            const pick = safeMoves[Math.floor(Math.random() * safeMoves.length)] as any
            const moved = applyPseudoLegalMove(before, pick.from as Square, pick.to as Square)
            chessRef.current = withRespawns(before, moved)
            setLastMove({ from: pick.from as Square, to: pick.to as Square })
            moveHistoryRef.current.push(formatMoveNotation(before, pick.from as Square, pick.to as Square))
            bump()
          }
        }
      }
      setIsAIThinking(false)
    }, 100)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  const onNewGame = useCallback(() => {
    chessRef.current = new Chess()
    fenHistoryRef.current = []
    moveHistoryRef.current = []
    clearSelection()
    setLastMove(null)
    setIsAIThinking(false)
    setFireTrailSquares([])
    setArrowShot(null)
    setTimeLeft(60)
    setTimedOut(null)
    setResignedBy(null)
    setGameActive(true)
    setCrystalQueenVulnerable(false)
    setRespawnedSquares([])
    setLegendaryHappyPawnPromoteSquare(null)
    promotePendingRef.current = null
    prevPieceCountRef.current = 32
    prevStatusRef.current = 'playing'
    bump()
  }, [bump])  // eslint-disable-line react-hooks/exhaustive-deps

  const onResign = useCallback(() => {
    setResignedBy(chessRef.current.turn())
  }, [])

  const onUndo = useCallback(() => {
    if (legendaryHappyPawnPromoteSquare && promotePendingRef.current) {
      chessRef.current = promotePendingRef.current.before
      setLegendaryHappyPawnPromoteSquare(null)
      promotePendingRef.current = null
      clearSelection()
      setLastMove(null)
      bump()
      return
    }
    if (unipopState || unipopBonusSquare || isRookShootMode || rookChoiceSquare || isChessbeardSelectMode || chessbeardSacrificeSquare) {
      if (unipopBonusSquare) chessRef.current = toggleTurn(chessRef.current)
      clearSelection(); return
    }
    const prev = fenHistoryRef.current.pop()
    if (!prev) return
    moveHistoryRef.current.length = prev.moveCount
    chessRef.current = new Chess(prev.fen, { skipValidation: true })
    clearSelection()
    setLastMove(null)
    setCrystalQueenVulnerable(false)
    bump()
  }, [chess, unipopState, unipopBonusSquare, isRookShootMode, rookChoiceSquare, isChessbeardSelectMode, chessbeardSacrificeSquare, bump])  // eslint-disable-line react-hooks/exhaustive-deps

  const cur = chessRef.current
  const rawStatus = getStatus(cur)
  const effectiveStatus: GameStatus = timedOut
    ? (timedOut === 'w' ? 'black-wins' : 'white-wins')
    : resignedBy
    ? (resignedBy === 'w' ? 'black-wins' : 'white-wins')
    : rawStatus

  const chessbeardAvailable = hasChessbeard
    && !hasSpaceChessbeard
    && effectiveStatus === 'playing'
    && !isChessbeardSelectMode
    && chessbeardSacrificeSquare === null
    && blackKingBonusSquare === null
    && unipopState === null
    && unipopBonusSquare === null
    && !isRookShootMode
    && rookChoiceSquare === null
    && !isSpaceChessbeardFreezeMode
    && !(gameMode === 'vsComputer' && cur.turn() === 'b')

  const spaceHappyPawnAvailable = hasSpaceHappyPawn
    && effectiveStatus === 'playing'
    && !isSpaceChessbeardFreezeMode
    && !isSpaceHappyPawnPlaceMode
    && !isChessbeardSelectMode
    && chessbeardSacrificeSquare === null
    && blackKingBonusSquare === null
    && unipopState === null
    && unipopBonusSquare === null
    && !isRookShootMode
    && rookChoiceSquare === null
    && !(gameMode === 'vsComputer' && cur.turn() === 'b')
    && countPawnsInReserve(cur, cur.turn()) > 0

  return {
    board: buildBoard(cur),
    selectedSquare,
    validTargets,
    turn: cur.turn(),
    status: effectiveStatus,
    isCheck: cur.isCheck(),
    moveHistory: [...moveHistoryRef.current],
    lastMove,
    isAIThinking,
    unipopState,
    unipopBonusSquare,
    unipopPathCaptures,
    rookChoiceSquare,
    isRookShootMode,
    fireTrailSquares,
    arrowShot,
    blackKingBonusSquare,
    isChessbeardSelectMode,
    chessbeardSacrificeSquare,
    chessbeardAvailable,
    isSpaceHappyPawnPlaceMode,
    isSpaceChessbeardFreezeMode,
    spaceChessbeardFrozenSquare,
    spaceHappyPawnAvailable,
    crystalQueenVulnerable,
    respawnedSquares,
    legendaryHappyPawnPromoteSquare,
    timeLeft,
    timedOut,
    resignedBy,
    gameMode,
    onSquareClick,
    onRookChoice,
    onSkipBlackKingBonus,
    onChessbeardActivate,
    onSpaceHappyPawnPlace,
    onLegendaryHappyPawnPromote,
    onNewGame,
    onUndo,
    onResign,
    applyExternalTurn,
  }
}
