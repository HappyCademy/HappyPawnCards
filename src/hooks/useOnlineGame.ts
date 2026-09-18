import { useState, useEffect, useRef, useCallback } from 'react'
import type { Timestamp } from 'firebase/firestore'
import type { CardVariant } from '../data/cards'
import type { OnlineSyncState } from './useChessGame'
import {
  createOnlineGame as firestoreCreate,
  joinOnlineGame as firestoreJoin,
  loadOnlineGame,
  submitMove,
  subscribeToGame,
  writeHeartbeat,
  claimWinByDisconnect,
  saveActiveGame,
  clearActiveGame,
  type OnlineGameDoc,
} from '../lib/onlineGame'

interface Options {
  userId: string | null
  displayName: string | null
  onExternalMove: (state: OnlineSyncState) => void
}

export type DisconnectState = 'maybe' | 'likely' | false

interface UseOnlineGameReturn {
  onlineGameId: string | null
  onlineDoc: OnlineGameDoc | null
  myColor: 'w' | 'b' | null
  joinError: string | null
  opponentDisconnected: DisconnectState
  createGame: (cards: CardVariant[], timeControlSeconds: number | null) => Promise<string>
  joinGame: (gameId: string, cards: CardVariant[]) => Promise<void>
  rejoinGame: (gameId: string, color: 'w' | 'b') => void
  writeMyTurn: (state: OnlineSyncState) => Promise<void>
  claimWin: () => Promise<void>
  leaveGame: () => void
}

