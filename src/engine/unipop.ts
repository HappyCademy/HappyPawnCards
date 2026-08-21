import { Chess } from 'chess.js'
import type { Square } from 'chess.js'

export interface UnipopState {
  knightSquare: Square
  destination: Square | null  // null = phase 0 (picking destination)
  path: Square[]              // not used during selection; kept for API compat
}

function toSquare(file: number, rank: number): Square | null {
  if (file < 0 || file > 7 || rank < 0 || rank > 7) return null
  return (String.fromCharCode(97 + file) + (rank + 1)) as Square
}

function coords(sq: Square): [number, number] {
  return [sq.charCodeAt(0) - 97, parseInt(sq[1]) - 1]
}

// All 8 knight destinations from `from`, excluding friendly-occupied squares
export function getAllKnightDestinations(chess: Chess, from: Square): Square[] {
  const [ff, fr] = coords(from)
  const deltas: [number, number][] = [
    [-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1],
  ]
  return deltas
    .map(([df, dr]) => toSquare(ff + df, fr + dr))
    .filter((sq): sq is Square => {
      if (!sq) return false
      const p = chess.get(sq)
      return !p || p.color !== chess.turn()
    })
}

// The 2 "corner" squares representing the bend point of each L-path from `from` to `to`
// Corner A = (to_file, from_rank): go along file axis first
// Corner B = (from_file, to_rank): go along rank axis first
export function getPathCorners(from: Square, to: Square): Square[] {
  const [ff, fr] = coords(from)
  const [tf, tr] = coords(to)
  return ([
    toSquare(tf, fr),
    toSquare(ff, tr),
  ] as (Square | null)[])
    .filter((sq): sq is Square => sq !== null && sq !== from && sq !== to)
}

// All squares between `from` and `to` through `corner` (excludes `from`, includes `to`)
export function getPathSquares(from: Square, to: Square, corner: Square): Square[] {
  const squares: Square[] = []

  function walk(sf: number, sr: number, ef: number, er: number, skipFirst: boolean) {
    const df = Math.sign(ef - sf)
    const dr = Math.sign(er - sr)
    const steps = Math.max(Math.abs(ef - sf), Math.abs(er - sr))
    for (let i = skipFirst ? 1 : 0; i <= steps; i++) {
      const sq = toSquare(sf + df * i, sr + dr * i)
      if (sq) squares.push(sq)
    }
  }

  const [ff, fr] = coords(from)
  const [cf, cr] = coords(corner)
  const [tf, tr] = coords(to)
  walk(ff, fr, cf, cr, true)
  walk(cf, cr, tf, tr, true)
  return squares
}

// Get valid targets for the current phase
export function getUnipopTargets(chess: Chess, state: UnipopState): Square[] {
  if (state.destination === null) {
    return getAllKnightDestinations(chess, state.knightSquare)
  }
  return getPathCorners(state.knightSquare, state.destination)
}

// Which path squares contain enemy pieces (captured during the move)
export function getPathCaptures(chess: Chess, pathSquares: Square[], turn: 'w' | 'b'): Square[] {
  return pathSquares.filter(sq => {
    const p = chess.get(sq)
    return p && p.color !== turn
  })
}

// Apply the Unipop move; pathSquares = all squares from origin (exclusive) to destination (inclusive)
export function applyUnipopMove(chess: Chess, knightSquare: Square, pathSquares: Square[]): Chess {
  const isWhite = chess.turn() === 'w'
  const knightFen = isWhite ? 'N' : 'n'
  const finalSquare = pathSquares[pathSquares.length - 1]

  let fen = chess.fen()

  fen = setPieceInFen(fen, knightSquare, null)

  for (let i = 0; i < pathSquares.length; i++) {
    const sq = pathSquares[i]
    const isFinal = i === pathSquares.length - 1
    const piece = chess.get(sq)
    if (isFinal || (piece && piece.color !== (isWhite ? 'w' : 'b'))) {
      fen = setPieceInFen(fen, sq, null)
    }
  }

  fen = setPieceInFen(fen, finalSquare, knightFen)

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

function setPieceInFen(fen: string, square: Square, piece: string | null): string {
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

  expanded = expanded.substring(0, file) + (piece ?? '1') + expanded.substring(file + 1)

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
