import { Chess } from 'chess.js'
import type { Square } from 'chess.js'

function expandRow(row: string): string {
  let exp = ''
  for (const ch of row) exp += ch >= '1' && ch <= '8' ? '1'.repeat(parseInt(ch)) : ch
  return exp
}

function compressRow(exp: string): string {
  let comp = '', blanks = 0
  for (const ch of exp) {
    if (ch === '1') blanks++
    else { if (blanks) { comp += blanks; blanks = 0 } comp += ch }
  }
  if (blanks) comp += blanks
  return comp
}

function pieceChar(type: string, color: 'w' | 'b'): string {
  return color === 'w' ? type.toUpperCase() : type.toLowerCase()
}

function swapFen(fen: string, sqA: Square, sqB: Square, charA: string, charB: string): string {
  const parts = fen.split(' ')
  const rows = parts[0].split('/').map(expandRow)
  const fi = (sq: Square) => sq.charCodeAt(0) - 97
  const ri = (sq: Square) => 8 - parseInt(sq[1])
  rows[ri(sqA)] = rows[ri(sqA)].slice(0, fi(sqA)) + charB + rows[ri(sqA)].slice(fi(sqA) + 1)
  rows[ri(sqB)] = rows[ri(sqB)].slice(0, fi(sqB)) + charA + rows[ri(sqB)].slice(fi(sqB) + 1)
  parts[0] = rows.map(compressRow).join('/')
  return parts.join(' ')
}

/** Squares of own knights, bishops, rooks the queen can swap with (without leaving king in check). */
export function getCrystalQueenSwapTargets(chess: Chess, queenSquare: Square): Square[] {
  const queen = chess.get(queenSquare)
  if (!queen || queen.type !== 'q') return []
  const qChar = pieceChar('q', queen.color)
  const results: Square[] = []
  for (const row of chess.board()) {
    for (const p of row) {
      if (!p || p.color !== queen.color || !['n', 'b', 'r'].includes(p.type)) continue
      const targetSq = p.square as Square
      const testFen = swapFen(chess.fen(), queenSquare, targetSq, qChar, pieceChar(p.type, p.color))
      try {
        if (!new Chess(testFen, { skipValidation: true }).isCheck()) results.push(targetSq)
      } catch { /* skip */ }
    }
  }
  return results
}

/** Swap the queen with the piece at targetSquare and advance the turn. */
export function applyCrystalQueenSwap(chess: Chess, queenSquare: Square, targetSquare: Square): Chess {
  const queen = chess.get(queenSquare)
  const target = chess.get(targetSquare)
  if (!queen || !target) return chess
  const parts = swapFen(
    chess.fen(), queenSquare, targetSquare,
    pieceChar('q', queen.color), pieceChar(target.type, target.color),
  ).split(' ')
  parts[1] = parts[1] === 'w' ? 'b' : 'w'
  parts[3] = '-'
  if (queen.color === 'b') parts[5] = String(parseInt(parts[5]) + 1)
  try { return new Chess(parts.join(' '), { skipValidation: true }) } catch { return chess }
}
