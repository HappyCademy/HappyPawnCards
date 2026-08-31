import { useState } from 'react'
import type { AuthState } from '../../hooks/useAuth'

const D = 'var(--font-display)'
const B = 'var(--font-body)'

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/invalid-email':        'Invalid email address.',
  'auth/user-not-found':       'No account found with this email.',
  'auth/wrong-password':       'Incorrect password.',
  'auth/invalid-credential':   'Incorrect email or password.',
  'auth/too-many-requests':    'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Check your connection.',
}

interface Props {
  auth: AuthState
  onBack: () => void
  onSuccess: () => void
}

export default function SignInScreen({ auth, onBack, onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await auth.signIn(email.trim(), password)
      onSuccess()
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      setError(FIREBASE_ERRORS[code] ?? 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen-bg min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div style={{
        width: '100%', maxWidth: '380px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px',
      }}>
        <img
          src="/images/logo.svg"
          alt="Happy Pawn Cards"
          style={{
            height: 'clamp(56px, 10vw, 80px)',
            filter: 'drop-shadow(0 2px 16px rgba(201,162,39,0.45))',
          }}
        />

        <div style={{
          width: '100%',
          background: 'var(--glass-bg)',
          border: '1.5px solid rgba(201,162,39,0.25)',
          borderRadius: '20px',
          backdropFilter: 'blur(14px)',
          padding: '32px 28px',
          display: 'flex', flexDirection: 'column', gap: '20px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: D, fontSize: '18px', fontWeight: 600, color: 'var(--ivory)', letterSpacing: '0.06em' }}>
              Sign In
            </p>
            <p style={{ fontFamily: B, fontSize: '12px', color: 'var(--ivory-dim)', marginTop: '4px' }}>
              Use your Happy Pawn account
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontFamily: B, fontSize: '11px', fontWeight: 700, color: 'var(--ivory-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                style={{
                  fontFamily: B, fontSize: '14px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(13,10,26,0.6)',
                  border: '1.5px solid rgba(201,162,39,0.2)',
                  color: 'var(--ivory)',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.6)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.2)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontFamily: B, fontSize: '11px', fontWeight: 700, color: 'var(--ivory-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  fontFamily: B, fontSize: '14px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(13,10,26,0.6)',
                  border: '1.5px solid rgba(201,162,39,0.2)',
                  color: 'var(--ivory)',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.6)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.2)' }}
              />
            </div>

            {error && (
              <p style={{
                fontFamily: B, fontSize: '12px',
                color: '#f87171', textAlign: 'center',
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: '8px', padding: '8px 12px',
              }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '4px',
                fontFamily: D, fontSize: '13px', fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '12px',
                borderRadius: '12px',
                background: loading ? 'rgba(201,162,39,0.3)' : 'rgba(201,162,39,0.15)',
                border: '1.5px solid rgba(201,162,39,0.5)',
                color: loading ? 'rgba(201,162,39,0.5)' : 'var(--gold)',
                cursor: loading ? 'default' : 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (loading) return
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = 'rgba(201,162,39,0.25)'
                el.style.boxShadow = '0 0 20px rgba(201,162,39,0.25)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = loading ? 'rgba(201,162,39,0.3)' : 'rgba(201,162,39,0.15)'
                el.style.boxShadow = 'none'
              }}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>

        <button
          onClick={onBack}
          style={{
            fontFamily: B, fontSize: '13px', fontWeight: 600,
            color: 'var(--ivory-dim)', letterSpacing: '0.04em',
            background: 'none', border: 'none', cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ivory-dim)' }}
        >
          ← Back
        </button>
      </div>
    </div>
  )
}
