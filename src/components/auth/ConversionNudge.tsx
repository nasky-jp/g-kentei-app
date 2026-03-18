import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProgressStore } from '@/store/progressStore'
import { useAuthStore } from '@/store/authStore'

const DISMISSED_KEY = 'conversion-nudge-dismissed'
const TRIGGER_COUNT = 10

interface ConversionNudgeProps {
  onOpenAuthModal: () => void
}

export function ConversionNudge({ onOpenAuthModal }: ConversionNudgeProps) {
  const syncCount = useProgressStore((s) => s.syncCount)
  const user = useAuthStore((s) => s.user)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (user) return
    if (sessionStorage.getItem(DISMISSED_KEY)) return
    if (syncCount >= TRIGGER_COUNT) {
      setVisible(true)
    }
  }, [syncCount, user])

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  const handleRegister = () => {
    dismiss()
    onOpenAuthModal()
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-20 lg:bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div className="pointer-events-auto w-full max-w-sm bg-background border rounded-xl shadow-xl p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium leading-snug">
                進捗が消える前に保存しませんか？
              </p>
              <button
                onClick={dismiss}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
                aria-label="閉じる"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              アカウント登録すると{TRIGGER_COUNT}問分の学習データがクラウドに保存されます。
            </p>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={handleRegister}>
                登録する
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={dismiss}>
                後で
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