export function useOnlineGame({ userId, displayName, onExternalMove }: Options): UseOnlineGameReturn {
  const [onlineGameId, setOnlineGameId] = useState<string | null>(null)
  const [onlineDoc, setOnlineDoc] = useState<OnlineGameDoc | null>(null)
  const [myColor, setMyColor] = useState<'w' | 'b' | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [opponentDisconnected, setOpponentDisconnected] = useState<DisconnectState>(false)

  const myColorRef = useRef<'w' | 'b' | null>(null)
  const onExternalMoveRef = useRef(onExternalMove)
  const lastSyncedFenRef = useRef<string | null>(null)
  const onlineDocRef = useRef<OnlineGameDoc | null>(null)
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const disconnectCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { onExternalMoveRef.current = onExternalMove }, [onExternalMove])
  useEffect(() => { onlineDocRef.current = onlineDoc }, [onlineDoc])

  function checkHeartbeatAge(doc: OnlineGameDoc) {
    if (!myColorRef.current || doc.status !== 'playing') return
    const opponentField = myColorRef.current === 'w' ? 'bHeartbeat' : 'wHeartbeat'
    const hb = doc[opponentField] as Timestamp | null | undefined
    if (!hb) return  // opponent hasn't written first heartbeat yet — don't flag
    const ageMs = Date.now() - hb.toMillis()
    if (ageMs > 90_000) setOpponentDisconnected('likely')
    else if (ageMs > 45_000) setOpponentDisconnected('maybe')
    else setOpponentDisconnected(false)
  }

  // Subscribe to game document and handle opponent moves
  useEffect(() => {
    if (!onlineGameId) return
    lastSyncedFenRef.current = null

    function processUpdate(data: OnlineGameDoc) {
      setOnlineDoc(data)
      checkHeartbeatAge(data)

      if (!data.sync) return
      if (!data.sync.resignedBy && data.sync.moveHistory.length === 0) return
      if (data.sync.fen === lastSyncedFenRef.current && !data.sync.resignedBy && !data.sync.timedOut) return
      if (myColorRef.current === null) return

      onExternalMoveRef.current(data.sync)
    }

    const unsub = subscribeToGame(onlineGameId, processUpdate)

    const handleVisibility = () => {
      if (document.hidden) return
      loadOnlineGame(onlineGameId).then(doc => { if (doc) processUpdate(doc) }).catch(() => {})
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Heartbeat write every 15s
    heartbeatIntervalRef.current = setInterval(() => {
      if (!myColorRef.current || !onlineGameId) return
      const doc = onlineDocRef.current
      if (doc && doc.status !== 'playing') return
      writeHeartbeat(onlineGameId, myColorRef.current).catch(() => {})
    }, 15_000)

    // Local disconnection check every 15s (catches gaps between Firestore updates)
    disconnectCheckIntervalRef.current = setInterval(() => {
      const doc = onlineDocRef.current
      if (doc) checkHeartbeatAge(doc)
    }, 15_000)

    return () => {
      unsub()
      document.removeEventListener('visibilitychange', handleVisibility)
      if (heartbeatIntervalRef.current) { clearInterval(heartbeatIntervalRef.current); heartbeatIntervalRef.current = null }
      if (disconnectCheckIntervalRef.current) { clearInterval(disconnectCheckIntervalRef.current); disconnectCheckIntervalRef.current = null }
    }
  }, [onlineGameId])  // eslint-disable-line react-hooks/exhaustive-deps

  const createGame = useCallback(async (cards: CardVariant[], timeControlSeconds: number | null): Promise<string> => {
    if (!userId) throw new Error('Must be signed in')
    const gameId = await firestoreCreate(userId, displayName, cards, timeControlSeconds)
    setOnlineGameId(gameId)
    setMyColor('w')
    myColorRef.current = 'w'
    setJoinError(null)
    setOpponentDisconnected(false)
    saveActiveGame(gameId, 'w')
    // Write initial heartbeat
    writeHeartbeat(gameId, 'w').catch(() => {})
    return gameId
  }, [userId, displayName])

  const joinGame = useCallback(async (gameId: string, cards: CardVariant[]): Promise<void> => {
    if (!userId) throw new Error('Must be signed in')
    const existing = await loadOnlineGame(gameId)
    if (!existing) { const m = 'Game not found.'; setJoinError(m); throw new Error(m) }

    if (existing.white === userId || existing.black === userId) {
      const color = existing.white === userId ? 'w' : 'b'
      setOnlineGameId(gameId)
      setMyColor(color)
      myColorRef.current = color
      setJoinError(null)
      setOpponentDisconnected(false)
      saveActiveGame(gameId, color)
      window.history.replaceState({}, '', '/')
      return
    }

    if (existing.status !== 'waiting') { const m = 'This game is already full or has ended.'; setJoinError(m); throw new Error(m) }

    await firestoreJoin(gameId, userId, displayName, cards)
    setOnlineGameId(gameId)
    setMyColor('b')
    myColorRef.current = 'b'
    setJoinError(null)
    setOpponentDisconnected(false)
    saveActiveGame(gameId, 'b')
    writeHeartbeat(gameId, 'b').catch(() => {})
    window.history.replaceState({}, '', '/')
  }, [userId, displayName])

  const writeMyTurn = useCallback(async (state: OnlineSyncState): Promise<void> => {
    if (!onlineGameId) return
    lastSyncedFenRef.current = state.fen
    await submitMove(onlineGameId, state)
  }, [onlineGameId])

  const rejoinGame = useCallback((gameId: string, color: 'w' | 'b'): void => {
    setOnlineGameId(gameId)
    setMyColor(color)
    myColorRef.current = color
    setJoinError(null)
    setOpponentDisconnected(false)
  }, [])

  const claimWin = useCallback(async (): Promise<void> => {
    if (!onlineGameId || !myColorRef.current) return
    await claimWinByDisconnect(onlineGameId, myColorRef.current)
  }, [onlineGameId])

  const leaveGame = useCallback(() => {
    setOnlineGameId(null)
    setOnlineDoc(null)
    setMyColor(null)
    myColorRef.current = null
    lastSyncedFenRef.current = null
    setJoinError(null)
    setOpponentDisconnected(false)
    clearActiveGame()
  }, [])

  return { onlineGameId, onlineDoc, myColor, joinError, opponentDisconnected, createGame, joinGame, rejoinGame, writeMyTurn, claimWin, leaveGame }
}
