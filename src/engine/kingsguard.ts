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

function teleportPawnFen(fen: string, from: Square, to: Square, pawnChar: string): string {
  const parts = fen.split(' ')
  const rows = parts[0].split('/').map(expandRow)
  const fi = (sq: Square) => sq.charCodeAt(0) - 97
  const ri = (sq: Square) => 8 - parseInt(sq[1])
  rows[ri(from)] = rows[ri(from)].slice(0, fi(from)) + '1' + rows[ri(from)].slice(fi(from) + 1)
  rows[ri(to)]   = rows[ri(to)].slice(0, fi(to)) + pawnChar + rows[ri(to)].slice(fi(to) + 1)
  parts[0] = rows.map(compressRow).join('/')
  return parts.join(' ')
}

/** All squares where teleporting this pawn would resolve the current check. */
export function getKingsGuardTeleportSquares(chess: Chess, pawnSquare: Square): Square[] {
  const piece = chess.get(pawnSquare)
  if (!piece || piece.type !== 'p') return []
  const pawnChar = piece.color === 'w' ? 'P' : 'p'
  const results: Square[] = []
  for (let fi = 0; fi < 8; fi++) {
    for (let rank = 1; rank <= 8; rank++) {
      const target = (String.fromCharCode(97 + fi) + rank) as Square
      if (target === pawnSquare) continue
      const occupant = chess.get(target)
      if (occupant && occupant.color === piece.color) continue
      // Skip promotion ranks to avoid needing promotion logic
      if (piece.color === 'w' && rank === 8) continue
      if (piece.color === 'b' && rank === 1) continue
      const testFen = teleportPawnFen(chess.fen(), pawnSquare, target, pawnChar)
      try {
        if (!new Chess(testFen, { skipValidation: true }).isCheck()) results.push(target)
      } catch { /* skip */ }
    }
  }
  return results
}

/** Teleport pawn from → to and advance the turn. */
export function applyKingsGuardTeleport(chess: Chess, from: Square, to: Square): Chess {
  const piece = chess.get(from)
  if (!piece) return chess
  const pawnChar = piece.color === 'w' ? 'P' : 'p'
  const parts = teleportPawnFen(chess.fen(), from, to, pawnChar).split(' ')
  parts[1] = parts[1] === 'w' ? 'b' : 'w'
  parts[3] = '-'
  parts[4] = '0'
  if (piece.color === 'b') parts[5] = String(parseInt(parts[5]) + 1)
  try { return new Chess(parts.join(' '), { skipValidation: true }) } catch { return chess }
}
