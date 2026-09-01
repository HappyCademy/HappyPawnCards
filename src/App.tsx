import { useState, useEffect, useRef } from 'react'
import { useChessGame, type GameMode, type GameStatus, type BoardPiece } from './hooks/useChessGame'
import type { Color, PieceSymbol } from 'chess.js'
import Board from './components/Board/Board'
import GameInfo from './components/GameInfo/GameInfo'
import CardSelectionScreen from './components/CardSelection/CardSelectionScreen'
import ModeSelectionScreen, { type GameMode as UiGameMode } from './components/ModeSelection/ModeSelectionScreen'
import SignInScreen from './components/Auth/SignInScreen'
import { useAuth } from './hooks/useAuth'
import CampaignScreen, { CAMPAIGN_CHARS } from './components/Campaign/CampaignScreen'
import DialogueScreen from './components/Campaign/DialogueScreen'
import ShopScreen, { generatePackCards } from './components/Shop/ShopScreen'
import CollectionScreen from './components/Collection/CollectionScreen'
import { RARITIES, ALL_CARDS, type CardVariant, pickRandomCards } from './data/cards'
import { CARD_POWERS } from './data/powers'
import { FINALE_PRE_SCENES, FINALE_POST_WIN, FINALE_POST_LOSE } from './data/dialogue'
import { usePieceSet, pieceUrl } from './context/PieceSetContext'

type AppScreen = 'mode' | 'sign-in' | 'campaign' | 'pre-dialogue' | 'finale-dialogue' | 'post-dialogue' | 'shop' | 'collection' | 'p1-selection' | 'p2-selection' | 'game'

interface PickedCards {
  player: CardVariant[]
  ai: CardVariant[]
}

const D = "'Cinzel', Georgia, serif"
const B = "'Nunito', system-ui, sans-serif"

function pickTestHands(perPlayer: number): { player: CardVariant[]; ai: CardVariant[] } {
  // Pool: one entry per (characterId × rarity) where that rarity is implemented
  const pool = ALL_CARDS.filter(c => {
    const power = CARD_POWERS[c.characterId]
    if (!power) return false
    if (c.rarity === 'basic' && power.implemented) return true
    if (c.rarity === 'legendary' && power.implementedLegendary) return true
    if (c.rarity === 'space' && power.implementedSpace) return true
    return false
  })
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  // Pick for each player separately; same character allowed across hands (different rarity = different power)
  const playerCards: CardVariant[] = []
  const aiCards: CardVariant[] = []
  const playerCharIds = new Set<string>()
  const aiCharIds = new Set<string>()
  for (const card of shuffled) {
    if (playerCards.length < perPlayer && !playerCharIds.has(card.characterId)) {
      playerCards.push(card); playerCharIds.add(card.characterId)
    } else if (aiCards.length < perPlayer && !aiCharIds.has(card.characterId)) {
      aiCards.push(card); aiCharIds.add(card.characterId)
    }
    if (playerCards.length >= perPlayer && aiCards.length >= perPlayer) break
  }
  return { player: playerCards, ai: aiCards }
}

