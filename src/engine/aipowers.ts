/**
 * AI power move selection.
 * Not optimised — the goal is to exercise each power code path so bugs surface fast.
 * Each power is attempted with a random probability; the first that returns a valid
 * move wins. If nothing fires, the caller falls back to regular minimax.
 */

import { Chess } from 'chess.js'
import type { Square, PieceSymbol } from 'chess.js'
import { applyPseudoLegalMove } from './pseudolegal'
import { applyUnipopMove, applyDir, type Dir, type UnipopState } from './unipop'
import { getRookShootTargets, applyRookShoot } from './robinrook'
import { getHappyPawnTargets, applyHappyPawnPush } from './happypawn'
import { getPuzzlePeteBishopTargets } from './puzzlepete'
import {
  getChessbeardSelectablePieces, getChessbeardTargets, applyChessbeardSacrifice,
} from './chessbeard'
import type { CardVariant } from '../data/cards'
import { CARD_POWERS } from '../data/powers'

const VALUES: Record<PieceSymbol, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
}

export interface AIPowerMove {
  newChess: Chess
  from: Square
  to: Square
}

// ── Entry point ────────────────────────────────────────────────────────────────

export function tryAIPowerMove(chess: Chess, aiCards: CardVariant[]): AIPowerMove | null {
  if (chess.turn() !== 'b') return null

  const has = (key: string) =>
    aiCards.some(c => Boolean((CARD_POWERS[c.characterId] as unknown as Record<string, unknown>)?.[key]))

  if (has('robinRookStay')     && Math.random() < 0.60) { const m = tryRobinRook(chess);  if (m) return m }
  if (has('puzzlePeteBounce')  && Math.random() < 0.60) { const m = tryPuzzlePete(chess); if (m) return m }
  if (has('unipopLPath')       && Math.random() < 0.55) { const m = tryUnipop(chess);     if (m) return m }
  if (has('happyPawnPush')     && Math.random() < 0.45) { const m = tryHappyPawn(chess);  if (m) return m }
  if (has('chessbeardSacrifice') && Math.random() < 0.20) { const m = tryChessbeard(chess); if (m) return m }

  return null
}

// ── Robin Rook: shoot the highest-value enemy in line of sight ────────────────

function tryRobinRook(chess: Chess): AIPowerMove | null {
  let best: { rook: Square; target: Square; value: number } | null = null

  for (const row of chess.board()) {
    for (const p of row) {
      if (!p || p.type !== 'r' || p.color !== 'b') continue
      for (const target of getRookShootTargets(chess, p.square)) {
        const enemy = chess.get(target)
        const val = enemy ? VALUES[enemy.type] : 0
        if (!best || val > best.value) best = { rook: p.square, target, value: val }
      }
    }
  }

  if (!best || best.value < 100) return null   // nothing worth shooting
  return { newChess: applyRookShoot(chess, best.target), from: best.rook, to: best.target }
}

// ── Puzzle Pete: bounce-capture the highest-value enemy ───────────────────────

function tryPuzzlePete(chess: Chess): AIPowerMove | null {
  let best: { bishop: Square; target: Square; value: number } | null = null

  for (const row of chess.board()) {
    for (const p of row) {
      if (!p || p.type !== 'b' || p.color !== 'b') continue
      for (const target of getPuzzlePeteBishopTargets(chess, p.square)) {
        const enemy = chess.get(target)
        if (!enemy || enemy.color !== 'w') continue
        const val = VALUES[enemy.type]
        if (!best || val > best.value) best = { bishop: p.square, target, value: val }
      }
    }
  }

  if (!best || best.value < 300) return null   // only capture pieces of real value
  return {
    newChess: applyPseudoLegalMove(chess, best.bishop, best.target),
    from: best.bishop,
    to: best.target,
  }
}

// ── Unipop: enumerate all L-paths, pick the one that captures the most ────────

const ALL_DIRS: Dir[] = ['up', 'down', 'left', 'right']
const OPP: Record<Dir, Dir>    = { up: 'down', down: 'up', left: 'right', right: 'left' }
const PERP: Record<Dir, Dir[]> = {
  up:    ['left', 'right'],
  down:  ['left', 'right'],
  left:  ['up',   'down'],
  right: ['up',   'down'],
}

