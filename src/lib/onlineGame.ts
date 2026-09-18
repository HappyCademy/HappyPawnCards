import {
  collection, doc, addDoc, getDoc, updateDoc, onSnapshot, serverTimestamp, type Timestamp,
} from 'firebase/firestore'
import { db } from './firestore'
import type { CardVariant } from '../data/cards'
import type { OnlineSyncState } from '../hooks/useChessGame'

export interface OnlineGameDoc {
  white: string
  black: string | null
  whiteDisplayName: string | null
  blackDisplayName: string | null
  status: 'waiting' | 'playing' | 'white-wins' | 'black-wins' | 'draw'
  whiteCards: CardVariant[]
  blackCards: CardVariant[] | null
  sync: OnlineSyncState
  timeControlSeconds: number | null
  wHeartbeat?: Timestamp | null
  bHeartbeat?: Timestamp | null
}

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export async function createOnlineGame(
  userId: string,
  displayName: string | null,
  cards: CardVariant[],
  timeControlSeconds: number | null,
): Promise<string> {
  const ref = await addDoc(collection(db, 'online_games'), {
    white: userId,
    black: null,
    whiteDisplayName: displayName,
    blackDisplayName: null,
    status: 'waiting',
    whiteCards: cards,
    blackCards: null,
    timeControlSeconds,
    sync: {
      fen: INITIAL_FEN,
      moveHistory: [],
      lastMove: null,
      crystalQueenVulnerable: false,
      spaceChessbeardFrozenSquare: null,
      status: 'playing',
      resignedBy: null,
      timeRemainingW: timeControlSeconds,
      timeRemainingB: timeControlSeconds,
    } satisfies OnlineSyncState,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function loadOnlineGame(gameId: string): Promise<OnlineGameDoc | null> {
  const snap = await getDoc(doc(db, 'online_games', gameId))
  if (!snap.exists()) return null
  return snap.data() as OnlineGameDoc
}

export async function joinOnlineGame(
  gameId: string,
  userId: string,
  displayName: string | null,
  cards: CardVariant[],
): Promise<void> {
  await updateDoc(doc(db, 'online_games', gameId), {
    black: userId,
    blackDisplayName: displayName,
    blackCards: cards,
    status: 'playing',
  })
}

export async function submitMove(gameId: string, state: OnlineSyncState): Promise<void> {
  await updateDoc(doc(db, 'online_games', gameId), {
    sync: state,
    status: state.status,
  })
}

export async function writeHeartbeat(gameId: string, color: 'w' | 'b'): Promise<void> {
  await updateDoc(doc(db, 'online_games', gameId), {
    [color === 'w' ? 'wHeartbeat' : 'bHeartbeat']: serverTimestamp(),
  })
}

export async function claimWinByDisconnect(gameId: string, winnerColor: 'w' | 'b'): Promise<void> {
  const status = winnerColor === 'w' ? 'white-wins' : 'black-wins'
  const loserColor = winnerColor === 'w' ? 'b' : 'w'
  await updateDoc(doc(db, 'online_games', gameId), {
    status,
    'sync.status': status,
    'sync.resignedBy': loserColor,
  })
}

export function subscribeToGame(
  gameId: string,
  callback: (data: OnlineGameDoc) => void,
): () => void {
  return onSnapshot(doc(db, 'online_games', gameId), (snap) => {
    if (snap.exists()) callback(snap.data() as OnlineGameDoc)
  })
}

const ACTIVE_GAME_KEY = 'hpc_active_game'

export function saveActiveGame(gameId: string, color: 'w' | 'b'): void {
  try { localStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify({ gameId, color })) } catch {}
}

export function clearActiveGame(): void {
  try { localStorage.removeItem(ACTIVE_GAME_KEY) } catch {}
}

export function loadActiveGameCache(): { gameId: string; color: 'w' | 'b' } | null {
  try {
    const raw = localStorage.getItem(ACTIVE_GAME_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
