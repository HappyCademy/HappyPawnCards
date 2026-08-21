import { Chess } from 'chess.js'
import type { Square, Color } from 'chess.js'

export function isKingOnBoard(chess: Chess, color: Color): boolean {
  for (const row of chess.board()) {
    for (const p of row) {
      if (p?.type === 'k' && p.color === color) return true
    }
  }
  return false
}

// All squares this piece can reach, ignoring whether it leaves own king in check.
// Handles sliding pieces, knight, pawn (with en passant), and king (with castling from chess.js).
export function getPseudoLegalTargets(chess: Chess, square: Square): Square[] {
  const piece = chess.get(square)
  if (!piece) return []

  const file = square.charCodeAt(0) - 97
  const rank = parseInt(square[1]) - 1
  const color = piece.color
  const targets: Square[] = []

  function sq(f: number, r: number): Square {
    return (String.fromCharCode(97 + f) + (r + 1)) as Square
  }
  function inBounds(f: number, r: number) { return f >= 0 && f <= 7 && r >= 0 && r <= 7 }
  function pieceAt(f: number, r: number) {
    if (!inBounds(f, r)) return null
    return chess.get(sq(f, r))
  }
  function canLand(f: number, r: number) {
    if (!inBounds(f, r)) return false
    const p = pieceAt(f, r)
    return !p || p.color !== color
  }
  function slide(df: number, dr: number) {
    let f = file + df, r = rank + dr
    while (inBounds(f, r)) {
      const p = pieceAt(f, r)
      if (p) {
        if (p.color !== color) targets.push(sq(f, r))
        break
      }
      targets.push(sq(f, r))
      f += df; r += dr
    }
  }

  switch (piece.type) {
    case 'p': {
      const dir = color === 'w' ? 1 : -1
      const startRank = color === 'w' ? 1 : 6
      // Forward 1
      if (inBounds(file, rank + dir) && !pieceAt(file, rank + dir)) {
        targets.push(sq(file, rank + dir))
        // Forward 2 from start rank
        if (rank === startRank && !pieceAt(file, rank + 2 * dir)) {
          targets.push(sq(file, rank + 2 * dir))
        }
      }
      // Diagonal captures
      for (const df of [-1, 1]) {
        const p = pieceAt(file + df, rank + dir)
        if (p && p.color !== color) targets.push(sq(file + df, rank + dir))
      }
      // En passant from FEN
      const epField = chess.fen().split(' ')[3]
      if (epField !== '-') {
        const epF = epField.charCodeAt(0) - 97
        const epR = parseInt(epField[1]) - 1
        if (epR === rank + dir && Math.abs(epF - file) === 1) {
          targets.push(sq(epF, epR))
        }
      }
      break
    }
    case 'n': {
      const nDeltas: [number, number][] = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]
      for (const [df, dr] of nDeltas) {
        if (canLand(file+df, rank+dr)) targets.push(sq(file+df, rank+dr))
      }
      break
    }
    case 'b': slide(1,1); slide(1,-1); slide(-1,1); slide(-1,-1); break
    case 'r': slide(0,1); slide(0,-1); slide(1,0); slide(-1,0); break
    case 'q':
      slide(1,1); slide(1,-1); slide(-1,1); slide(-1,-1)
      slide(0,1); slide(0,-1); slide(1,0); slide(-1,0)
      break
    case 'k': {
      const kDeltas: [number,number][] = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
      for (const [df, dr] of kDeltas) {
        if (canLand(file+df, rank+dr)) targets.push(sq(file+df, rank+dr))
      }
      // Castling: pull from chess.js legal moves (it tracks castling rights correctly)
      try {
        const legal = chess.moves({ square, verbose: true })
        for (const m of legal) {
          const flags = (m as { flags: string }).flags
          if ((flags.includes('k') || flags.includes('q')) && !targets.includes(m.to as Square)) {
            targets.push(m.to as Square)
          }
        }
      } catch { /* in check – no castling */ }
      break
    }
  }

  return targets
}

// Apply a move ignoring check constraints.
// Tries chess.js first (handles en passant, castling, promotion properly);
// falls back to FEN manipulation for moves chess.js rejects due to self-check.
export function applyPseudoLegalMove(chess: Chess, from: Square, to: Square): Chess {
  try {
    const next = new Chess(chess.fen())
    next.move({ from, to, promotion: 'q' })
    return next
  } catch {
    return applyViaFen(chess, from, to)
  }
}

function applyViaFen(chess: Chess, from: Square, to: Square): Chess {
  const piece = chess.get(from)
  if (!piece) return new Chess(chess.fen())

  const isWhite = piece.color === 'w'
  const toRank = parseInt(to[1])
  // Auto-promote pawns
  const fenChar = (piece.type === 'p' && (toRank === 8 || toRank === 1))
    ? (isWhite ? 'Q' : 'q')
    : (isWhite ? piece.type.toUpperCase() : piece.type)

  let fen = chess.fen()
  fen = setSquare(fen, from, null)
  fen = setSquare(fen, to, fenChar)

  const parts = fen.split(' ')
  parts[1] = isWhite ? 'b' : 'w'
  parts[3] = '-'
  parts[4] = '0'
  if (!isWhite) parts[5] = String(parseInt(parts[5]) + 1)

  try { return new Chess(parts.join(' '), { skipValidation: true }) }
  catch { return new Chess(chess.fen()) }
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