function tryUnipop(chess: Chess): AIPowerMove | null {
  let best: { state: UnipopState; finalSq: Square; score: number } | null = null

  for (const row of chess.board()) {
    for (const p of row) {
      if (!p || p.type !== 'n' || p.color !== 'b') continue
      const kSq = p.square

      for (const dir1 of ALL_DIRS) {
        const sq1 = applyDir(kSq, dir1)
        if (!sq1) continue

        for (const dir2 of ALL_DIRS.filter(d => d !== OPP[dir1])) {
          const sq2 = applyDir(sq1, dir2)
          if (!sq2) continue

          for (const dir3 of (dir2 === dir1 ? PERP[dir2] : [dir2])) {
            const sq3 = applyDir(sq2, dir3)
            if (!sq3) continue
            const p3 = chess.get(sq3)
            if (p3 && p3.color === 'b') continue   // can't land on friendly

            // Score = value of white pieces destroyed along the full path
            let score = 0
            for (const sq of [sq1, sq2, sq3]) {
              const piece = chess.get(sq)
              if (piece && piece.color === 'w') score += VALUES[piece.type]
            }

            if (!best || score > best.score) {
              best = {
                state: { knightSquare: kSq, path: [sq1, sq2], dirs: [dir1, dir2] },
                finalSq: sq3,
                score,
              }
            }
          }
        }
      }
    }
  }

  if (!best) return null
  // Move even with no captures 35% of the time (exercises the code path)
  if (best.score === 0 && Math.random() > 0.35) return null

  return {
    newChess: applyUnipopMove(chess, best.state, best.finalSq),
    from: best.state.knightSquare,
    to: best.finalSq,
  }
}

// ── Happy Pawn: pick the push that kills the most white material ───────────────

function tryHappyPawn(chess: Chess): AIPowerMove | null {
  let best: { from: Square; to: Square; score: number } | null = null

  for (const row of chess.board()) {
    for (const p of row) {
      if (!p || p.type !== 'p' || p.color !== 'b') continue
      const pSq = p.square

      for (const to of getHappyPawnTargets(chess, pSq)) {
        const sameFile  = to[0] === pSq[0]
        const singleStep = Math.abs(parseInt(to[1]) - parseInt(pSq[1])) === 1

        let score = 0
        if (sameFile && singleStep) {
          // Push — check what white pieces get pushed off the bottom of the board (rank 1→0)
          const toFile = to.charCodeAt(0) - 97
          let scanR = parseInt(to[1]) - 1
          while (scanR >= 0) {
            const scanSq = (String.fromCharCode(97 + toFile) + (scanR + 1)) as Square
            const piece = chess.get(scanSq)
            if (piece) {
              if (scanR === 0) {           // this piece gets pushed off the board
                if (piece.color === 'w') score += VALUES[piece.type]
                else score -= VALUES[piece.type]
              }
            }
            scanR--
          }
          score += (parseInt(pSq[1]) - 2) * 15  // mild advancement bonus
        } else {
          const cap = chess.get(to)
          if (cap && cap.color === 'w') score = VALUES[cap.type]
        }

        if (!best || score > best.score) best = { from: pSq, to, score }
      }
    }
  }

  if (!best) return null
  if (best.score < 50 && Math.random() > 0.4) return null

  return {
    newChess: applyHappyPawnPush(chess, best.from, best.to),
    from: best.from,
    to: best.to,
  }
}

// ── Chessbeard: sacrifice the piece that minimises net material loss ───────────

function tryChessbeard(chess: Chess): AIPowerMove | null {
  let best: { sacrifice: Square; target: Square; netLoss: number } | null = null

  for (const sacrificeSq of getChessbeardSelectablePieces(chess)) {
    const targets = getChessbeardTargets(chess, sacrificeSq)
    if (!targets.length) continue
    const sacPiece = chess.get(sacrificeSq)!
    const sacVal = VALUES[sacPiece.type]

    for (const targetSq of targets) {
      const netLoss = sacVal - VALUES[chess.get(targetSq)!.type]
      if (!best || netLoss < best.netLoss) {
        best = { sacrifice: sacrificeSq, target: targetSq, netLoss }
      }
    }
  }

  if (!best) return null
  return {
    newChess: applyChessbeardSacrifice(chess, best.sacrifice, best.target),
    from: best.sacrifice,
    to: best.target,
  }
}
