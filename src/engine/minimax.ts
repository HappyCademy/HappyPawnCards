import { Chess } from 'chess.js'
import type { Square } from 'chess.js'
import { getPseudoLegalTargets } from './pseudolegal'

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
}

const PAWN_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0],
]
const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50],
]
const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20],
]
const ROOK_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0],
]
const QUEEN_TABLE = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20],
]
const KING_TABLE = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20],
]
const PIECE_TABLES: Record<string, number[][]> = {
  p: PAWN_TABLE, n: KNIGHT_TABLE, b: BISHOP_TABLE,
  r: ROOK_TABLE, q: QUEEN_TABLE, k: KING_TABLE,
}

function getPositionalBonus(type: string, color: 'w' | 'b', rank: number, file: number): number {
  const table = PIECE_TABLES[type]
  if (!table) return 0
  const row = color === 'w' ? 7 - rank : rank
  return table[row][file]
}

function evaluate(chess: Chess): number {
  // King capture is the only terminal condition
  let whiteKing = false, blackKing = false
  const board = chess.board()
  for (const row of board) {
    for (const p of row) {
      if (p?.type === 'k') {
        if (p.color === 'w') whiteKing = true
        else blackKing = true
      }
    }
  }
  if (!whiteKing) return -100000
  if (!blackKing) return 100000

  let score = 0
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f]
      if (!piece) continue
      const rank = 7 - r
      const val = PIECE_VALUES[piece.type] + getPositionalBonus(piece.type, piece.color, rank, f)
      score += piece.color === 'w' ? val : -val
    }
  }
  return score
}

function minimax(chess: Chess, depth: number, alpha: number, beta: number, maximizing: boolean): number {
  const score = evaluate(chess)
  if (Math.abs(score) >= 100000 || depth === 0) return score

  const moves = chess.moves()
  if (moves.length === 0) return score  // no legal moves — not a terminal in this variant

  if (maximizing) {
    let best = -Infinity
    for (const move of moves) {
      chess.move(move)
      best = Math.max(best, minimax(chess, depth - 1, alpha, beta, false))
      chess.undo()
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const move of moves) {
      chess.move(move)
      best = Math.min(best, minimax(chess, depth - 1, alpha, beta, true))
      chess.undo()
      beta = Math.min(beta, best)
      if (beta <= alpha) break
    }
    return best
  }
}

export function getBestMove(fen: string, depth = 3): { from: Square; to: Square } | null {
  const chess = new Chess(fen)
  const legalMoves = chess.moves({ verbose: true })

  if (legalMoves.length > 0) {
    const isMaximizing = chess.turn() === 'w'
    let bestMove = legalMoves[0]
    let bestScore = isMaximizing ? -Infinity : Infinity

    const shuffled = [...legalMoves].sort(() => Math.random() - 0.5)

    for (const move of shuffled) {
      chess.move(move)
      const score = minimax(chess, depth - 1, -Infinity, Infinity, !isMaximizing)
      chess.undo()
      if (isMaximizing ? score > bestScore : score < bestScore) {
        bestScore = score
        bestMove = move
      }
    }
    return { from: bestMove.from as Square, to: bestMove.to as Square }
  }

  // AI has no chess.js legal moves (in "checkmate" per standard rules).
  // Fall back to pseudo-legal: prefer king captures, else random move.
  return getPseudoLegalFallback(chess)
}

function getPseudoLegalFallback(chess: Chess): { from: Square; to: Square } | null {
  const color = chess.turn()
  const board = chess.board()
  const candidates: { from: Square; to: Square; priority: number }[] = []

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f]
      if (!piece || piece.color !== color) continue
      const from = (String.fromCharCode(97 + f) + (8 - r)) as Square
      const targets = getPseudoLegalTargets(chess, from)
      for (const to of targets) {
        const target = chess.get(to)
        const priority = target?.type === 'k' ? 2 : target ? 1 : 0
        candidates.push({ from, to, priority })
      }
    }
  }

  if (candidates.length === 0) return null
  candidates.sort((a, b) => b.priority - a.priority || Math.random() - 0.5)
  const { from, to } = candidates[0]
  return { from, to }
}
