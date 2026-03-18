import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home, BookOpen, Dumbbell, Settings, LogIn, LogOut, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useQuizStore } from '@/store/quizStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useAuthStore } from '@/store/authStore'
import { useProgressStore } from '@/store/progressStore'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/components/auth/AuthModal'
import { ConversionNudge } from '@/components/auth/ConversionNudge'

const navItems = [
  { to: '/', label: 'ホーム', icon: Home },
  { to: '/learn', label: '学習', icon: BookOpen },
  { to: '/practice', label: '練習', icon: Dumbbell },
  { to: '/settings', label: '設定', icon: Settings },
]

function ExamExitDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-background rounded-xl border shadow-xl p-6 space-y-4"
      >
        <div className="text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <h2 className="font-bold text-base">模擬試験を中断しますか？</h2>
          <p className="text-sm text-muted-foreground mt-1">
            試験結果は保存されません。中断すると最初からやり直しになります。
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            試験に戻る
          </Button>
          <Button variant="destructive" className="flex-1" onClick={onConfirm}>
            中断する
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export function AppShell() {
  const navigate = useNavigate()
  const { session, reset } = useQuizStore()
  const { theme } = useSettingsStore()
  const { user, initialize, signOut, setCallbacks } = useAuthStore()
  const { loadFromDB, migrateGuestData, resetAll } = useProgressStore()
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const pendingNavRef = useRef<string | null>(null)

  // ログイン・ログアウト時のコールバックをauthStoreに登録
  const handleLogin = useCallback((userId: string) => {
    console.log('[AppShell] handleLogin', userId)
    migrateGuestData(userId).then(() => loadFromDB(userId))
  }, [migrateGuestData, loadFromDB])

  const handleLogout = useCallback(() => {
    console.log('[AppShell] handleLogout')
    resetAll()
  }, [resetAll])

  useEffect(() => {
    setCallbacks(handleLogin, handleLogout)
  }, [setCallbacks, handleLogin, handleLogout])

  useEffect(() => {
    const unsubPromise = initialize()
    return () => {
      unsubPromise.then((unsub) => unsub())
    }
  }, [initialize])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }, [theme])

  const isExamInProgress =
    session?.mode === 'exam' && session.finishedAt === null

  const handleNavClick = (to: string, e: React.MouseEvent) => {
    if (to === '/practice' || to === '/') return
    if (isExamInProgress) {
      e.preventDefault()
      pendingNavRef.current = to
      setShowExitDialog(true)
    } else if (session && session.finishedAt === null) {
      reset()
    }
  }

  const confirmExit = () => {
    reset()
    setShowExitDialog(false)
    if (pendingNavRef.current) {
      navigate(pendingNavRef.current)
      pendingNavRef.current = null
    }
  }

  return (
    <div className="flex min-h-svh bg-background">
      {/* サイドバーナビ（デスクトップ: lg以上） */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r sticky top-0 h-screen">
        <div className="px-6 h-14 flex items-center border-b">
          <span className="font-semibold text-primary">G検定対策</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={(e) => handleNavClick(to, e)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ユーザー情報 / ログインボタン（デスクトップ） */}
        <div className="px-3 py-4 border-t">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2 py-1">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                ログアウト
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <LogIn className="h-4 w-4 shrink-0" />
              ログイン / 登録
            </button>
          )}
        </div>
      </aside>

      {/* コンテンツエリア */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* モバイルヘッダー */}
        <header className="lg:hidden sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
          <div className="px-4 h-14 flex items-center justify-between">
            <span className="font-semibold text-primary">G検定対策</span>
            {user ? (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 text-xs text-primary font-medium"
              >
                <LogIn className="h-4 w-4" />
                ログイン
              </button>
            )}
          </div>
        </header>

        {/* メイン */}
        <main className="flex-1 w-full overflow-x-hidden">
          <Outlet />
        </main>

        {/* ボトムナビ（モバイルのみ） */}
        <nav className="lg:hidden sticky bottom-0 z-10 border-t bg-background/80 backdrop-blur-sm">
          <div className="flex">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={(e) => handleNavClick(to, e)}
                className={({ isActive }) =>
                  cn(
                    'flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      {/* 模試中断確認ダイアログ */}
      <AnimatePresence>
        {showExitDialog && (
          <ExamExitDialog
            onConfirm={confirmExit}
            onCancel={() => {
              setShowExitDialog(false)
              pendingNavRef.current = null
            }}
          />
        )}
      </AnimatePresence>

      {/* 認証モーダル */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
      </AnimatePresence>

      {/* コンバージョンナッジ */}
      <ConversionNudge onOpenAuthModal={() => setShowAuthModal(true)} />
    </div>
  )
}
