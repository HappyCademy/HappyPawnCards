import { Chess } from 'chess.js'
import type { Square, PieceSymbol } from 'chess.js'

export const PIECE_VALUE: Record<PieceSymbol, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 100,
}

// Own non-king pieces that have at least one valid sacrifice target.
export function getChessbeardSelectablePieces(chess: Chess, anyValue = false): Square[] {
  const color = chess.turn()
  const result: Square[] = []
  for (const row of chess.board()) {
    for (const p of row) {
      if (p && p.color === color && p.type !== 'k') {
        if (getChessbeardTargets(chess, p.square, anyValue).length > 0) result.push(p.square)
      }
    }
  }
  return result
}

// All opponent pieces with strictly lower value than the sacrificed piece.
// When anyValue is true (Space Chessbeard), targets ALL enemy non-king pieces.
export function getChessbeardTargets(chess: Chess, sacrificeSquare: Square, anyValue = false): Square[] {
  const sacrificed = chess.get(sacrificeSquare)
  if (!sacrificed) return []
  const threshold = PIECE_VALUE[sacrificed.type]
  const enemy = sacrificed.color === 'w' ? 'b' : 'w'
  const result: Square[] = []
  for (const row of chess.board()) {
    for (const p of row) {
      if (p && p.color === enemy && p.type !== 'k') {
        if (anyValue || PIECE_VALUE[p.type] < threshold) result.push(p.square)
      }
    }
  }
  return result
}

// Remove both pieces from the board and end the turn.
export function applyChessbeardSacrifice(chess: Chess, sacrificeSquare: Square, targetSquare: Square): Chess {
  let fen = chess.fen()
  fen = clearSquare(fen, sacrificeSquare)
  fen = clearSquare(fen, targetSquare)

  const isWhite = chess.turn() === 'w'
  const parts = fen.split(' ')
  parts[1] = isWhite ? 'b' : 'w'
  parts[3] = '-'
  parts[4] = '0'
  if (!isWhite) parts[5] = String(parseInt(parts[5]) + 1)
  fen = parts.join(' ')

  try { return new Chess(fen, { skipValidation: true }) }
  catch { return chess }
}

function clearSquare(fen: string, square: Square): string {
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
  exp = exp.slice(0, f) + '1' + exp.slice(f + 1)

  let comp = '', blanks = 0
  for (const ch of exp) {
    if (ch === '1') blanks++
    else { if (blanks) { comp += blanks; blanks = 0 } comp += ch }
  }
  if (blanks) comp += blanks
  rows[fenRow] = comp
  return [rows.join('/'), ...rest].join(' ')
}
