import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firestore'

export function useTokenBalance(userId: string | null): number | null {
  const [tokens, setTokens] = useState<number | null>(null)

  useEffect(() => {
    if (!userId) { setTokens(null); return }

    const ref = doc(db, 'app_users', userId)
    const unsub = onSnapshot(ref, snap => {
      const data = snap.data()
      const val = data?.academy_student_roles?.happypawnchess?.tokens
      setTokens(typeof val === 'number' ? val : null)
    }, () => setTokens(null))

    return unsub
  }, [userId])

  return tokens
}
