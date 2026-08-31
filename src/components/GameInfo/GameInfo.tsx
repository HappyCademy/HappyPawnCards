import { useState, useEffect, useRef } from 'react'
import type { GameState, GameActions } from '../../hooks/useChessGame'
import MoveHistory from './MoveHistory'
import PieceSetPicker from './PieceSetPicker'

interface Props {
  state: GameState
  actions: GameActions
}

const D = "'Cinzel', Georgia, serif"
const B = "'Nunito', system-ui, sans-serif"

export default function GameInfo({ state, actions }: Props) {
  const {
    turn, status, isCheck, isAIThinking, moveHistory,
    unipopState, unipopBonusSquare, rookChoiceSquare, isRookShootMode, blackKingBonusSquare,
    isChessbeardSelectMode, chessbeardSacrificeSquare, chessbeardAvailable,
    isSpaceHappyPawnPlaceMode, isSpaceChessbeardFreezeMode, spaceHappyPawnAvailable,
    timeLeft, timedOut, resignedBy, gameMode,
  } = state

  const isGameOver = status !== 'playing'
  const isUnipopActive = unipopState !== null
  const isUnipopBonus = unipopBonusSquare !== null
  const unipopPhase = unipopState ? (unipopState.destination === null ? 1 : 2) : 0
  const isRookChoosing = rookChoiceSquare !== null
  const isBlackKingBonus = blackKingBonusSquare !== null
  const isChessbeardActive = isChessbeardSelectMode || chessbeardSacrificeSquare !== null
  const isSpaceActive = isSpaceChessbeardFreezeMode || isSpaceHappyPawnPlaceMode
  const isVsPlayer = gameMode === 'vsPlayer'

  const [resignPending, setResignPending] = useState(false)
  const [showPiecePicker, setShowPiecePicker] = useState(false)
  const [robiMood, setRobiMood] = useState<'yourturn' | 'thinking' | 'yum'>('yourturn')
  const prevThinkingRef = useRef(false)

  useEffect(() => {
    if (isVsPlayer || isGameOver) return
    const wasThinking = prevThinkingRef.current
    prevThinkingRef.current = isAIThinking
    if (isAIThinking) { setRobiMood('thinking'); return }
    if (wasThinking) {
      setRobiMood('yum')
      const t = setTimeout(() => setRobiMood('yourturn'), 1200)
      return () => clearTimeout(t)
    }
    setRobiMood('yourturn')
  }, [isAIThinking, isGameOver, isVsPlayer])

  const turnLabel = turn === 'w'
    ? (isVsPlayer ? 'Player 1' : 'You')
    : (isVsPlayer ? 'Player 2' : 'AI')

  let robiSrc: string | null = null
  if (!isVsPlayer) {
    if (isGameOver) {
      robiSrc = status === 'black-wins' ? '/images/robi/robi-win.png' : '/images/robi/robi-lost.png'
    } else if (robiMood === 'thinking') {
      robiSrc = '/images/robi/robi-thinking.png'
    } else if (robiMood === 'yum') {
      robiSrc = '/images/robi/robi-yum.png'
    } else {
      robiSrc = '/images/robi/robi-yourturn.png'
    }
  }

  // ── Status text ───────────────────────────────────────────────────────────────

  let statusIcon = '🟢'
  let statusLine: string
  let statusColor = '#4ade80'
  let bannerBorderColor = 'rgba(74,222,128,0.3)'
  let isTurnPill = false

  if (isGameOver) {
    statusIcon = '♛'
    const isResign = resignedBy !== null
    const isTimeout = timedOut !== null
    if (status === 'white-wins') {
      statusLine = isResign ? (isVsPlayer ? 'Player 1 resigned — Player 2 wins!' : 'You resigned')
        : isTimeout ? "Time's up — White loses!"
        : isVsPlayer ? 'Player 1 wins!' : 'You win!'
    } else if (status === 'black-wins') {
      statusLine = isResign ? (isVsPlayer ? 'Player 2 resigned — Player 1 wins!' : 'You resigned — AI wins!')
        : isTimeout ? "Time's up — Black loses!"
        : isVsPlayer ? 'Player 2 wins!' : 'AI wins!'
    } else {
      statusLine = 'Draw!'
    }
    statusColor = 'var(--gold-bright)'
    bannerBorderColor = 'rgba(201,162,39,0.4)'
  } else if (isSpaceChessbeardFreezeMode) {
    statusIcon = '🔒'; statusLine = 'Space Chessbeard — pick a piece to freeze'
    statusColor = '#818cf8'; bannerBorderColor = 'rgba(129,140,248,0.35)'
  } else if (isSpaceHappyPawnPlaceMode) {
    statusIcon = '🚀'; statusLine = 'Happy Pawn — pick a square to place a pawn'
    statusColor = '#4ade80'; bannerBorderColor = 'rgba(74,222,128,0.35)'
  } else if (isBlackKingBonus) {
    statusIcon = '♛'; statusLine = 'Black King — bonus move!'
    statusColor = '#fbbf24'; bannerBorderColor = 'rgba(251,191,36,0.35)'
  } else if (isChessbeardSelectMode) {
    statusIcon = '⚔'; statusLine = 'Pick a piece to sacrifice'
    statusColor = '#f87171'; bannerBorderColor = 'rgba(248,113,113,0.35)'
  } else if (chessbeardSacrificeSquare) {
    statusIcon = '⚔'; statusLine = 'Pick an enemy to destroy'
    statusColor = '#f87171'; bannerBorderColor = 'rgba(248,113,113,0.35)'
  } else if (isUnipopBonus) {
    statusIcon = '🦄'; statusLine = 'Double Jump — jump again or click anywhere to pass'
    statusColor = '#c084fc'; bannerBorderColor = 'rgba(192,132,252,0.35)'
  } else if (isUnipopActive) {
    statusIcon = '🦄'; statusLine = unipopPhase === 1 ? 'Unipop — pick a destination' : 'Unipop — pick which L-path'
    statusColor = '#c084fc'; bannerBorderColor = 'rgba(192,132,252,0.35)'
  } else if (isRookChoosing) {
    statusIcon = '🏹'; statusLine = 'Robin Rook — Move or Shoot?'
    statusColor = '#fb923c'; bannerBorderColor = 'rgba(251,146,60,0.35)'
  } else if (isRookShootMode) {
    statusIcon = '🎯'; statusLine = 'Robin Rook — Pick a target'
    statusColor = '#fb923c'; bannerBorderColor = 'rgba(251,146,60,0.35)'
  } else if (isAIThinking && !isVsPlayer) {
    statusIcon = '⧗'; statusLine = 'AI is thinking...'
    statusColor = '#a08fff'; bannerBorderColor = 'rgba(160,143,255,0.3)'
  } else if (isCheck) {
    statusIcon = '⚠'; statusLine = `${turnLabel} is in check!`
    statusColor = '#fb923c'; bannerBorderColor = 'rgba(251,146,60,0.4)'
  } else {
    isTurnPill = true
    if (turn === 'w') {
      statusIcon = 'ℹ'; statusLine = isVsPlayer ? 'Player 1' : 'Your Turn!'
      statusColor = '#60b4f8'; bannerBorderColor = 'rgba(96,180,248,0.45)'
    } else {
      statusIcon = '💀'; statusLine = isVsPlayer ? 'Player 2' : "Opponent's Turn..."
      statusColor = '#f87171'; bannerBorderColor = 'rgba(248,113,113,0.35)'
    }
  }

  const hint = isGameOver ? ''
    : isSpaceChessbeardFreezeMode ? 'Click an opponent piece to freeze it for their next turn'
    : isSpaceHappyPawnPlaceMode ? 'Click a green square to place a pawn from your reserve'
    : isBlackKingBonus ? 'Move the king again, or skip below'
    : isChessbeardSelectMode ? 'Click one of your highlighted pieces'
    : chessbeardSacrificeSquare ? 'Click a red-highlighted enemy, or reselect'
    : isUnipopBonus ? 'Click a highlighted square for second jump, or click anywhere else to end turn'
    : isUnipopActive ? 'Click a highlighted square to trace the L-path'
    : isRookChoosing ? 'Click Move to reposition, or Shoot to capture in place'
    : isRookShootMode ? 'Click an orange-highlighted enemy to shoot'
    : isCheck ? 'Get your king out of danger!'
    : turn === 'w' ? "Capture the opponent's king to win!"
    : (isVsPlayer ? "Capture the opponent's king to win!" : 'Waiting for AI...')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', color: 'var(--ivory)', fontFamily: B }}>

      {/* ── Status banner ──────────────────────────────────────────────────── */}
      {isTurnPill ? (
        /* "Your Turn" / "Opponent's Turn" split-pill from kit */
        <div style={{
          display: 'flex', alignItems: 'stretch', overflow: 'hidden',
          borderRadius: '50px',
          border: `1.5px solid ${bannerBorderColor}`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
          backdropFilter: 'blur(14px)',
        }}>
          {/* Icon side */}
          <div style={{
            width: '46px', flexShrink: 0,
            background: turn === 'w'
              ? 'linear-gradient(160deg, #1a4a8a, #1a2a60)'
              : 'linear-gradient(160deg, #6a0808, #3a0404)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', lineHeight: 1,
          }}>
            {turn === 'w' ? 'ℹ' : '💀'}
          </div>
          {/* Text side */}
          <div style={{
            flex: 1, padding: '10px 14px',
            background: turn === 'w'
              ? 'rgba(30,60,120,0.5)'
              : 'rgba(60,10,10,0.6)',
            display: 'flex', alignItems: 'center',
          }}>
            <span style={{ fontFamily: D, fontWeight: 600, fontSize: '13px', color: statusColor, letterSpacing: '0.04em' }}>
              {statusLine}
            </span>
          </div>
        </div>
      ) : (
        /* Special state — icon circle + text */
        <div style={{
          background: 'rgba(13,10,26,0.85)',
          border: `1.5px solid ${bannerBorderColor}`,
          borderRadius: '14px',
          padding: '10px 14px 10px 10px',
          backdropFilter: 'blur(14px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
              background: `rgba(${
                statusColor === '#f87171' ? '248,113,113' :
                statusColor === 'var(--gold-bright)' ? '201,162,39' :
                statusColor === '#c084fc' ? '192,132,252' :
                statusColor === '#fb923c' ? '251,146,60' :
                statusColor === '#fbbf24' ? '251,191,36' :
                statusColor === '#a08fff' ? '160,143,255' : '74,222,128'
              },0.18)`,
              border: `1.5px solid ${bannerBorderColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', lineHeight: 1,
            }}>
              {statusIcon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: D, fontWeight: 600, fontSize: '12px', color: statusColor, letterSpacing: '0.04em', display: 'block' }}>
                {statusLine}
              </span>
              {hint && (
                <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'var(--ivory-dim)', fontWeight: 600, lineHeight: 1.4 }}>
                  {hint}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Robi mood (vsComputer only) ────────────────────────────────────── */}
      {robiSrc && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 0' }}>
          <img
            key={robiSrc}
            src={robiSrc}
            alt="Robi"
            style={{
              height: '88px',
              objectFit: 'contain',
              animation: 'robi-pop 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          />
        </div>
      )}

      {/* ── Player badges ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
        <PlayerBadge
          label={isVsPlayer ? 'Player 1' : 'You'}
          sublabel="White"
          color="white"
          active={turn === 'w' && !isGameOver}
          timeLeft={turn === 'w' && !isGameOver ? timeLeft : undefined}
        />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: 700, color: 'rgba(201,162,39,0.3)',
          letterSpacing: '0.08em', flexShrink: 0, fontFamily: D,
        }}>
          VS
        </div>
        <PlayerBadge
          label={isVsPlayer ? 'Player 2' : 'AI'}
          sublabel="Black"
          color="black"
          active={turn === 'b' && !isGameOver}
          timeLeft={turn === 'b' && !isGameOver ? timeLeft : undefined}
        />
      </div>

      {/* ── Move history ───────────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(13,10,26,0.7)',
        borderRadius: '14px',
        padding: '10px 12px',
        border: '1px solid rgba(201,162,39,0.12)',
        backdropFilter: 'blur(8px)',
        flexGrow: 1,
        minHeight: '80px',
      }}>
        <MoveHistory moves={moveHistory} />
      </div>

      {/* ── Power buttons ──────────────────────────────────────────────────── */}
      {isBlackKingBonus && (
        <GameBtn onClick={actions.onSkipBlackKingBonus} variant="yellow">
          ♛ Skip bonus move
        </GameBtn>
      )}
      {chessbeardAvailable && !isGameOver && (
        <GameBtn onClick={actions.onChessbeardActivate} variant="red">
          ⚔ Sacrifice (Chessbeard)
        </GameBtn>
      )}
      {spaceHappyPawnAvailable && !isGameOver && (
        <GameBtn onClick={actions.onSpaceHappyPawnPlace} variant="space">
          🚀 Place Pawn (Reserve)
        </GameBtn>
      )}
      {(isChessbeardActive || isSpaceActive) && (
        <GameBtn onClick={actions.onUndo} variant="ghost">
          ✕ Cancel
        </GameBtn>
      )}

      {/* ── Undo / New Game ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={actions.onUndo}
          disabled={moveHistory.length === 0 || isAIThinking}
          style={{
            flex: 1, padding: '10px', borderRadius: '50px',
            border: '1.5px solid rgba(201,162,39,0.2)',
            background: 'rgba(13,10,26,0.7)', color: 'var(--ivory-dim)',
            fontFamily: B, fontWeight: 700, fontSize: '12px', cursor: 'pointer',
            opacity: (moveHistory.length === 0 || isAIThinking) ? 0.3 : 1,
            backdropFilter: 'blur(8px)', letterSpacing: '0.04em',
          }}
        >
          ↩ Undo
        </button>
        <button
          onClick={actions.onNewGame}
          style={{
            flex: 1, padding: '10px', borderRadius: '50px',
            border: '1.5px solid var(--gold)',
            background: 'linear-gradient(160deg, #3a1060 0%, #1a0d36 100%)',
            color: 'var(--gold-bright)', fontFamily: D, fontWeight: 700, fontSize: '12px',
            cursor: 'pointer', letterSpacing: '0.06em',
            boxShadow: '0 4px 16px rgba(201,162,39,0.2)',
          }}
        >
          ♛ Menu
        </button>
      </div>

      {/* ── Piece style ────────────────────────────────────────────────────── */}
      <button
        onClick={() => setShowPiecePicker(true)}
        style={{
          width: '100%', padding: '8px', borderRadius: '12px',
          border: '1px solid rgba(201,162,39,0.12)',
          background: 'transparent', color: 'rgba(138,117,96,0.6)',
          fontFamily: B, fontWeight: 700, fontSize: '11px', cursor: 'pointer',
          letterSpacing: '0.04em', transition: 'color 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory-dim)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(138,117,96,0.6)' }}
      >
        ♟ Piece Style
      </button>

      {showPiecePicker && <PieceSetPicker onClose={() => setShowPiecePicker(false)} />}

      {/* ── Resign ─────────────────────────────────────────────────────────── */}
      {!isGameOver && (
        resignPending ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { actions.onResign(); setResignPending(false) }}
              style={{
                flex: 1, padding: '9px', borderRadius: '12px',
                border: '1px solid rgba(248,113,113,0.4)',
                background: 'rgba(248,113,113,0.1)', color: '#f87171',
                fontFamily: B, fontWeight: 800, fontSize: '12px', cursor: 'pointer',
              }}
            >
              Confirm resign
            </button>
            <button
              onClick={() => setResignPending(false)}
              style={{
                flex: 1, padding: '9px', borderRadius: '12px',
                border: '1px solid rgba(201,162,39,0.15)',
                background: 'transparent', color: 'var(--ivory-dim)',
                fontFamily: B, fontWeight: 700, fontSize: '12px', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setResignPending(true)}
            style={{
              width: '100%', padding: '8px', borderRadius: '12px',
              border: '1px solid rgba(201,162,39,0.1)',
              background: 'transparent', color: 'rgba(138,117,96,0.5)',
              fontFamily: B, fontWeight: 700, fontSize: '11px', cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(138,117,96,0.5)' }}
          >
            🏳 Resign
          </button>
        )
      )}
    </div>
  )
}

// ── Reusable game button ───────────────────────────────────────────────────────

function GameBtn({ onClick, variant, children }: {
  onClick: () => void
  variant: 'yellow' | 'red' | 'ghost' | 'space'
  children: React.ReactNode
}) {
  const styles: Record<string, React.CSSProperties> = {
    yellow: {
      background: 'linear-gradient(160deg, #3a1060 0%, #1a0d36 100%)',
      border: '1.5px solid rgba(201,162,39,0.5)',
      color: 'var(--gold)',
    },
    red: {
      background: 'rgba(248,113,113,0.1)',
      border: '1.5px solid rgba(248,113,113,0.4)',
      color: '#f87171',
    },
    ghost: {
      background: 'rgba(13,10,26,0.6)',
      border: '1.5px solid rgba(255,255,255,0.1)',
      color: 'var(--ivory-dim)',
    },
    space: {
      background: 'rgba(99,102,241,0.1)',
      border: '1.5px solid rgba(129,140,248,0.4)',
      color: '#818cf8',
    },
  }

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '10px', borderRadius: '50px',
        fontFamily: "'Cinzel', Georgia, serif", fontWeight: 600, fontSize: '12px',
        cursor: 'pointer', transition: 'all 0.15s',
        backdropFilter: 'blur(8px)', letterSpacing: '0.06em',
        ...styles[variant],
      }}
    >
      {children}
    </button>
  )
}

// ── Player badge — kit player card style ──────────────────────────────────────

function PlayerBadge({ label, color, active, timeLeft }: {
  label: string; sublabel?: string; color: 'white' | 'black'; active: boolean; timeLeft?: number
}) {
  const urgent = timeLeft !== undefined && timeLeft <= 10
  const timerStr = timeLeft !== undefined
    ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`
    : null

  const isWhite = color === 'white'
  const accent = isWhite ? '#f0c040' : '#a08fff'
  const accentRgb = isWhite ? '240,192,64' : '160,143,255'
  const pieceGlyph = isWhite ? '♙' : '♟'
  const avatarBg = isWhite
    ? 'linear-gradient(145deg, #f5f0e8 0%, #d4c49a 100%)'
    : 'linear-gradient(145deg, #2d1a5e 0%, #0d0a1a 100%)'

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
      padding: '10px 6px 10px',
      borderRadius: '16px',
      background: active ? `rgba(${accentRgb},0.06)` : 'rgba(13,10,26,0.55)',
      border: `1.5px solid ${active ? `rgba(${accentRgb},0.5)` : 'rgba(201,162,39,0.1)'}`,
      boxShadow: active ? `0 0 24px rgba(${accentRgb},0.2)` : 'none',
      transition: 'all 0.3s',
      backdropFilter: 'blur(10px)',
      position: 'relative',
    }}>
      {/* Crown when active */}
      {active && (
        <div style={{
          position: 'absolute', top: '-10px',
          fontSize: '14px', lineHeight: 1,
          filter: `drop-shadow(0 2px 6px rgba(${accentRgb},0.8))`,
        }}>
          ♛
        </div>
      )}

      {/* Portrait ring — double border like kit laurel frame */}
      <div style={{
        width: '50px', height: '50px', borderRadius: '50%',
        padding: '3px',
        background: active
          ? `conic-gradient(from 0deg, rgba(${accentRgb},0.9), rgba(${accentRgb},0.3), rgba(${accentRgb},0.9))`
          : 'rgba(201,162,39,0.15)',
        transition: 'all 0.3s',
        boxShadow: active ? `0 0 16px rgba(${accentRgb},0.5)` : 'none',
      }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          background: avatarBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', lineHeight: 1,
          border: '1.5px solid rgba(0,0,0,0.3)',
        }}>
          {pieceGlyph}
        </div>
      </div>

      {/* Name banner */}
      <div style={{
        background: active ? `rgba(${accentRgb},0.12)` : 'rgba(13,10,26,0.7)',
        border: `1px solid ${active ? `rgba(${accentRgb},0.3)` : 'rgba(201,162,39,0.1)'}`,
        borderRadius: '20px',
        padding: '3px 10px',
        width: '100%', textAlign: 'center',
      }}>
        <span style={{
          fontFamily: "'Cinzel', Georgia, serif",
          fontSize: '10px', fontWeight: 600,
          color: active ? accent : 'rgba(138,117,96,0.6)',
          letterSpacing: '0.06em', display: 'block',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
      </div>

      {/* Timer / activity */}
      {timerStr !== null ? (
        <span style={{
          fontSize: '16px', fontWeight: 900, fontFamily: 'monospace',
          color: urgent ? '#ef4444' : active ? 'var(--ivory)' : 'rgba(138,117,96,0.5)',
          lineHeight: 1,
          textShadow: urgent ? '0 0 12px rgba(239,68,68,0.6)' : 'none',
        }}
          className={urgent ? 'animate-pulse' : ''}
        >
          {timerStr}
        </span>
      ) : (
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: active ? accent : 'rgba(201,162,39,0.12)',
          boxShadow: active ? `0 0 8px rgba(${accentRgb},0.7)` : 'none',
          transition: 'all 0.3s',
        }}
          className={active ? 'animate-pulse' : ''}
        />
      )}
    </div>
  )
}
