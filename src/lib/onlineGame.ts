import {
  collection, doc, addDoc, getDoc, updateDoc, onSnapshot, serverTimestamp,
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
}

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export async function createOnlineGame(
  userId: string,
  displayName: string | null,
  cards: CardVariant[],
): Promise<string> {
  const ref = await addDoc(collection(db, 'online_games'), {
    white: userId,
    black: null,
    whiteDisplayName: displayName,
    blackDisplayName: null,
    status: 'waiting',
    whiteCards: cards,
    blackCards: null,
    sync: {
      fen: INITIAL_FEN,
      moveHistory: [],
      lastMove: null,
      crystalQueenVulnerable: false,
      spaceChessbeardFrozenSquare: null,
      status: 'playing',
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

export function subscribeToGame(
  gameId: string,
  callback: (data: OnlineGameDoc) => void,
): () => void {
  return onSnapshot(doc(db, 'online_games', gameId), (snap) => {
    if (snap.exists()) callback(snap.data() as OnlineGameDoc)
  })
}
