import { Chess } from 'chess.js'
import type { Square } from 'chess.js'

// Returns all squares the king can reach, including squares with friendly pieces.
export function getBlackKingTargets(chess: Chess, square: Square): Square[] {
  const piece = chess.get(square)
  if (!piece) return []

  const file = square.charCodeAt(0) - 97
  const rank = parseInt(square[1]) - 1
  const targets: Square[] = []

  function sq(f: number, r: number): Square {
    return (String.fromCharCode(97 + f) + (r + 1)) as Square
  }
  function inBounds(f: number, r: number) { return f >= 0 && f <= 7 && r >= 0 && r <= 7 }

  const kDeltas: [number, number][] = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
  for (const [df, dr] of kDeltas) {
    const nf = file + df, nr = rank + dr
    if (inBounds(nf, nr)) targets.push(sq(nf, nr))
  }

  // Castling via chess.js
  try {
    const legal = chess.moves({ square, verbose: true })
    for (const m of legal) {
      const flags = (m as { flags: string }).flags
      if ((flags.includes('k') || flags.includes('q')) && !targets.includes(m.to as Square)) {
        targets.push(m.to as Square)
      }
    }
  } catch {}

  return targets
}

// Move the king from `from` to `to`, removing whatever was there.
// If keepTurn is true the active side is not switched (used before the bonus move).
export function applyBlackKingCapture(chess: Chess, from: Square, to: Square, keepTurn: boolean): Chess {
  const piece = chess.get(from)
  if (!piece) return chess

  const fenChar = piece.color === 'w' ? 'K' : 'k'
  const parts = chess.fen().split(' ')

  let board = setSquare(parts[0], from, null)
  board = setSquare(board, to, fenChar)

  if (!keepTurn) parts[1] = parts[1] === 'w' ? 'b' : 'w'
  parts[3] = '-'
  parts[4] = '0'

  try { return new Chess([board, ...parts.slice(1)].join(' '), { skipValidation: true }) }
  catch { return chess }
}

// Toggle the active side without making a move (used to end the bonus move on skip).
export function toggleTurn(chess: Chess): Chess {
  const parts = chess.fen().split(' ')
  parts[1] = parts[1] === 'w' ? 'b' : 'w'
  try { return new Chess(parts.join(' '), { skipValidation: true }) }
  catch { return chess }
}

function setSquare(board: string, square: Square, piece: string | null): string {
  const f = square.charCodeAt(0) - 97
  const r = parseInt(square[1]) - 1
  const rows = board.split('/')
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
  return rows.join('/')
}
