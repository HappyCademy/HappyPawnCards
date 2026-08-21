import { useState } from 'react'
import { useChessGame, type GameMode, type GameStatus } from './hooks/useChessGame'
import type { Color } from 'chess.js'
import Board from './components/Board/Board'
import GameInfo from './components/GameInfo/GameInfo'
import CardSelectionScreen from './components/CardSelection/CardSelectionScreen'
import ModeSelectionScreen, { type GameMode as UiGameMode } from './components/ModeSelection/ModeSelectionScreen'
import { RARITIES, type CardVariant, pickRandomCards } from './data/cards'
import { CARD_POWERS } from './data/powers'

type AppScreen = 'mode' | 'p1-selection' | 'p2-selection' | 'game'

interface PickedCards {
  player: [CardVariant, CardVariant]
  ai: [CardVariant, CardVariant]
}

const D = "'Cinzel', Georgia, serif"
const B = "'Nunito', system-ui, sans-serif"

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('mode')
  const [gameMode, setGameMode] = useState<GameMode>('vsComputer')
  const [pickedCards, setPickedCards] = useState<PickedCards | null>(null)
  const [pendingP1Cards, setPendingP1Cards] = useState<[CardVariant, CardVariant] | null>(null)
  const [zoomedCard, setZoomedCard] = useState<CardVariant | null>(null)
  const [confirmedTurn, setConfirmedTurn] = useState<Color>('w')

  const playerCards = pickedCards?.player ?? []
  const aiCards = pickedCards?.ai ?? []

  const {
    board, selectedSquare, validTargets, lastMove,
    isCheck, turn, status, moveHistory, isAIThinking,
    unipopState, unipopBonusSquare, unipopPathCaptures,
    rookChoiceSquare, isRookShootMode, fireTrailSquares, arrowShot,
    blackKingBonusSquare, isChessbeardSelectMode, chessbeardSacrificeSquare, chessbeardAvailable,
    crystalQueenVulnerable, respawnedSquares,
    timeLeft, timedOut, resignedBy,
    onSquareClick, onRookChoice, onSkipBlackKingBonus, onChessbeardActivate, onNewGame, onUndo, onResign,
  } = useChessGame({ playerCards, aiCards, gameMode })

  function handleModeSelect(mode: UiGameMode) {
    if (mode === 'online') return
    setGameMode(mode)
    setScreen('p1-selection')
  }

  function handleP1Done(picks: [CardVariant, CardVariant]) {
    if (gameMode === 'vsPlayer') {
      setPendingP1Cards(picks)
      setScreen('p2-selection')
    } else {
      const ai = pickRandomCards(2) as [CardVariant, CardVariant]
      setPickedCards({ player: picks, ai })
      setScreen('game')
    }
  }

  function handleP2Done(picks: [CardVariant, CardVariant]) {
    setPickedCards({ player: pendingP1Cards!, ai: picks })
    setPendingP1Cards(null)
    setScreen('game')
  }

  function handlePlayAgain() {
    onNewGame()
    setConfirmedTurn('w')
  }

  function handleChangeCards() {
    onNewGame()
    setPickedCards(null)
    setPendingP1Cards(null)
    setConfirmedTurn('w')
    setScreen('p1-selection')
  }

  function handleMainMenu() {
    onNewGame()
    setPickedCards(null)
    setPendingP1Cards(null)
    setConfirmedTurn('w')
    setScreen('mode')
  }

  if (screen === 'mode') {
    return <ModeSelectionScreen onSelect={handleModeSelect} />
  }

  if (screen === 'p1-selection') {
    return (
      <CardSelectionScreen
        onDone={handleP1Done}
        onBack={() => setScreen('mode')}
        playerLabel={gameMode === 'vsPlayer' ? 'Player 1 (White) — Pick 2 cards' : 'Pick 2 cards to bring into battle'}
        buttonLabel={gameMode === 'vsPlayer' ? 'Continue →' : '⚔ Start Game'}
      />
    )
  }

  if (screen === 'p2-selection') {
    return (
      <CardSelectionScreen
        onDone={handleP2Done}
        onBack={() => { setPendingP1Cards(null); setScreen('p1-selection') }}
        playerLabel="Player 2 (Black) — Pick 2 cards"
        buttonLabel="⚔ Start Game"
      />
    )
  }

  const state = {
    board, selectedSquare, validTargets, lastMove, isCheck,
    turn, status, moveHistory, isAIThinking, unipopState, unipopBonusSquare, unipopPathCaptures,
    rookChoiceSquare, isRookShootMode, fireTrailSquares, arrowShot,
    blackKingBonusSquare, isChessbeardSelectMode, chessbeardSacrificeSquare, chessbeardAvailable,
    crystalQueenVulnerable, respawnedSquares,
    timeLeft, timedOut, resignedBy, gameMode,
  }
  const actions = { onSquareClick, onRookChoice, onSkipBlackKingBonus, onChessbeardActivate, onNewGame: handleMainMenu, onUndo, onResign }

  const isVsPlayer = gameMode === 'vsPlayer'
  const topLabel = isVsPlayer ? 'Player 2 (Black)' : 'AI (Black)'
  const bottomLabel = isVsPlayer ? 'Player 1 (White)' : 'You (White)'

  return (
    <div
      className="game-bg min-h-screen flex flex-col items-center py-4 px-4"
    >
      {/* Header */}
      <header className="mb-3 text-center flex flex-col items-center">
        <img
          src="/images/logo.png"
          alt="Happy Pawn Cards"
          style={{
            height: 'clamp(56px, 10vw, 80px)',
            filter: 'drop-shadow(0 0 16px rgba(201,162,39,0.4))',
            marginBottom: '2px',
          }}
        />
        <p style={{ fontFamily: B, color: 'var(--ivory-dim)', fontSize: '11px', letterSpacing: '0.08em' }}>
          {isVsPlayer ? 'VS Player' : 'VS Computer'}
        </p>
      </header>

      <div className="flex flex-col items-center gap-3 w-full max-w-5xl">
        {/* Top: black/AI cards */}
        {pickedCards && (
          <CardStrip
            label={topLabel}
            cards={pickedCards.ai}
            accent="#a08fff"
            onCardClick={setZoomedCard}
          />
        )}

        {/* Middle: board + sidebar */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-4 w-full">
          <div className="flex items-center justify-center w-full lg:w-auto">
            <Board
              board={board}
              selectedSquare={selectedSquare}
              validTargets={validTargets}
              lastMove={lastMove}
              isCheck={isCheck}
              turn={turn}
              status={status}
              unipopState={unipopState}
              unipopPathCaptures={unipopPathCaptures}
              rookChoiceSquare={rookChoiceSquare}
              isRookShootMode={isRookShootMode}
              fireTrailSquares={fireTrailSquares}
              arrowShot={arrowShot}
              isChessbeardSelectMode={isChessbeardSelectMode}
              chessbeardSacrificeSquare={chessbeardSacrificeSquare}
              onSquareClick={onSquareClick}
              onRookChoice={onRookChoice}
              playerCards={playerCards}
              aiCards={aiCards}
              crystalQueenVulnerable={crystalQueenVulnerable}
              respawnedSquares={respawnedSquares}
            />
          </div>
          <div className="w-full lg:w-64 flex-shrink-0">
            <GameInfo state={state} actions={actions} />
          </div>
        </div>

        {/* Bottom: white/player cards */}
        {pickedCards && (
          <CardStrip
            label={bottomLabel}
            cards={pickedCards.player}
            accent="var(--gold-bright)"
            onCardClick={setZoomedCard}
          />
        )}
      </div>

      {/* Pass-the-device handoff screen (vsPlayer only) */}
      {gameMode === 'vsPlayer' && status === 'playing' && turn !== confirmedTurn && (
        <HandoffScreen
          player={turn === 'w' ? 'Player 1' : 'Player 2'}
          color={turn === 'w' ? 'white' : 'black'}
          onReady={() => setConfirmedTurn(turn)}
        />
      )}

      {/* Game-over overlay */}
      {status !== 'playing' && (
        <GameOverOverlay
          status={status}
          timedOut={timedOut}
          resignedBy={resignedBy}
          gameMode={gameMode}
          onPlayAgain={handlePlayAgain}
          onChangeCards={handleChangeCards}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Card zoom modal */}
      {zoomedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}
          onClick={() => setZoomedCard(null)}
        >
          <div
            className="relative flex flex-col items-center gap-3"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomedCard(null)}
              style={{
                position: 'absolute', top: '-12px', right: '-12px',
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(13,10,26,0.9)', border: '1px solid rgba(201,162,39,0.3)',
                color: 'var(--ivory-dim)', fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 10, fontFamily: B,
              }}
            >
              ✕
            </button>
            <img
              src={zoomedCard.image}
              alt={zoomedCard.name}
              style={{
                maxHeight: '80vh', maxWidth: '88vw',
                borderRadius: '16px',
                boxShadow: '0 0 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(201,162,39,0.2)',
              }}
            />
            <div className="text-center">
              <p style={{ fontFamily: D, color: 'var(--ivory)', fontWeight: 600, letterSpacing: '0.04em' }}>
                {zoomedCard.name}
              </p>
              <p style={{ fontFamily: B, fontSize: '12px', color: RARITIES.find(r => r.key === zoomedCard.rarity)?.color }}>
                {RARITIES.find(r => r.key === zoomedCard.rarity)?.label}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CardStrip({ label, cards, accent, onCardClick }: {
  label: string
  cards: [CardVariant, CardVariant]
  accent: string
  onCardClick: (card: CardVariant) => void
}) {
  return (
    <div style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: '16px', padding: '0 4px',
    }}>
      <p style={{
        fontFamily: D, fontSize: '10px', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.12em',
        color: accent, flexShrink: 0, minWidth: '80px',
        display: 'none',
      }}
        className="sm:block"
      >
        {label}
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {cards.map((card, i) => {
          const rarityMeta = RARITIES.find(r => r.key === card.rarity)!
          const power = CARD_POWERS[card.characterId]
          const borderColor = i === 0 ? accent : (i === 1 ? '#a08fff' : accent)
          return (
            <div key={card.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => onCardClick(card)}
                style={{ flexShrink: 0, position: 'relative', width: '52px' }}
                className="group"
              >
                <img
                  src={card.image}
                  alt={card.name}
                  style={{
                    width: '52px', borderRadius: '6px',
                    boxShadow: `0 0 0 2px ${borderColor}, 0 0 10px ${rarityMeta.glow}`,
                    transition: 'transform 0.15s',
                  }}
                  className="group-hover:scale-110"
                />
              </button>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontFamily: D, fontSize: '11px', fontWeight: 600,
                  color: 'var(--ivory)', maxWidth: '80px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {card.name}
                </p>
                <p style={{ fontFamily: B, fontSize: '11px', color: rarityMeta.color }}>{rarityMeta.label}</p>
                {(power?.implemented
                  || (card.rarity === 'space' && power?.implementedSpace)
                  || (card.rarity === 'legendary' && power?.implementedLegendary)
                ) && (
                  <p style={{ fontFamily: B, fontSize: '11px', color: 'var(--gold)', lineHeight: 1.3 }}>
                    {card.rarity === 'space' && power?.spacePowerLabel
                      ? power.spacePowerLabel
                      : power?.powerLabel}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GameOverOverlay({ status, timedOut, resignedBy, gameMode, onPlayAgain, onChangeCards, onMainMenu }: {
  status: GameStatus
  timedOut: Color | null
  resignedBy: Color | null
  gameMode: GameMode
  onPlayAgain: () => void
  onChangeCards: () => void
  onMainMenu: () => void
}) {
  const isVsPlayer = gameMode === 'vsPlayer'
  const isDraw = status === 'draw'
  const whiteWins = status === 'white-wins'
  const playerWins = isVsPlayer ? null : whiteWins

  // Determine outcome type: 'victory' | 'defeat' | 'draw'
  const outcomeType: 'victory' | 'defeat' | 'draw' = isDraw ? 'draw'
    : isVsPlayer
      ? (whiteWins ? 'victory' : 'defeat')
      : (playerWins ? 'victory' : 'defeat')

  let headline: string
  let subtitle: string
  if (isDraw) {
    headline = 'Draw'; subtitle = 'The game is drawn'
  } else if (resignedBy !== null) {
    if (isVsPlayer) {
      headline = resignedBy === 'w' ? 'Victory!' : 'Defeat'
      subtitle = `Player ${resignedBy === 'w' ? '1' : '2'} resigned`
    } else {
      headline = resignedBy === 'w' ? 'Defeat' : 'Victory!'
      subtitle = resignedBy === 'w' ? 'You resigned' : 'AI resigned'
    }
  } else if (isVsPlayer) {
    headline = whiteWins ? 'Victory!' : 'Defeat'
    subtitle = timedOut
      ? `Player ${timedOut === 'w' ? '1' : '2'} ran out of time`
      : 'King captured!'
  } else {
    headline = playerWins ? 'Victory!' : 'Defeat'
    subtitle = timedOut === 'w' ? 'You ran out of time'
      : timedOut === 'b' ? 'AI ran out of time'
      : playerWins ? "Opponent's king captured!" : 'Your king was captured!'
  }

  const robiSrc = !isVsPlayer && !isDraw
    ? (playerWins ? '/images/robi/robi-lost.png' : '/images/robi/robi-win.png')
    : null

  // Visual theme per outcome
  const isVictory = outcomeType === 'victory'
  const isDefeat = outcomeType === 'defeat'

  const panelBg = isVictory
    ? 'linear-gradient(160deg, #2a1800 0%, #1a0d00 100%)'
    : isDefeat
      ? 'linear-gradient(160deg, #1a0a0a 0%, #0d0505 100%)'
      : 'rgba(13,10,26,0.94)'

  const borderColor = isVictory ? 'rgba(201,162,39,0.6)'
    : isDefeat ? 'rgba(120,20,20,0.6)'
    : 'rgba(138,117,96,0.3)'

  const outerGlow = isVictory ? 'rgba(201,162,39,0.35)'
    : isDefeat ? 'rgba(200,30,30,0.25)'
    : 'rgba(138,117,96,0.15)'

  const titleColor = isVictory ? '#f0c040'
    : isDefeat ? '#c0c0c0'
    : '#8a7560'

  const titleShadow = isVictory
    ? '0 0 40px rgba(201,162,39,0.8), 0 0 80px rgba(201,162,39,0.4)'
    : isDefeat
      ? '0 0 30px rgba(80,10,10,0.9)'
      : 'none'

  const decoration = isVictory ? '♛ ✦ ♛' : isDefeat ? '✦  ✦  ✦' : '· · ·'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)' }}
    >
      {/* Outer glow ring */}
      <div style={{
        position: 'absolute',
        width: '360px', height: '460px',
        borderRadius: '32px',
        background: 'transparent',
        boxShadow: `0 0 80px ${outerGlow}, 0 0 160px ${outerGlow}`,
        pointerEvents: 'none',
      }} />

      <div style={{
        background: panelBg,
        border: `2px solid ${borderColor}`,
        boxShadow: `0 0 0 1px ${borderColor}40, 0 32px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)`,
        borderRadius: '28px',
        padding: '36px 28px 32px',
        maxWidth: '340px',
        width: '90%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Corner ornaments */}
        <span style={{ position: 'absolute', top: '12px', left: '16px', fontSize: '14px', opacity: 0.4, color: titleColor }}>✦</span>
        <span style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '14px', opacity: 0.4, color: titleColor }}>✦</span>

        {/* Robi or emoji */}
        {robiSrc
          ? <img src={robiSrc} alt="Robi" style={{ width: '120px', height: '120px', objectFit: 'contain', filter: `drop-shadow(0 0 20px ${outerGlow})` }} />
          : <span style={{ fontSize: '64px', lineHeight: 1, filter: `drop-shadow(0 4px 16px rgba(0,0,0,0.6))` }}>
              {isDraw ? '🤝' : '🎉'}
            </span>
        }

        {/* Headline */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h2 style={{
            fontFamily: D,
            fontSize: isVictory ? '42px' : '36px',
            fontWeight: 900,
            color: titleColor,
            margin: '0 0 4px',
            letterSpacing: isVictory ? '0.12em' : '0.08em',
            textTransform: 'uppercase',
            textShadow: titleShadow,
            lineHeight: 1,
          }}>
            {headline}
          </h2>
          {/* Decoration line */}
          <p style={{
            fontFamily: D, fontSize: '12px',
            color: `${titleColor}66`, letterSpacing: '0.2em',
            margin: '6px 0 0',
          }}>
            {decoration}
          </p>
        </div>

        {/* Subtitle */}
        <p style={{
          fontFamily: B, fontSize: '13px',
          color: isVictory ? 'rgba(240,192,64,0.7)' : isDefeat ? 'rgba(200,180,180,0.6)' : 'var(--ivory-dim)',
          margin: 0, textAlign: 'center', letterSpacing: '0.02em',
        }}>
          {subtitle}
        </p>

        {/* Divider */}
        <div style={{
          width: '60%', height: '1px',
          background: `linear-gradient(to right, transparent, ${borderColor}, transparent)`,
        }} />

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <button
            onClick={onPlayAgain}
            style={{
              padding: '14px', borderRadius: '50px', cursor: 'pointer',
              fontFamily: D, fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em',
              background: isVictory
                ? 'linear-gradient(135deg, #c9a227 0%, #f0c040 50%, #c9a227 100%)'
                : 'linear-gradient(160deg, #3a1060 0%, #1a0d36 100%)',
              border: `2px solid ${isVictory ? '#f0c040' : 'rgba(201,162,39,0.4)'}`,
              color: isVictory ? '#0d0a1a' : 'var(--gold-bright)',
              boxShadow: isVictory
                ? '0 4px 24px rgba(201,162,39,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'
                : '0 4px 16px rgba(201,162,39,0.2)',
              textTransform: 'uppercase',
            }}
          >
            {isVictory ? '♛ Play Again' : '↺ Try Again'}
          </button>
          <button
            onClick={onChangeCards}
            style={{
              padding: '11px', borderRadius: '50px', cursor: 'pointer',
              fontFamily: D, fontWeight: 600, fontSize: '12px', letterSpacing: '0.06em',
              background: 'rgba(13,10,26,0.6)',
              border: `1.5px solid ${borderColor}66`,
              color: 'var(--ivory-dim)', textTransform: 'uppercase',
            }}
          >
            Change Cards
          </button>
          <button
            onClick={onMainMenu}
            style={{
              padding: '9px', borderRadius: '50px', cursor: 'pointer',
              fontFamily: B, fontWeight: 500, fontSize: '13px',
              background: 'transparent', border: 'none',
              color: 'rgba(138,117,96,0.4)',
            }}
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  )
}

function HandoffScreen({ player, color, onReady }: {
  player: string
  color: 'white' | 'black'
  onReady: () => void
}) {
  const accent = color === 'white' ? 'var(--gold-bright)' : '#a08fff'
  const glow   = color === 'white' ? 'rgba(201,162,39,0.35)' : 'rgba(160,143,255,0.35)'
  const pawn   = color === 'white' ? '♙' : '♟'

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center screen-bg"
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center', padding: '0 32px' }}>
        <span style={{
          fontSize: '72px', lineHeight: 1,
          filter: `drop-shadow(0 0 24px ${glow})`,
          color: accent,
        }}>
          {pawn}
        </span>

        <div>
          <p style={{
            fontFamily: D, color: accent, fontSize: '11px', fontWeight: 600,
            letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '10px',
          }}>
            {player} &bull; {color === 'white' ? 'White' : 'Black'}
          </p>
          <h2 style={{
            fontFamily: D, color: 'var(--ivory)', fontSize: '32px', fontWeight: 700,
            margin: '0 0 8px', letterSpacing: '0.04em',
          }}>
            Your Turn
          </h2>
          <p style={{ fontFamily: B, color: 'var(--ivory-dim)', fontSize: '14px', margin: 0 }}>
            Pass the device, then tap when ready
          </p>
        </div>

        <button
          onClick={onReady}
          style={{
            marginTop: '4px',
            padding: '14px 56px',
            borderRadius: '16px',
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #c9a227 0%, #f0c040 100%)',
            color: '#0d0a1a',
            fontFamily: D, fontWeight: 700, fontSize: '15px', letterSpacing: '0.08em',
            boxShadow: `0 8px 32px ${glow}, 0 0 0 1px rgba(201,162,39,0.4)`,
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none' }}
        >
          I'm Ready
        </button>
      </div>
    </div>
  )
}
