import { useState, useRef, useCallback, useEffect } from 'react'
import { Chess } from 'chess.js'
import type { Square, PieceSymbol, Color } from 'chess.js'

export interface LichessPuzzleData {
  game: { id: string; pgn: string }
  puzzle: {
    id: string
    rating: number
    plays: number
    solution: string[]
    themes: string[]
    initialPly: number
    fen?: string       // puzzle start FEN (direct — no PGN replay needed)
    lastMove?: string  // UCI move that set up the position (e.g. "g4g3")
  }
}

export type PuzzleStatus = 'loading' | 'error' | 'playing' | 'correct' | 'wrong' | 'complete'

export type BoardCell = { type: PieceSymbol; color: Color; square: Square } | null

export function usePuzzle() {
  const [status, setStatus] = useState<PuzzleStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [puzzleData, setPuzzleData] = useState<LichessPuzzleData | null>(null)
  const [board, setBoard] = useState<BoardCell[][]>([])
  const [playerColor, setPlayerColor] = useState<Color>('w')
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [validTargets, setValidTargets] = useState<Square[]>([])
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null)
  const [streak, setStreak] = useState(0)
  const [solutionStep, setSolutionStep] = useState(0)

  const chessRef = useRef<Chess>(new Chess())
  const puzzleRef = useRef<LichessPuzzleData | null>(null)
  const stepRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  function cancelPending() {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  function clearSelection() {
    setSelectedSquare(null)
    setValidTargets([])
  }

  const fetchPuzzle = useCallback(async (type: 'random' | 'daily' = 'random') => {
    cancelPending()
    setStatus('loading')
    setError(null)
    clearSelection()
    setLastMove(null)
    setSolutionStep(0)
    stepRef.current = 0

    try {
      const url = type === 'daily'
        ? 'https://lichess.org/api/puzzle/daily'
        : 'https://lichess.org/api/puzzle/next'
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: LichessPuzzleData = await res.json()

      // Build the puzzle start position
      // Prefer the direct FEN from the API; fall back to PGN replay
      let puzzleChess: Chess
      if (data.puzzle.fen) {
        puzzleChess = new Chess(data.puzzle.fen)
      } else {
        const gameChess = new Chess()
        try {
          gameChess.loadPgn(data.game.pgn)
        } catch {
          gameChess.loadPgn(data.game.pgn.replace(/\[.*?\]\s*/gs, '').trim())
        }
        const allMoves = gameChess.history({ verbose: true })
        puzzleChess = new Chess()
        // initialPly is the ply number of solution[0] (1-indexed).
        // Replay initialPly - 1 moves to land on the position where the solver moves next.
        const plyCount = Math.min(data.puzzle.initialPly - 1, allMoves.length)
        for (let i = 0; i < plyCount; i++) {
          puzzleChess.move(allMoves[i].san)
        }
        // The triggering move (opponent's last move before the puzzle) for the highlight
        const triggerMove = allMoves[plyCount - 1]
        if (triggerMove && !data.puzzle.lastMove) {
          ;(data.puzzle as LichessPuzzleData['puzzle'] & { lastMove?: string }).lastMove =
            triggerMove.from + triggerMove.to + (triggerMove.promotion ?? '')
        }
      }

      if (!mountedRef.current) return
      chessRef.current = puzzleChess
      puzzleRef.current = data

      // Show the triggering move that set up the puzzle position
      const setupMove = data.puzzle.lastMove
      const initialLastMove = setupMove && setupMove.length >= 4
        ? { from: setupMove.slice(0, 2) as Square, to: setupMove.slice(2, 4) as Square }
        : null

      setPuzzleData(data)
      setPlayerColor(puzzleChess.turn())
      setBoard(puzzleChess.board() as BoardCell[][])
      setLastMove(initialLastMove)
      setSolutionStep(0)
      stepRef.current = 0
      setStatus('playing')
    } catch (e) {
      if (!mountedRef.current) return
      console.error('[usePuzzle] fetch failed:', e)
      setError('Could not load puzzle — check your connection.')
      setStatus('error')
    }
  }, [])

  // Fetch on mount
  useEffect(() => { fetchPuzzle('random') }, [fetchPuzzle])

  function handleSquareClick(sq: Square) {
    if (status !== 'playing') return
    const chess = chessRef.current
    const puzzle = puzzleRef.current
    if (!puzzle) return

    const solution = puzzle.puzzle.solution

    // Attempt move if a piece is already selected and this is a valid target
    if (selectedSquare && validTargets.includes(sq)) {
      const expectedUCI = solution[stepRef.current] ?? ''
      const expPromo = expectedUCI.length === 5 ? (expectedUCI[4] as PieceSymbol) : undefined

      // Determine promotion: use expected promo piece or default queen
      const raw = chess.board()
      const fIdx = selectedSquare.charCodeAt(0) - 97
      const rIdx = 8 - parseInt(selectedSquare[1])
      const movingPiece = raw[rIdx]?.[fIdx]
      const needsPromo = movingPiece?.type === 'p' && (sq[1] === '8' || sq[1] === '1')
      const promoToUse: PieceSymbol | undefined = needsPromo ? (expPromo ?? 'q') : undefined

      const moveResult = chess.move({ from: selectedSquare, to: sq, ...(promoToUse ? { promotion: promoToUse } : {}) })
      if (!moveResult) { clearSelection(); return }

      const playedUCI = moveResult.from + moveResult.to + (moveResult.promotion?.toLowerCase() ?? '')
      clearSelection()

      if (playedUCI === expectedUCI) {
        const newBoard = chess.board() as BoardCell[][]
        setBoard(newBoard)
        setLastMove({ from: moveResult.from as Square, to: moveResult.to as Square })
        const nextStep = stepRef.current + 1
        stepRef.current = nextStep
        setSolutionStep(nextStep)

        if (nextStep >= solution.length) {
          setStatus('complete')
          setStreak(s => s + 1)
          return
        }

        // Show "correct" flash, then auto-play opponent's move
        setStatus('correct')
        timeoutRef.current = setTimeout(() => {
          if (!mountedRef.current) return
          const oppUCI = solution[nextStep]
          const oppFrom = oppUCI.slice(0, 2) as Square
          const oppTo = oppUCI.slice(2, 4) as Square
          const oppPromo = oppUCI.length === 5 ? (oppUCI[4] as PieceSymbol) : undefined
          const oppMove = chess.move({ from: oppFrom, to: oppTo, ...(oppPromo ? { promotion: oppPromo } : {}) })
          if (!oppMove) return
          const afterStep = nextStep + 1
          stepRef.current = afterStep
          setSolutionStep(afterStep)
          setBoard(chess.board() as BoardCell[][])
          setLastMove({ from: oppMove.from as Square, to: oppMove.to as Square })
          if (afterStep >= solution.length) {
            setStatus('complete')
            setStreak(s => s + 1)
          } else {
            setStatus('playing')
          }
        }, 700)
      } else {
        // Wrong — undo and show feedback
        chess.undo()
        setStatus('wrong')
        setStreak(0)
        timeoutRef.current = setTimeout(() => {
          if (mountedRef.current) setStatus('playing')
        }, 1400)
      }
      return
    }

    // De-select if clicking already selected square
    if (selectedSquare === sq) { clearSelection(); return }

    // Select a piece belonging to the player
    const raw = chess.board()
    const fIdx = sq.charCodeAt(0) - 97
    const rIdx = 8 - parseInt(sq[1])
    const piece = raw[rIdx]?.[fIdx]

    if (piece && piece.color === playerColor) {
      setSelectedSquare(sq)
      const moves = chess.moves({ square: sq, verbose: true })
      setValidTargets(moves.map(m => m.to as Square))
    } else {
      clearSelection()
    }
  }

  return {
    status, error, puzzleData, board, playerColor,
    selectedSquare, validTargets, lastMove, streak, solutionStep,
    solutionLength: puzzleRef.current?.puzzle.solution.length ?? 0,
    fetchPuzzle, handleSquareClick,
  }
}
