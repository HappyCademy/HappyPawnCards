import { Chess } from 'chess.js'
import type { Square } from 'chess.js'

// Returns all squares the bishop can reach via wall-bouncing.
// Pieces still block the path; enemy pieces can be captured (bishop stops there).
export function getPuzzlePeteBishopTargets(chess: Chess, square: Square): Square[] {
  const piece = chess.get(square)
  if (!piece || piece.type !== 'b') return []

  const file = square.charCodeAt(0) - 97
  const rank = parseInt(square[1]) - 1
  const color = piece.color
  const allTargets: Square[] = []

  for (const [initDf, initDr] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as [number, number][]) {
    let f = file, r = rank
    let df = initDf, dr = initDr
    const visited = new Set<string>([square])

    for (let step = 0; step < 64; step++) {
      let nf = f + df
      let nr = r + dr

      // Reflect off walls
      if (nf < 0 || nf > 7) { df = -df; nf = f + df }
      if (nr < 0 || nr > 7) { dr = -dr; nr = r + dr }

      // Out of bounds after reflection (degenerate) or revisiting — stop
      if (nf < 0 || nf > 7 || nr < 0 || nr > 7) break
      const key = String.fromCharCode(97 + nf) + (nr + 1)
      if (visited.has(key)) break
      visited.add(key)

      const nextSq = key as Square
      const blocker = chess.get(nextSq)
      if (blocker) {
        if (blocker.color !== color) allTargets.push(nextSq)  // can capture enemy
        break  // blocked by any piece
      }

      allTargets.push(nextSq)
      f = nf
      r = nr
    }
  }

  // Deduplicate (two bounce rays can reach the same square)
  return [...new Set(allTargets)]
}
