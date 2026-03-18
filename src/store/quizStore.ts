import { create } from 'zustand'
import type { QuizSession, Question, QuizMode } from '@/types'

interface QuizState {
  session: QuizSession | null
  startSession: (mode: QuizMode, questions: Question[]) => void
  answer: (choiceIndex: number) => void
  next: () => void
  prev: () => void
  goto: (index: number) => void
  finish: () => void
  reset: () => void
  currentQuestion: () => Question | null
}

export const useQuizStore = create<QuizState>()((set, get) => ({
  session: null,

  startSession: (mode, questions) =>
    set({
      session: {
        mode,
        questions,
        currentIndex: 0,
        answers: new Array(questions.length).fill(null),
        startedAt: new Date().toISOString(),
        finishedAt: null,
      },
    }),

  answer: (choiceIndex) =>
    set((s) => {
      if (!s.session) return s
      const answers = [...s.session.answers]
      answers[s.session.currentIndex] = choiceIndex
      return { session: { ...s.session, answers } }
    }),

  next: () =>
    set((s) => {
      if (!s.session) return s
      const nextIndex = s.session.currentIndex + 1
      if (nextIndex >= s.session.questions.length) return s
      return { session: { ...s.session, currentIndex: nextIndex } }
    }),

  prev: () =>
    set((s) => {
      if (!s.session) return s
      const prevIndex = s.session.currentIndex - 1
      if (prevIndex < 0) return s
      return { session: { ...s.session, currentIndex: prevIndex } }
    }),

  goto: (index) =>
    set((s) => {
      if (!s.session) return s
      if (index < 0 || index >= s.session.questions.length) return s
      return { session: { ...s.session, currentIndex: index } }
    }),

  finish: () =>
    set((s) => {
      if (!s.session) return s
      return { session: { ...s.session, finishedAt: new Date().toISOString() } }
    }),

  reset: () => set({ session: null }),

  currentQuestion: () => {
    const s = get().session
    if (!s) return null
    return s.questions[s.currentIndex] ?? null
  },
}))
