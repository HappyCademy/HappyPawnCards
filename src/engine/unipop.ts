import { Chess } from 'chess.js'
import type { Square } from 'chess.js'

export type Dir = 'up' | 'down' | 'left' | 'right'

export interface UnipopState {
  knightSquare: Square
  path: Square[]   // squares visited so far: length 0 (just selected), 1 (after step1), 2 (after step2)
  dirs: Dir[]      // directions taken so far
}

const DIR_DELTA: Record<Dir, [number, number]> = {
  up:    [0,  1],
  down:  [0, -1],
  left:  [-1, 0],
  right: [1,  0],
}

const OPPOSITE: Record<Dir, Dir> = {
  up: 'down', down: 'up', left: 'right', right: 'left',
}

const PERPENDICULAR: Record<Dir, Dir[]> = {
  up:    ['left', 'right'],
  down:  ['left', 'right'],
  left:  ['up',   'down'],
  right: ['up',   'down'],
}

const ALL_DIRS: Dir[] = ['up', 'down', 'left', 'right']

export function applyDir(sq: Square, dir: Dir): Square | null {
  const file = sq.charCodeAt(0) - 97
  const rank = parseInt(sq[1]) - 1
  const [df, dr] = DIR_DELTA[dir]
  const nf = file + df
  const nr = rank + dr
  if (nf < 0 || nf > 7 || nr < 0 || nr > 7) return null
  return (String.fromCharCode(97 + nf) + (nr + 1)) as Square
}

function friendlyAt(chess: Chess, sq: Square): boolean {
  const piece = chess.get(sq)
  return !!piece && piece.color === chess.turn()
}

// Phase 1: all 4 orthogonal squares — knight can pass through friendly pieces
export function getPhase1Targets(_chess: Chess, knightSquare: Square): Square[] {
  return ALL_DIRS
    .map(dir => applyDir(knightSquare, dir))
    .filter((sq): sq is Square => sq !== null)
}

// Phase 2: 3 directions (no going back) — knight can pass through friendly pieces
export function getPhase2Targets(_chess: Chess, state: UnipopState): Square[] {
  const from = state.path[0]
  const came = state.dirs[0]
  return ALL_DIRS
    .filter(dir => dir !== OPPOSITE[came])
    .map(dir => applyDir(from, dir))
    .filter((sq): sq is Square => sq !== null)
}

// Phase 3: must-turn or must-continue depending on step 2
export function getPhase3Targets(chess: Chess, state: UnipopState): Square[] {
  const from = state.path[1]
  const dir1 = state.dirs[0]
  const dir2 = state.dirs[1]
  const allowed = dir2 === dir1 ? PERPENDICULAR[dir2] : [dir2]
  return allowed
    .map(dir => applyDir(from, dir))
    .filter((sq): sq is Square => sq !== null && !friendlyAt(chess, sq))
}

// Get the current valid targets given the state
export function getUnipopTargets(chess: Chess, state: UnipopState): Square[] {
  if (state.dirs.length === 0) return getPhase1Targets(chess, state.knightSquare)
  if (state.dirs.length === 1) return getPhase2Targets(chess, state)
  return getPhase3Targets(chess, state)
}

// Which squares on the already-walked path have enemy pieces (will be captured)
export function getPathCaptures(chess: Chess, state: UnipopState): Square[] {
  return state.path.filter(sq => {
    const p = chess.get(sq)
    return p && p.color !== chess.turn()
  })
}

// Apply the Unipop move via FEN manipulation and return the new Chess instance
export function applyUnipopMove(chess: Chess, state: UnipopState, finalSquare: Square): Chess {
  const fullPath: Square[] = [...state.path, finalSquare]
  const isWhite = chess.turn() === 'w'
  const knightFen = isWhite ? 'N' : 'n'

  let fen = chess.fen()

  // Remove the knight from its starting square
  fen = setPieceInFen(fen, state.knightSquare, null)

  // On intermediate squares: only remove enemy pieces (friendly pieces are jumped over, not captured)
  // On the final square: always clear it (phase 3 already ensures it's not a friendly)
  for (let i = 0; i < fullPath.length; i++) {
    const sq = fullPath[i]
    const isFinal = i === fullPath.length - 1
    const piece = chess.get(sq)
    if (isFinal || (piece && piece.color !== (isWhite ? 'w' : 'b'))) {
      fen = setPieceInFen(fen, sq, null)
    }
  }

  // Place knight at final square
  fen = setPieceInFen(fen, finalSquare, knightFen)

  // Update FEN metadata: toggle turn, reset halfmove clock, increment fullmove if black just moved
  const parts = fen.split(' ')
  parts[1] = isWhite ? 'b' : 'w'
  parts[4] = '0'  // halfmove clock resets on any piece move
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
