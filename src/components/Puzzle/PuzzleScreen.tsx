import { useState } from 'react'
import type { Square } from 'chess.js'
import { usePuzzle, type BoardCell, type PuzzleStatus } from '../../hooks/usePuzzle'
import { usePieceSet, pieceUrl } from '../../context/PieceSetContext'

const D = "'Cinzel', Georgia, serif"
const B = "'Nunito', system-ui, sans-serif"

// ── PuzzleBoard ───────────────────────────────────────────────────────────────

const FILES = 'abcdefgh'

function PuzzleBoard({ board, selectedSquare, validTargets, lastMove, flipped, onSquareClick, dimmed }: {
  board: BoardCell[][]
  selectedSquare: Square | null
  validTargets: Square[]
  lastMove: { from: Square; to: Square } | null
  flipped: boolean
  onSquareClick: (sq: Square) => void
  dimmed?: boolean
}) {
  const { pieceSet } = usePieceSet()

  return (
    <div style={{
      position: 'relative', width: '100%', maxWidth: '480px',
      opacity: dimmed ? 0.6 : 1,
      transition: 'opacity 0.15s',
    }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          aspectRatio: '1',
          border: '3px solid #8b7355',
          borderRadius: '3px',
          overflow: 'hidden',
          width: '100%',
          userSelect: 'none',
        }}
      >
        {Array.from({ length: 8 }, (_, dr) =>
          Array.from({ length: 8 }, (_, dc) => {
            const boardRow = flipped ? 7 - dr : dr
            const boardCol = flipped ? 7 - dc : dc
            const piece = board[boardRow]?.[boardCol] ?? null

            const fileIdx = flipped ? 7 - dc : dc
            const rankNum = flipped ? dr + 1 : 8 - dr
            const sq = `${FILES[fileIdx]}${rankNum}` as Square

            const isLight = (dr + dc) % 2 === 0
            const isSelected = selectedSquare === sq
            const isTarget = validTargets.includes(sq)
            const isLastMove = lastMove?.from === sq || lastMove?.to === sq

            const sqBg = isSelected
              ? (isLight ? '#f6f669' : '#baca2b')
              : isLastMove
                ? (isLight ? '#cdd16f' : '#aaa23b')
                : isLight ? '#f0d9b5' : '#b58863'

            return (
              <div
                key={sq}
                onClick={() => onSquareClick(sq)}
                style={{ backgroundColor: sqBg, position: 'relative', cursor: 'pointer', aspectRatio: '1' }}
              >
                {isTarget && (
                  piece
                    ? <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(0,0,0,0.35)', zIndex: 2, pointerEvents: 'none' }} />
                    : <div style={{ position: 'absolute', inset: '28%', borderRadius: '50%', background: 'rgba(0,0,0,0.2)', zIndex: 2, pointerEvents: 'none' }} />
                )}
                {piece && (
                  <img
                    src={pieceUrl(pieceSet, piece.color, piece.type)}
                    alt={`${piece.color}${piece.type}`}
                    draggable={false}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
                  />
                )}
                {dr === 7 && (
                  <span style={{ position: 'absolute', bottom: '1px', right: '2px', fontSize: '9px', fontWeight: 600, color: isLight ? '#b58863' : '#f0d9b5', userSelect: 'none', pointerEvents: 'none', zIndex: 3, fontFamily: 'sans-serif' }}>
                    {FILES[fileIdx]}
                  </span>
                )}
                {dc === 0 && (
                  <span style={{ position: 'absolute', top: '1px', left: '2px', fontSize: '9px', fontWeight: 600, color: isLight ? '#b58863' : '#f0d9b5', userSelect: 'none', pointerEvents: 'none', zIndex: 3, fontFamily: 'sans-serif' }}>
                    {rankNum}
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── Skeleton board shown while loading ────────────────────────────────────────

function SkeletonBoard() {
  return (
    <div style={{
      width: '100%', maxWidth: '480px', aspectRatio: '1',
      border: '3px solid #8b7355', borderRadius: '3px', overflow: 'hidden',
      display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
    }}>
      {Array.from({ length: 64 }, (_, i) => {
        const r = Math.floor(i / 8), c = i % 8
        return (
          <div
            key={i}
            style={{
              backgroundColor: (r + c) % 2 === 0 ? '#f0d9b5' : '#b58863',
              aspectRatio: '1',
              opacity: 0.4,
            }}
          />
        )
      })}
    </div>
  )
}

// ── Feedback bar shown below board ────────────────────────────────────────────

function FeedbackBar({ status }: { status: PuzzleStatus }) {
  if (status === 'playing' || status === 'loading' || status === 'error') return null
  const configs = {
    correct: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', color: '#4ade80', icon: '✓', text: 'Best move!' },
    wrong:   { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  color: '#f87171', icon: '✗', text: 'Not the best — try again' },
    complete:{ bg: 'rgba(34,197,94,0.2)',   border: 'rgba(34,197,94,0.5)',  color: '#4ade80', icon: '★', text: 'Puzzle solved!' },
  }
  const cfg = configs[status as keyof typeof configs]
  if (!cfg) return null
  return (
    <div style={{
      marginTop: '10px', padding: '10px 16px', borderRadius: '10px',
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      display: 'flex', alignItems: 'center', gap: '10px',
      width: '100%', maxWidth: '480px',
    }}>
      <span style={{ fontSize: '18px', color: cfg.color, fontWeight: 700 }}>{cfg.icon}</span>
      <span style={{ fontFamily: B, fontSize: '14px', color: cfg.color, fontWeight: 600 }}>{cfg.text}</span>
    </div>
  )
}

// ── Theme tag ─────────────────────────────────────────────────────────────────

function formatTheme(t: string): string {
  return t.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

// ── Progress dots ─────────────────────────────────────────────────────────────

function SolutionProgress({ step, total }: { step: number; total: number }) {
  if (total <= 1) return null
  // Each pair = player move + opponent move. We show player move dots only (even indices: 0,2,4…)
  const playerMoves = Math.ceil(total / 2)
  const playerStep = Math.floor(step / 2)
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      {Array.from({ length: playerMoves }, (_, i) => (
        <div
          key={i}
          style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: i < playerStep ? '#4ade80' : i === playerStep ? 'rgba(201,162,39,0.8)' : 'rgba(255,255,255,0.15)',
            border: `1px solid ${i === playerStep ? 'rgba(201,162,39,0.6)' : 'rgba(255,255,255,0.1)'}`,
            transition: 'background 0.2s',
          }}
        />
      ))}
    </div>
  )
}

// ── Main PuzzleScreen ─────────────────────────────────────────────────────────

export default function PuzzleScreen({ onBack }: { onBack: () => void }) {
  const {
    status, error, puzzleData, board, playerColor,
    selectedSquare, validTargets, lastMove, streak, solutionStep, solutionLength,
    fetchPuzzle, handleSquareClick,
  } = usePuzzle()

  const [puzzleType, setPuzzleType] = useState<'random' | 'daily'>('random')
  const flipped = playerColor === 'b'
  const isInteractive = status === 'playing'

  function handleTypeSwitch(t: 'random' | 'daily') {
    setPuzzleType(t)
    fetchPuzzle(t)
  }

  return (
    <div className="min-h-screen game-bg flex flex-col items-center py-4 px-4">
      {/* Top bar */}
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
        <button
          onClick={onBack}
          style={{
            fontFamily: B, fontSize: '13px', color: 'var(--ivory-dim)',
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '4px',
            transition: 'color 0.15s', flexShrink: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory-dim)' }}
        >
          ← Back
        </button>

        <h1 style={{ fontFamily: D, color: 'var(--gold)', fontSize: 'clamp(14px, 3.5vw, 20px)', fontWeight: 700, letterSpacing: '0.08em', margin: 0, textAlign: 'center' }}>
          Chess Puzzles
        </h1>

        {/* Streak */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0,
          background: streak > 0 ? 'rgba(251,146,60,0.12)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${streak > 0 ? 'rgba(251,146,60,0.35)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '20px', padding: '4px 12px',
        }}>
          <span style={{ fontSize: '14px' }}>🔥</span>
          <span style={{ fontFamily: D, fontSize: '14px', fontWeight: 700, color: streak > 0 ? '#fb923c' : 'var(--ivory-dim)' }}>
            {streak}
          </span>
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{
        display: 'flex', gap: '4px', padding: '4px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px', marginBottom: '20px',
      }}>
        {(['random', 'daily'] as const).map(t => (
          <button
            key={t}
            onClick={() => handleTypeSwitch(t)}
            style={{
              fontFamily: D, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
              padding: '7px 18px', borderRadius: '8px', cursor: 'pointer', border: 'none',
              background: puzzleType === t ? 'rgba(201,162,39,0.2)' : 'transparent',
              color: puzzleType === t ? 'var(--gold)' : 'var(--ivory-dim)',
              transition: 'all 0.15s',
            }}
          >
            {t === 'daily' ? '☀ Daily' : '⚡ Random'}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div
        className="flex flex-col items-center lg:flex-row lg:items-start lg:justify-center"
        style={{ gap: '20px', width: '100%', maxWidth: '800px' }}
      >
        {/* Board column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '480px', gap: '0' }}>
          {status === 'loading' && <SkeletonBoard />}
          {status === 'error' && (
            <div style={{ width: '100%', maxWidth: '480px', aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <span style={{ fontSize: '36px' }}>⚠</span>
              <p style={{ fontFamily: B, color: 'var(--ivory-dim)', fontSize: '13px', textAlign: 'center', maxWidth: '260px', margin: 0 }}>{error}</p>
              <button
                onClick={() => fetchPuzzle(puzzleType)}
                style={{ fontFamily: D, fontSize: '12px', fontWeight: 700, color: 'var(--gold)', background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer' }}
              >
                Try Again
              </button>
            </div>
          )}
          {status !== 'loading' && status !== 'error' && board.length > 0 && (
            <PuzzleBoard
              board={board}
              selectedSquare={selectedSquare}
              validTargets={validTargets}
              lastMove={lastMove}
              flipped={flipped}
              onSquareClick={handleSquareClick}
              dimmed={!isInteractive && status !== 'complete'}
            />
          )}

          <FeedbackBar status={status} />
        </div>

        {/* Info panel */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '16px',
          width: '100%', maxWidth: '280px', flexShrink: 0,
        }}>
          {/* Whose turn + rating */}
          {puzzleData && (
            <>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '14px', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Turn indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '22px', filter: `drop-shadow(0 0 6px ${playerColor === 'w' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.6)'})` }}>
                    {playerColor === 'w' ? '♙' : '♟'}
                  </span>
                  <div>
                    <p style={{ fontFamily: D, color: 'var(--ivory)', fontSize: '14px', fontWeight: 700, margin: 0, letterSpacing: '0.04em' }}>
                      {playerColor === 'w' ? 'White' : 'Black'} to move
                    </p>
                    <p style={{ fontFamily: B, color: 'var(--ivory-dim)', fontSize: '11px', margin: 0, marginTop: '2px' }}>
                      Find the best move
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: D, fontSize: '11px', color: 'rgba(201,162,39,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Rating</span>
                  <span style={{ fontFamily: D, fontSize: '14px', fontWeight: 700, color: 'var(--gold)' }}>{puzzleData.puzzle.rating}</span>
                </div>

                {/* Progress */}
                {solutionLength > 1 && (
                  <div>
                    <p style={{ fontFamily: B, fontSize: '10px', color: 'var(--ivory-dim)', opacity: 0.6, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Progress</p>
                    <SolutionProgress step={solutionStep} total={solutionLength} />
                  </div>
                )}
              </div>

              {/* Themes */}
              {puzzleData.puzzle.themes.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '14px', padding: '14px 18px' }}>
                  <p style={{ fontFamily: B, fontSize: '10px', color: 'var(--ivory-dim)', opacity: 0.6, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Themes</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {puzzleData.puzzle.themes.slice(0, 5).map(t => (
                      <span
                        key={t}
                        style={{
                          fontFamily: B, fontSize: '11px', fontWeight: 600,
                          padding: '3px 10px', borderRadius: '20px',
                          background: 'rgba(100,160,224,0.1)',
                          border: '1px solid rgba(100,160,224,0.25)',
                          color: '#93c5fd',
                        }}
                      >
                        {formatTheme(t)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Puzzle ID */}
              <p style={{ fontFamily: B, fontSize: '10px', color: 'rgba(138,117,96,0.4)', textAlign: 'center', margin: 0 }}>
                #{puzzleData.puzzle.id} · {puzzleData.puzzle.plays.toLocaleString()} plays
              </p>
            </>
          )}

          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {status === 'complete' ? (
              <button
                onClick={() => fetchPuzzle(puzzleType)}
                style={{
                  padding: '14px', borderRadius: '50px', cursor: 'pointer',
                  fontFamily: D, fontWeight: 700, fontSize: '14px', letterSpacing: '0.08em',
                  background: 'linear-gradient(135deg, #c9a227 0%, #f0c040 100%)',
                  border: '2px solid #f0c040',
                  color: '#0d0a1a',
                  boxShadow: '0 4px 24px rgba(201,162,39,0.4)',
                  textTransform: 'uppercase',
                }}
              >
                Next Puzzle →
              </button>
            ) : (
              <>
                <button
                  onClick={() => fetchPuzzle(puzzleType)}
                  disabled={status === 'loading'}
                  style={{
                    padding: '12px', borderRadius: '50px', cursor: status === 'loading' ? 'default' : 'pointer',
                    fontFamily: D, fontWeight: 700, fontSize: '13px', letterSpacing: '0.08em',
                    background: 'rgba(201,162,39,0.08)',
                    border: '1.5px solid rgba(201,162,39,0.3)',
                    color: 'var(--gold)',
                    textTransform: 'uppercase',
                    opacity: status === 'loading' ? 0.5 : 1,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (status !== 'loading') (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,162,39,0.16)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,162,39,0.08)' }}
                >
                  {status === 'loading' ? 'Loading…' : '⟳ Next Puzzle'}
                </button>
              </>
            )}
          </div>

          {/* Lichess attribution */}
          <div style={{ textAlign: 'center' }}>
            <a
              href={puzzleData ? `https://lichess.org/training/${puzzleData.puzzle.id}` : 'https://lichess.org/training'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: B, fontSize: '10px', color: 'rgba(138,117,96,0.4)', textDecoration: 'none', letterSpacing: '0.05em' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(138,117,96,0.7)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(138,117,96,0.4)' }}
            >
              View on Lichess ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