export default function App() {
  const auth = useAuth()
  const [screen, setScreen] = useState<AppScreen>('mode')
  const [pendingMode, setPendingMode] = useState<UiGameMode | null>(null)
  const [gameMode, setGameMode] = useState<GameMode>('vsComputer')
  const [pickedCards, setPickedCards] = useState<PickedCards | null>(null)
  const [pendingP1Cards, setPendingP1Cards] = useState<CardVariant[] | null>(null)
  const [zoomedCard, setZoomedCard] = useState<CardVariant | null>(null)
  const [confirmedTurn, setConfirmedTurn] = useState<Color>('w')
  type CampaignChapter = 1 | 2 | 3
  interface CampaignProgress { ch1: number; ch2: number; ch3: number }

  const [campaignProgress, setCampaignProgress] = useState<CampaignProgress>(() => {
    try {
      const saved = localStorage.getItem('campaignProgress')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed === 'number') return { ch1: parsed, ch2: 0, ch3: 0 }
        return parsed as CampaignProgress
      }
    } catch {}
    return { ch1: 0, ch2: 0, ch3: 0 }
  })
  const [campaignOpponent, setCampaignOpponent] = useState<{ chapter: CampaignChapter; idx: number } | null>(null)
  const [pendingCampaignAi, setPendingCampaignAi] = useState<CardVariant[] | null>(null)
  const [campaignLastResult, setCampaignLastResult] = useState<'win' | 'lose' | null>(null)

  const [coins, setCoins] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('coins') ?? '0') || 0 } catch { return 0 }
  })

  const [ownedCardIds, setOwnedCardIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('ownedCards')
      if (saved) return new Set<string>(JSON.parse(saved))
    } catch {}
    // Start with no cards — earn them through campaign
    return new Set<string>()
  })

  const [finaleSceneIdx, setFinaleSceneIdx] = useState(0)
  const [showSpecialPieces, setShowSpecialPieces] = useState(false)
  const [focusedSpecialCard, setFocusedSpecialCard] = useState<CardVariant | null>(null)

  const coinsAwardedRef = useRef(false)

  function getCampaignOpponentCards(charId: string, chapter: CampaignChapter): CardVariant[] {
    if (charId === 'finale') {
      return [
        ALL_CARDS.find(c => c.characterId === 'puzzle-pete' && c.rarity === 'basic')!,
        ALL_CARDS.find(c => c.characterId === 'kings-guard' && c.rarity === 'basic')!,
        ALL_CARDS.find(c => c.characterId === 'black-king' && c.rarity === 'basic')!,
      ]
    }
    const power = CARD_POWERS[charId]
    const basicCard = ALL_CARDS.find(c => c.characterId === charId && c.rarity === 'basic')!
    if (chapter === 1) {
      return [basicCard]
    }
    if (chapter === 2) {
      const legendId = power?.legendaryUpgrade ?? charId
      const legendCard = ALL_CARDS.find(c => c.characterId === legendId && c.rarity === 'legendary') ?? basicCard
      return [legendCard, basicCard]
    }
    const spaceCard = ALL_CARDS.find(c => c.characterId === charId && c.rarity === 'space') ?? basicCard
    return [spaceCard, basicCard]
  }

  const playerCards = pickedCards?.player ?? []
  const aiCards = pickedCards?.ai ?? []

  const {
    board, selectedSquare, validTargets, lastMove,
    isCheck, turn, status, moveHistory, isAIThinking,
    unipopState, unipopBonusSquare, unipopPathCaptures,
    rookChoiceSquare, isRookShootMode, fireTrailSquares, arrowShot,
    blackKingBonusSquare, isChessbeardSelectMode, chessbeardSacrificeSquare, chessbeardAvailable,
    isSpaceHappyPawnPlaceMode, isSpaceChessbeardFreezeMode, spaceChessbeardFrozenSquare, spaceHappyPawnAvailable,
    crystalQueenVulnerable, respawnedSquares, legendaryHappyPawnPromoteSquare,
    timeLeft, timedOut, resignedBy,
    onSquareClick, onRookChoice, onSkipBlackKingBonus, onChessbeardActivate, onSpaceHappyPawnPlace,
    onLegendaryHappyPawnPromote, onNewGame, onUndo, onResign,
  } = useChessGame({ playerCards, aiCards, gameMode })

  const GATED_MODES: UiGameMode[] = ['campaign', 'vsPlayer']

  function handleModeSelect(mode: UiGameMode | 'sign-in') {
    if (mode === 'online') return
    if (mode === 'sign-in') { setScreen('sign-in'); return }
    if (GATED_MODES.includes(mode) && !auth.user) {
      setPendingMode(mode)
      setScreen('sign-in')
      return
    }
    if (mode === 'campaign') {
      setGameMode('vsComputer')
      setScreen('campaign')
      return
    }
    setGameMode(mode)
    setScreen('p1-selection')
  }

  function handleSignInSuccess() {
    const mode = pendingMode
    setPendingMode(null)
    if (mode === 'campaign') {
      setGameMode('vsComputer')
      setScreen('campaign')
    } else if (mode) {
      setGameMode(mode as GameMode)
      setScreen('p1-selection')
    } else {
      setScreen('mode')
    }
  }

  function handleCampaignNodeClick(chapter: CampaignChapter, idx: number) {
    const opponentId = CAMPAIGN_CHARS[idx]
    const opponentCards = getCampaignOpponentCards(opponentId, chapter)
    setCampaignOpponent({ chapter, idx })
    setPendingCampaignAi(opponentCards)
    setCampaignLastResult(null)
    if (idx === 9) {
      setFinaleSceneIdx(0)
      setScreen('finale-dialogue')
    } else {
      setScreen('pre-dialogue')
    }
  }

  function handleTestPowers() {
    const hands = pickTestHands(5)
    setGameMode('vsPlayer')
    setPickedCards(hands)
    setCampaignOpponent(null)
    setPendingCampaignAi(null)
    setConfirmedTurn('w')
    setScreen('game')
  }

  function handleP1Done(picks: CardVariant[]) {
    if (gameMode === 'vsPlayer') {
      setPendingP1Cards(picks)
      setScreen('p2-selection')
    } else if (pendingCampaignAi) {
      setPickedCards({ player: picks, ai: pendingCampaignAi })
      setScreen('game')
    } else {
      const ai = pickRandomCards(2)
      setPickedCards({ player: picks, ai })
      setScreen('game')
    }
  }

  function handleP2Done(picks: CardVariant[]) {
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
    const opponent = campaignOpponent
    const result = campaignLastResult
    onNewGame()
    setPickedCards(null)
    setPendingP1Cards(null)
    setConfirmedTurn('w')
    if (opponent !== null && result !== null) {
      if (opponent.idx === 9) {
        setFinaleSceneIdx(0)
        setScreen('finale-dialogue')
      } else {
        setScreen('post-dialogue')
      }
    } else {
      setCampaignOpponent(null)
      setPendingCampaignAi(null)
      setCampaignLastResult(null)
      setScreen(opponent !== null ? 'campaign' : 'mode')
    }
  }

  function handlePostDialogueContinue() {
    setCampaignOpponent(null)
    setPendingCampaignAi(null)
    setCampaignLastResult(null)
    setScreen('campaign')
  }

  function handleBuyPack(): CardVariant[] {
    const PACK_COST = 100
    if (coins < PACK_COST) return []
    const cards = generatePackCards()
    setCoins(prev => {
      const next = prev - PACK_COST
      localStorage.setItem('coins', next.toString())
      return next
    })
    setOwnedCardIds(prev => {
      const next = new Set(prev)
      for (const card of cards) next.add(card.id)
      localStorage.setItem('ownedCards', JSON.stringify([...next]))
      return next
    })
    return cards
  }

  useEffect(() => {
    if (status === 'playing') { coinsAwardedRef.current = false; return }
    if (screen !== 'game') return
    if (coinsAwardedRef.current) return
    coinsAwardedRef.current = true

    const isCampaignWin = campaignOpponent !== null && status === 'white-wins'
    const coinsEarned = status === 'white-wins' ? (isCampaignWin ? 80 : 50) : status === 'draw' ? 20 : 15
    setCoins(prev => {
      const next = prev + coinsEarned
      localStorage.setItem('coins', next.toString())
      return next
    })

    if (campaignOpponent !== null) {
      setCampaignLastResult(status === 'white-wins' ? 'win' : 'lose')
      if (status === 'white-wins') {
        const { chapter, idx } = campaignOpponent
        const key = `ch${chapter}` as keyof CampaignProgress
        setCampaignProgress(prev => {
          const next = { ...prev, [key]: Math.max(prev[key], idx + 1) }
          localStorage.setItem('campaignProgress', JSON.stringify(next))
          return next
        })
        // Unlock basic (ch1), legendary (ch2), or space (ch3) card for the defeated character
        const charId = CAMPAIGN_CHARS[idx]
        if (charId !== 'finale') {
          const unlockId = chapter === 1 ? `${charId}_1basic` : chapter === 2 ? `${charId}_6legend` : `${charId}_8space`
          setOwnedCardIds(prev => {
            if (prev.has(unlockId)) return prev
            const next = new Set(prev)
            next.add(unlockId)
            localStorage.setItem('ownedCards', JSON.stringify([...next]))
            return next
          })
        }
      }
    }
  }, [status])

  if (auth.loading) return null

  if (screen === 'sign-in') {
    return (
      <SignInScreen
        auth={auth}
        onBack={() => { setPendingMode(null); setScreen('mode') }}
        onSuccess={handleSignInSuccess}
      />
    )
  }

  if (screen === 'collection') {
    return (
      <CollectionScreen
        ownedCardIds={ownedCardIds}
        onBack={() => setScreen('mode')}
      />
    )
  }

  if (screen === 'mode') {
    return (
      <ModeSelectionScreen
        onSelect={handleModeSelect}
        isSignedIn={!!auth.user}
        userEmail={auth.user?.email}
        onSignOut={() => auth.signOut()}
        onCollection={() => setScreen('collection')}
        onTestPowers={handleTestPowers}
        coins={coins}
        onShop={() => setScreen('shop')}
      />
    )
  }

  if (screen === 'campaign') {
    return (
      <CampaignScreen
        progress={campaignProgress}
        coins={coins}
        onSelectOpponent={handleCampaignNodeClick}
        onBack={() => { setCampaignOpponent(null); setPendingCampaignAi(null); setScreen('mode') }}
        onShop={() => setScreen('shop')}
      />
    )
  }

  if (screen === 'shop') {
    const shopOrigin: AppScreen = campaignOpponent !== null ? 'campaign' : 'mode'
    return (
      <ShopScreen
        coins={coins}
        ownedCardIds={ownedCardIds}
        onBuyPack={handleBuyPack}
        onBack={() => setScreen(shopOrigin)}
      />
    )
  }

  if (screen === 'pre-dialogue' && campaignOpponent !== null) {
    const charId = CAMPAIGN_CHARS[campaignOpponent.idx]
    return (
      <DialogueScreen
        charId={charId}
        chapter={campaignOpponent.chapter}
        phase="pre"
        onContinue={() => {
          if (ownedCardIds.size === 0) {
            // No cards yet — skip card selection and go straight to battle
            setPickedCards({ player: [], ai: pendingCampaignAi! })
            setScreen('game')
          } else {
            setScreen('p1-selection')
          }
        }}
        continueLabel="⚔ Fight!"
        onBack={() => { setCampaignOpponent(null); setPendingCampaignAi(null); setCampaignLastResult(null); setScreen('campaign') }}
      />
    )
  }

  if (screen === 'finale-dialogue' && campaignOpponent !== null) {
    const isPost = campaignLastResult !== null
    const scenes = isPost
      ? (campaignLastResult === 'win' ? FINALE_POST_WIN : FINALE_POST_LOSE)
      : FINALE_PRE_SCENES
    const scene = scenes[finaleSceneIdx] ?? scenes[scenes.length - 1]
    const isLastScene = finaleSceneIdx >= scenes.length - 1

    return (
      <DialogueScreen
        charId={scene.charId}
        chapter={campaignOpponent.chapter}
        phase={isPost ? (campaignLastResult === 'win' ? 'postWin' : 'postLose') : 'pre'}
        linesOverride={scene.lines}
        headerLabel="Chapter 1 — Final Battle"
        onContinue={() => {
          if (isLastScene) {
            if (isPost) {
              handlePostDialogueContinue()
            } else {
              if (ownedCardIds.size === 0) {
                setPickedCards({ player: [], ai: pendingCampaignAi! })
                setScreen('game')
              } else {
                setScreen('p1-selection')
              }
            }
          } else {
            setFinaleSceneIdx(i => i + 1)
          }
        }}
        continueLabel={isLastScene && !isPost ? '⚔ Fight!' : undefined}
        onBack={!isPost ? () => { setCampaignOpponent(null); setPendingCampaignAi(null); setCampaignLastResult(null); setScreen('campaign') } : undefined}
      />
    )
  }

  if (screen === 'post-dialogue' && campaignOpponent !== null && campaignLastResult !== null) {
    const charId = CAMPAIGN_CHARS[campaignOpponent.idx]
    return (
      <DialogueScreen
        charId={charId}
        chapter={campaignOpponent.chapter}
        phase={campaignLastResult === 'win' ? 'postWin' : 'postLose'}
        onContinue={handlePostDialogueContinue}
        continueLabel="Back to Map →"
      />
    )
  }

  if (screen === 'p1-selection') {
    const isCampaign = campaignOpponent !== null
    const opponentName = isCampaign ? CAMPAIGN_CHARS[campaignOpponent!.idx] : null
    const CHAR_NAMES: Record<string, string> = {
      'happy-pawn': 'Happy Pawn', 'chessbeard': 'Chessbeard', 'black-king': 'Black King',
      'general-gambit': 'General Gambit', 'kings-guard': "King's Guard", 'puzzle-pete': 'Puzzle Pete',
      'crystal-queen': 'Crystal Queen', 'unipop': 'Unipop', 'robin-rook': 'Robin Rook',
    }
    return (
      <CardSelectionScreen
        onDone={handleP1Done}
        onBack={() => {
          if (!isCampaign) { setScreen('mode'); return }
          if (campaignOpponent!.idx === 9) {
            setCampaignOpponent(null); setPendingCampaignAi(null); setCampaignLastResult(null)
            setScreen('campaign')
          } else {
            setScreen('pre-dialogue')
          }
        }}
        playerLabel={
          isCampaign
            ? campaignOpponent!.idx === 9
              ? 'Final Battle — Pick 1 card'
              : campaignOpponent!.chapter === 1
                ? `vs ${CHAR_NAMES[opponentName!]} — Pick 1 card`
                : `vs ${CHAR_NAMES[opponentName!]} — Pick 2 cards`
            : gameMode === 'vsPlayer'
              ? 'Player 1 (White) — Pick 2 cards'
              : 'Pick 2 cards to bring into battle'
        }
        buttonLabel={gameMode === 'vsPlayer' ? 'Continue →' : '⚔ Start Game'}
        ownedCardIds={ownedCardIds}
        maxPicksOverride={isCampaign && campaignOpponent!.chapter === 1 ? 1 : undefined}
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
        ownedCardIds={ownedCardIds}
      />
    )
  }

  const state = {
    board, selectedSquare, validTargets, lastMove, isCheck,
    turn, status, moveHistory, isAIThinking, unipopState, unipopBonusSquare, unipopPathCaptures,
    rookChoiceSquare, isRookShootMode, fireTrailSquares, arrowShot,
    blackKingBonusSquare, isChessbeardSelectMode, chessbeardSacrificeSquare, chessbeardAvailable,
    isSpaceHappyPawnPlaceMode, isSpaceChessbeardFreezeMode, spaceChessbeardFrozenSquare, spaceHappyPawnAvailable,
    crystalQueenVulnerable, respawnedSquares, legendaryHappyPawnPromoteSquare,
    timeLeft, timedOut, resignedBy, gameMode,
  }
  const actions = { onSquareClick, onRookChoice, onSkipBlackKingBonus, onChessbeardActivate, onSpaceHappyPawnPlace, onLegendaryHappyPawnPromote, onNewGame: handleMainMenu, onUndo, onResign }

  const isVsPlayer = gameMode === 'vsPlayer'
  const topLabel = isVsPlayer ? 'Player 2 (Black)' : 'AI (Black)'
  const bottomLabel = isVsPlayer ? 'Player 1 (White)' : 'You (White)'

  const { byWhite, byBlack } = computeCaptured(board)
  const whitePoints = byWhite.reduce((s, t) => s + CAPTURE_VALUES[t], 0)
  const blackPoints = byBlack.reduce((s, t) => s + CAPTURE_VALUES[t], 0)
  const whiteAdvantage = Math.max(0, whitePoints - blackPoints)
  const blackAdvantage = Math.max(0, blackPoints - whitePoints)

  return (
    <div
      className="game-bg min-h-screen flex flex-col items-center py-4 px-4"
    >
      {/* Header */}
      <header className="mb-3 text-center flex flex-col items-center">
        <img
          src="/images/logo.svg"
          alt="Happy Pawn Cards"
          style={{
            height: 'clamp(56px, 10vw, 80px)',
            filter: 'drop-shadow(0 0 16px rgba(201,162,39,0.4))',
            marginBottom: '2px',
          }}
        />
        <p style={{ fontFamily: B, color: 'var(--ivory-dim)', fontSize: '11px', letterSpacing: '0.08em' }}>
          {isVsPlayer ? 'VS Player' : campaignOpponent !== null ? 'Campaign' : 'VS Computer'}
        </p>
      </header>

      <div className="flex flex-col items-center gap-3 w-full max-w-5xl">
        {/* Top: black/AI cards + black's captures */}
        {pickedCards && pickedCards.ai.length > 0 && (
          <CardStrip
            label={topLabel}
            cards={pickedCards.ai}
            accent="#a08fff"
            onCardClick={setZoomedCard}
          />
        )}
        <CapturedPieces pieces={byBlack} capturedColor="w" advantage={blackAdvantage} />

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
              spaceChessbeardFrozenSquare={spaceChessbeardFrozenSquare}
              isSpaceChessbeardFreezeMode={isSpaceChessbeardFreezeMode}
              isSpaceHappyPawnPlaceMode={isSpaceHappyPawnPlaceMode}
              legendaryHappyPawnPromoteSquare={legendaryHappyPawnPromoteSquare}
              onLegendaryHappyPawnPromote={onLegendaryHappyPawnPromote}
              showSpecialPieces={showSpecialPieces}
              onSpecialPieceClick={setFocusedSpecialCard}
            />
          </div>
          <div className="w-full lg:w-64 flex-shrink-0">
            <GameInfo
              state={state}
              actions={actions}
              focusedSpecialCard={focusedSpecialCard}
              showSpecialPieces={showSpecialPieces}
              onToggleSpecialPieces={() => setShowSpecialPieces(v => !v)}
            />
          </div>
        </div>

        {/* Bottom: white's captures + white/player cards */}
        <CapturedPieces pieces={byWhite} capturedColor="b" advantage={whiteAdvantage} />
        {pickedCards && pickedCards.player.length > 0 && (
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
          isCampaign={campaignOpponent !== null}
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
                maxHeight: '60vh', maxWidth: '80vw',
                borderRadius: '16px',
                boxShadow: '0 0 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(201,162,39,0.2)',
              }}
            />
            {(() => {
              const power = CARD_POWERS[zoomedCard.characterId]
              const upgradeId = power?.legendaryUpgrade
              const up = upgradeId ? CARD_POWERS[upgradeId] : null
              const isSpace = zoomedCard.rarity === 'space'
              const isLegendary = zoomedCard.rarity === 'legendary'
              const label = isSpace && power?.spacePowerLabel ? power.spacePowerLabel
                : isLegendary && up ? up.powerLabel
                : isLegendary && power?.legendaryPowerLabel ? power.legendaryPowerLabel
                : power?.powerLabel
              const description = isSpace && power?.spacePowerDescription ? power.spacePowerDescription
                : isLegendary && up ? up.powerDescription
                : isLegendary && power?.legendaryPowerDescription ? power.legendaryPowerDescription
                : power?.powerDescription
              const rarityMeta = RARITIES.find(r => r.key === zoomedCard.rarity)
              return (
                <div style={{ textAlign: 'center', maxWidth: '320px', padding: '0 8px' }}>
                  <p style={{ fontFamily: D, color: 'var(--ivory)', fontWeight: 600, letterSpacing: '0.04em', fontSize: '16px' }}>
                    {zoomedCard.name}
                  </p>
                  <p style={{ fontFamily: B, fontSize: '12px', color: rarityMeta?.color, marginBottom: '10px' }}>
                    {rarityMeta?.label}
                  </p>
                  {label && (
                    <p style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: '13px', fontWeight: 600, color: 'var(--gold)', marginBottom: '6px', letterSpacing: '0.04em' }}>
                      {label}
                    </p>
                  )}
                  {description && (
                    <p style={{ fontFamily: B, fontSize: '13px', color: 'var(--ivory-dim)', lineHeight: 1.55, maxWidth: '300px' }}>
                      {description}
                    </p>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Captured pieces ───────────────────────────────────────────────────────────

type CaptureSymbol = Exclude<PieceSymbol, 'k'>
const CAPTURE_ORDER: CaptureSymbol[] = ['q', 'r', 'b', 'n', 'p']
const CAPTURE_VALUES: Record<CaptureSymbol, number> = { q: 9, r: 5, b: 3, n: 3, p: 1 }
const INITIAL_COUNTS: Record<CaptureSymbol, number> = { q: 1, r: 2, b: 2, n: 2, p: 8 }

function computeCaptured(board: (BoardPiece | null)[][]) {
  const counts = {
    w: { q: 0, r: 0, b: 0, n: 0, p: 0 } as Record<CaptureSymbol, number>,
    b: { q: 0, r: 0, b: 0, n: 0, p: 0 } as Record<CaptureSymbol, number>,
  }
  for (const row of board) {
    for (const piece of row) {
      if (!piece || piece.type === 'k') continue
      counts[piece.color][piece.type as CaptureSymbol]++
    }
  }
  const byWhite: CaptureSymbol[] = []
  const byBlack: CaptureSymbol[] = []
  for (const t of CAPTURE_ORDER) {
    for (let i = 0; i < Math.max(0, INITIAL_COUNTS[t] - counts.b[t]); i++) byWhite.push(t)
    for (let i = 0; i < Math.max(0, INITIAL_COUNTS[t] - counts.w[t]); i++) byBlack.push(t)
  }
  return { byWhite, byBlack }
}

function CapturedPieces({ pieces, capturedColor, advantage, onPieceClick }: {
  pieces: CaptureSymbol[]
  capturedColor: Color
  advantage: number
  onPieceClick?: (type: CaptureSymbol, index: number) => void
}) {
  const { pieceSet } = usePieceSet()
  if (pieces.length === 0 && advantage <= 0) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1px', minHeight: '22px', paddingLeft: '4px' }}>
      {pieces.map((type, i) => (
        <button
          key={i}
          onClick={() => onPieceClick?.(type, i)}
          style={{
            width: '22px', height: '22px', padding: 0, border: 'none', background: 'none',
            cursor: onPieceClick ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <img
            src={pieceUrl(pieceSet, capturedColor, type)}
            alt={type}
            draggable={false}
            style={{ width: '20px', height: '20px', opacity: 0.8 }}
          />
        </button>
      ))}
      {advantage > 0 && (
        <span style={{ fontFamily: B, fontSize: '11px', fontWeight: 700, color: 'var(--ivory-dim)', marginLeft: '4px' }}>
          +{advantage}
        </span>
      )}
    </div>
  )
}

function CardStrip({ label, cards, accent, onCardClick }: {
  label: string
  cards: CardVariant[]
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

function GameOverOverlay({ status, timedOut, resignedBy, gameMode, isCampaign, onPlayAgain, onChangeCards, onMainMenu }: {
  status: GameStatus
  timedOut: Color | null
  resignedBy: Color | null
  gameMode: GameMode
  isCampaign: boolean
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
            {isCampaign ? 'Back to Map' : 'Main Menu'}
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
