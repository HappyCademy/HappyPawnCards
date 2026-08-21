import { Chess } from 'chess.js'
import type { Square } from 'chess.js'

const DIRS: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]]
const ALL_DIRS: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]

function shootTargets(chess: Chess, rookSquare: Square, dirs: [number, number][]): Square[] {
  const isWhite = chess.turn() === 'w'
  const file = rookSquare.charCodeAt(0) - 97
  const rank = parseInt(rookSquare[1]) - 1
  const targets: Square[] = []

  for (const [df, dr] of dirs) {
    let f = file + df
    let r = rank + dr
    while (f >= 0 && f <= 7 && r >= 0 && r <= 7) {
      const sq = (String.fromCharCode(97 + f) + (r + 1)) as Square
      const piece = chess.get(sq)
      if (piece) {
        if (piece.color !== (isWhite ? 'w' : 'b')) targets.push(sq)
        break
      }
      f += df
      r += dr
    }
  }
  return targets
}

export function getRookShootTargets(chess: Chess, rookSquare: Square): Square[] {
  return shootTargets(chess, rookSquare, DIRS)
}

export function getAllDirShootTargets(chess: Chess, rookSquare: Square): Square[] {
  return shootTargets(chess, rookSquare, ALL_DIRS)
}

export function applyRookShoot(chess: Chess, targetSquare: Square): Chess {
  const isWhite = chess.turn() === 'w'
  let fen = chess.fen()
  fen = clearSquareInFen(fen, targetSquare)
  const parts = fen.split(' ')
  parts[1] = isWhite ? 'b' : 'w'
  parts[4] = '0'
  if (!isWhite) parts[5] = String(parseInt(parts[5]) + 1)
  fen = parts.join(' ')
  try {
    return new Chess(fen, { skipValidation: true })
  } catch {
    return new Chess(chess.fen())
  }
}

function clearSquareInFen(fen: string, square: Square): string {
  const [position, ...rest] = fen.split(' ')
  const file = square.charCodeAt(0) - 97
  const rank = parseInt(square[1]) - 1
  const fenRank = 7 - rank
  const ranks = position.split('/')

  let expanded = ''
  for (const ch of ranks[fenRank]) {
    if (ch >= '1' && ch <= '8') expanded += '1'.repeat(parseInt(ch))
    else expanded += ch
  }
  expanded = expanded.substring(0, file) + '1' + expanded.substring(file + 1)

  let compressed = ''
  let empties = 0
  for (const ch of expanded) {
    if (ch === '1') { empties++ }
    else { if (empties) { compressed += empties; empties = 0 } compressed += ch }
  }
  if (empties) compressed += empties

  ranks[fenRank] = compressed
  return [ranks.join('/'), ...rest].join(' ')
}
