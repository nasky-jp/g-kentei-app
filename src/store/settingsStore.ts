import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings } from '@/types'

interface SettingsState extends AppSettings {
  update: (patch: Partial<AppSettings>) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      dailyGoal: 20,
      examQuestionCount: 40,
      update: (patch) => set((s) => ({ ...s, ...patch })),
    }),
    { name: 'g-kentei-settings' }
  )
)
