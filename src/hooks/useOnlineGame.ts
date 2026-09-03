import { useState, useEffect, useRef, useCallback } from 'react'
import type { CardVariant } from '../data/cards'
import type { OnlineSyncState } from './useChessGame'
import {
  createOnlineGame as firestoreCreate,
  joinOnlineGame as firestoreJoin,
  loadOnlineGame,
  submitMove,
  subscribeToGame,
  type OnlineGameDoc,
} from '../lib/onlineGame'

interface Options {
  userId: string | null
  displayName: string | null
  onExternalMove: (state: OnlineSyncState) => void
}

interface UseOnlineGameReturn {
  onlineGameId: string | null
  onlineDoc: OnlineGameDoc | null
  myColor: 'w' | 'b' | null
  joinError: string | null
  createGame: (cards: CardVariant[]) => Promise<string>
  joinGame: (gameId: string, cards: CardVariant[]) => Promise<void>
  writeMyTurn: (state: OnlineSyncState) => Promise<void>
  leaveGame: () => void
}

export function useOnlineGame({ userId, displayName, onExternalMove }: Options): UseOnlineGameReturn {
  const [onlineGameId, setOnlineGameId] = useState<string | null>(null)
  const [onlineDoc, setOnlineDoc] = useState<OnlineGameDoc | null>(null)
  const [myColor, setMyColor] = useState<'w' | 'b' | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)

  const myColorRef = useRef<'w' | 'b' | null>(null)
  const onExternalMoveRef = useRef(onExternalMove)
  const lastSyncedFenRef = useRef<string | null>(null)

  useEffect(() => { onExternalMoveRef.current = onExternalMove }, [onExternalMove])

  // Subscribe to game document and handle opponent moves
  useEffect(() => {
    if (!onlineGameId) return
    lastSyncedFenRef.current = null  // reset on new game

    const unsub = subscribeToGame(onlineGameId, (data) => {
      setOnlineDoc(data)

      // Only process moves once the game is active
      if (!data.sync || data.sync.moveHistory.length === 0) return
      if (data.sync.fen === lastSyncedFenRef.current) return  // own write echoed back
      if (myColorRef.current === null) return

      onExternalMoveRef.current(data.sync)
    })

    return () => unsub()
  }, [onlineGameId])

  const createGame = useCallback(async (cards: CardVariant[]): Promise<string> => {
    if (!userId) throw new Error('Must be signed in')
    const gameId = await firestoreCreate(userId, displayName, cards)
    setOnlineGameId(gameId)
    setMyColor('w')
    myColorRef.current = 'w'
    setJoinError(null)
    return gameId
  }, [userId, displayName])

  const joinGame = useCallback(async (gameId: string, cards: CardVariant[]): Promise<void> => {
    if (!userId) throw new Error('Must be signed in')
    const existing = await loadOnlineGame(gameId)
    if (!existing) { setJoinError('Game not found.'); return }
    if (existing.status !== 'waiting') { setJoinError('This game is already full or has ended.'); return }
    if (existing.white === userId) { setJoinError("You can't join your own game."); return }

    await firestoreJoin(gameId, userId, displayName, cards)
    setOnlineGameId(gameId)
    setMyColor('b')
    myColorRef.current = 'b'
    setJoinError(null)
    // Clean up URL so refresh doesn't re-join
    window.history.replaceState({}, '', '/')
  }, [userId, displayName])

  const writeMyTurn = useCallback(async (state: OnlineSyncState): Promise<void> => {
    if (!onlineGameId) return
    lastSyncedFenRef.current = state.fen
    await submitMove(onlineGameId, state)
  }, [onlineGameId])

  const leaveGame = useCallback(() => {
    setOnlineGameId(null)
    setOnlineDoc(null)
    setMyColor(null)
    myColorRef.current = null
    lastSyncedFenRef.current = null
    setJoinError(null)
  }, [])

  return { onlineGameId, onlineDoc, myColor, joinError, createGame, joinGame, writeMyTurn, leaveGame }
}
