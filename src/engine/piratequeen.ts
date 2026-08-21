import { Chess } from 'chess.js'
import type { Square } from 'chess.js'

// Queen bounces off board edges in all 8 directions (like Puzzle Pete but for queens).
export function getPirateQueenTargets(chess: Chess, square: Square): Square[] {
  const piece = chess.get(square)
  if (!piece || piece.type !== 'q') return []

  const file = square.charCodeAt(0) - 97
  const rank = parseInt(square[1]) - 1
  const color = piece.color
  const allTargets: Square[] = []

  const DIRS: [number, number][] = [
    [1, 1], [1, -1], [-1, 1], [-1, -1],
    [1, 0], [-1, 0], [0, 1], [0, -1],
  ]

  for (const [initDf, initDr] of DIRS) {
    let f = file, r = rank
    let df = initDf, dr = initDr
    const visited = new Set<string>([square])

    for (let step = 0; step < 64; step++) {
      let nf = f + df
      let nr = r + dr

      if (nf < 0 || nf > 7) { df = -df; nf = f + df }
      if (nr < 0 || nr > 7) { dr = -dr; nr = r + dr }

      if (nf < 0 || nf > 7 || nr < 0 || nr > 7) break
      const key = String.fromCharCode(97 + nf) + (nr + 1)
      if (visited.has(key)) break
      visited.add(key)

      const nextSq = key as Square
      const blocker = chess.get(nextSq)
      if (blocker) {
        if (blocker.color !== color) allTargets.push(nextSq)
        break
      }
      allTargets.push(nextSq)
      f = nf
      r = nr
    }
  }

  return [...new Set(allTargets)]
}
