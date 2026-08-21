import { Chess } from 'chess.js'
import type { Square } from 'chess.js'
import { applyPseudoLegalMove } from './pseudolegal'

export function getHappyPawnTargets(chess: Chess, square: Square): Square[] {
  const piece = chess.get(square)
  if (!piece || piece.type !== 'p') return []

  const file = square.charCodeAt(0) - 97
  const rank = parseInt(square[1]) - 1
  const color = piece.color
  const dir = color === 'w' ? 1 : -1
  const targets: Square[] = []

  function sq(f: number, r: number): Square {
    return (String.fromCharCode(97 + f) + (r + 1)) as Square
  }
  function inBounds(f: number, r: number) { return f >= 0 && f <= 7 && r >= 0 && r <= 7 }
  function pieceAt(f: number, r: number) {
    if (!inBounds(f, r)) return null
    return chess.get(sq(f, r))
  }

  // Forward 1 is always available — push clears the way
  if (inBounds(file, rank + dir)) {
    targets.push(sq(file, rank + dir))
  }

  // Forward 2 from start rank: only when both squares are empty (no push for double advance)
  const startRank = color === 'w' ? 1 : 6
  if (rank === startRank && !pieceAt(file, rank + dir) && !pieceAt(file, rank + 2 * dir)) {
    targets.push(sq(file, rank + 2 * dir))
  }

  // Diagonal captures (standard pawn behavior)
  for (const df of [-1, 1]) {
    const p = pieceAt(file + df, rank + dir)
    if (p && p.color !== color) targets.push(sq(file + df, rank + dir))
  }

  // En passant
  const epField = chess.fen().split(' ')[3]
  if (epField !== '-') {
    const epF = epField.charCodeAt(0) - 97
    const epR = parseInt(epField[1]) - 1
    if (epR === rank + dir && Math.abs(epF - file) === 1) {
      targets.push(sq(epF, epR))
    }
  }

  return targets
}

// Apply a Happy Pawn move. Forward 1 is a push; everything else delegates to normal logic.
export function applyHappyPawnPush(chess: Chess, from: Square, to: Square): Chess {
  const piece = chess.get(from)
  if (!piece) return chess

  const fromFile = from.charCodeAt(0) - 97
  const toFile   = to.charCodeAt(0) - 97
  const fromRank = parseInt(from[1]) - 1
  const toRank   = parseInt(to[1]) - 1

  const isSameFile = fromFile === toFile
  const isSingleStep = Math.abs(toRank - fromRank) === 1

  if (!isSameFile || !isSingleStep) {
    // Diagonal capture, en passant, or 2-square advance — use normal path
    return applyPseudoLegalMove(chess, from, to)
  }

  // ── Push ────────────────────────────────────────────────────────────────
  const color = piece.color
  const isWhite = color === 'w'
  const dir = isWhite ? 1 : -1

  // Collect only the contiguous chain of pieces starting at `to`; stop at first empty square
  const chain: { rank: number; fenChar: string }[] = []
  let r = toRank
  while (r >= 0 && r <= 7) {
    const curSq = (String.fromCharCode(97 + toFile) + (r + 1)) as Square
    const p = chess.get(curSq)
    if (!p) break  // empty square — push stops here
    chain.push({ rank: r, fenChar: p.color === 'w' ? p.type.toUpperCase() : p.type })
    r += dir
  }

  let fen = chess.fen()

  // Clear the pawn's origin
  fen = setSquare(fen, from, null)

  // Clear every square in the chain
  for (const { rank: pr } of chain) {
    fen = setSquare(fen, (String.fromCharCode(97 + toFile) + (pr + 1)) as Square, null)
  }

  // Reinsert each piece 1 step further; drop it if it leaves the board
  for (const { rank: pr, fenChar } of chain) {
    const newRank = pr + dir
    if (newRank >= 0 && newRank <= 7) {
      fen = setSquare(fen, (String.fromCharCode(97 + toFile) + (newRank + 1)) as Square, fenChar)
    }
    // else: piece is pushed off the board and removed
  }

  // Place the pawn at `to`, auto-promoting if it reaches the last rank
  const promotionRank = isWhite ? 7 : 0
  const pawnFen = toRank === promotionRank ? (isWhite ? 'Q' : 'q') : (isWhite ? 'P' : 'p')
  fen = setSquare(fen, to, pawnFen)

  // Update FEN metadata: toggle turn, clear en passant, reset half-move clock
  const parts = fen.split(' ')
  parts[1] = isWhite ? 'b' : 'w'
  parts[3] = '-'
  parts[4] = '0'
  if (!isWhite) parts[5] = String(parseInt(parts[5]) + 1)
  fen = parts.join(' ')

  try { return new Chess(fen, { skipValidation: true }) }
  catch { return chess }
}

function setSquare(fen: string, square: Square, piece: string | null): string {
  const [pos, ...rest] = fen.split(' ')
  const f = square.charCodeAt(0) - 97
  const r = parseInt(square[1]) - 1
  const rows = pos.split('/')
  const fenRow = 7 - r

  let exp = ''
  for (const ch of rows[fenRow]) {
    if (ch >= '1' && ch <= '8') exp += '1'.repeat(parseInt(ch))
    else exp += ch
  }
  exp = exp.slice(0, f) + (piece ?? '1') + exp.slice(f + 1)

  let comp = '', blanks = 0
  for (const ch of exp) {
    if (ch === '1') blanks++
    else { if (blanks) { comp += blanks; blanks = 0 } comp += ch }
  }
  if (blanks) comp += blanks
  rows[fenRow] = comp
  return [rows.join('/'), ...rest].join(' ')
}
