import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CardState, CategoryProgress, SyllabusCategory } from '@/types'
import { supabase } from '@/lib/supabase'

interface ProgressState {
  cards: Record<string, CardState>
  syncCount: number
  setCard: (state: CardState) => void
  getCard: (questionId: string) => CardState | undefined
  getDueCards: () => CardState[]
  getCategoryProgress: (category: SyllabusCategory, questionIds: string[]) => CategoryProgress
  loadFromDB: (userId: string) => Promise<void>
  migrateGuestData: (userId: string) => Promise<void>
  resetAll: () => void
}

const now = () => new Date().toISOString()

function toRow(userId: string, c: CardState) {
  return {
    user_id: userId,
    question_id: c.questionId,
    due: c.due,
    stability: c.stability,
    difficulty: c.difficulty,
    elapsed_days: c.elapsed_days,
    scheduled_days: c.scheduled_days,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state,
    last_review: c.last_review,
    updated_at: now(),
  }
}

function fromRow(row: Record<string, unknown>): CardState {
  return {
    questionId: row.question_id as string,
    due: row.due as string,
    stability: row.stability as number,
    difficulty: row.difficulty as number,
    elapsed_days: row.elapsed_days as number,
    scheduled_days: row.scheduled_days as number,
    reps: row.reps as number,
    lapses: row.lapses as number,
    state: row.state as number,
    last_review: row.last_review as string,
  }
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      cards: {},
      syncCount: 0,

      setCard: (cardState) => {
        set((s) => ({
          cards: { ...s.cards, [cardState.questionId]: cardState },
        }))

        supabase.auth.getUser().then(({ data }) => {
          const userId = data.user?.id
          if (!userId) {
            set((s) => ({ syncCount: s.syncCount + 1 }))
            return
          }
          supabase
            .from('card_progress')
            .upsert(toRow(userId, cardState), { onConflict: 'user_id,question_id' })
            .then(({ error }) => {
              if (error) console.error('[progressStore] upsert error', error)
            })
        })
      },

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

      loadFromDB: async (userId) => {
        const { data, error } = await supabase
          .from('card_progress')
          .select('*')
          .eq('user_id', userId)
        if (error) {
          console.error('[progressStore] loadFromDB error', error)
          return
        }
        // DBにデータがない場合はlocalStorageを維持（初回ログイン時のリセット防止）
        if (!data || data.length === 0) {
          set({ syncCount: 0 })
          return
        }
        const cards: Record<string, CardState> = {}
        for (const row of data) {
          const c = fromRow(row as Record<string, unknown>)
          cards[c.questionId] = c
        }
        set({ cards, syncCount: 0 })
      },

      migrateGuestData: async (userId) => {
        const localCards = Object.values(get().cards)
        if (localCards.length === 0) return

        // DBの既存データを取得してマージ（ログイン忘れで操作した分も反映）
        const { data: existing } = await supabase
          .from('card_progress')
          .select('*')
          .eq('user_id', userId)

        const remoteMap: Record<string, CardState> = {}
        for (const row of existing ?? []) {
          const c = fromRow(row as Record<string, unknown>)
          remoteMap[c.questionId] = c
        }

        // repsが多い方、同じならlast_reviewが新しい方を採用
        const rows = localCards.map((local) => {
          const remote = remoteMap[local.questionId]
          if (!remote) return toRow(userId, local)
          const winner =
            local.reps > remote.reps ? local
            : local.reps < remote.reps ? remote
            : local.last_review >= remote.last_review ? local : remote
          return toRow(userId, winner)
        })

        const { error } = await supabase
          .from('card_progress')
          .upsert(rows, { onConflict: 'user_id,question_id' })
        if (error) {
          console.error('[progressStore] migrateGuestData error', error)
          return
        }
        set({ syncCount: 0 })
      },

      resetAll: () => set({ cards: {}, syncCount: 0 }),
    }),
    { name: 'g-kentei-progress' }
  )
)
