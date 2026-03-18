import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

interface Props {
  onClose: () => void
}

export function AuthModal({ onClose }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { signIn, signUp } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'signin') {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error)
      } else {
        onClose()
      }
    } else {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error)
      } else {
        setDone(true)
      }
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-background rounded-xl border shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base">
            {mode === 'signin' ? 'ログイン' : 'アカウント登録'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="text-center space-y-3 py-4">
            <p className="text-2xl">📧</p>
            <p className="text-sm font-medium">確認メールを送信しました</p>
            <p className="text-xs text-muted-foreground">
              メールのリンクをクリックして登録を完了してください
            </p>
            <Button variant="outline" className="w-full mt-2" onClick={onClose}>
              閉じる
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="6文字以上"
              />
            </div>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '処理中...' : mode === 'signin' ? 'ログイン' : '登録する'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {mode === 'signin' ? (
                <>
                  アカウントをお持ちでない方は{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(null) }}
                    className="text-primary underline"
                  >
                    新規登録
                  </button>
                </>
              ) : (
                <>
                  すでにアカウントをお持ちの方は{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setError(null) }}
                    className="text-primary underline"
                  >
                    ログイン
                  </button>
                </>
              )}
            </p>
          </form>
        )}
      </motion.div>
    </div>
  )
}
