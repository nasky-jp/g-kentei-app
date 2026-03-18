import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CardState, CategoryProgress, SyllabusCategory } from '@/types'

interface ProgressState {
  cards: Record<string, CardState>       // questionId -> CardState
  setCard: (state: CardState) => void
  getCard: (questionId: string) => CardState | undefined
  getDueCards: () => CardState[]
  getCategoryProgress: (category: SyllabusCategory, questionIds: string[]) => CategoryProgress
  resetAll: () => void
}

const now = () => new Date().toISOString()

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      cards: {},

      setCard: (cardState) =>
        set((s) => ({ cards: { ...s.cards, [cardState.questionId]: cardState } })),

      getCard: (questionId) => get().cards[questionId],

      getDueCards: () => {
        const nowStr = now()
        return Object.values(get().cards).filter((c) => c.due <= nowStr)
      },

      getCategoryProgress: (category, questionIds) => {
        const cards = get().cards
        let learned = 0
        let mastered = 0
        for (const id of questionIds) {
          const c = cards[id]
          if (!c) continue
          if (c.reps > 0) learned++
          if (c.stability >= 21) mastered++
        }
        return { category, total: questionIds.length, learned, mastered }
      },

      resetAll: () => set({ cards: {} }),
    }),
    { name: 'g-kentei-progress' }
  )
)
