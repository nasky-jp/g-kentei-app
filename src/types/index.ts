// ── シラバス ──────────────────────────────────────────────
export type SyllabusCategory =
  | 'ai_overview'       // AI概論
  | 'machine_learning'  // 機械学習
  | 'deep_learning'     // ディープラーニング
  | 'math_stats'        // 数学・統計
  | 'data_engineering'  // データエンジニアリング
  | 'ethics_law'        // 倫理・法律・社会
  | 'business'          // ビジネス応用

export interface SyllabusItem {
  id: string
  category: SyllabusCategory
  title: string
  description: string
  markdownPath: string // /content/learn/{id}.md
}

// ── 問題 ──────────────────────────────────────────────────
export type Difficulty = 'easy' | 'normal' | 'hard'

export interface Question {
  id: string
  category: SyllabusCategory
  syllabusId: string
  text: string
  choices: string[]   // 4択
  answer: number      // 0-indexed
  explanation: string
  difficulty: Difficulty
  tags: string[]
}

// ── FSRS カード ────────────────────────────────────────────
export interface CardState {
  questionId: string
  due: string         // ISO 8601
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  reps: number
  lapses: number
  state: number       // fsrs State enum value
  last_review: string // ISO 8601
}

// ── 進捗 ──────────────────────────────────────────────────
export interface CategoryProgress {
  category: SyllabusCategory
  total: number
  learned: number   // answered at least once
  mastered: number  // stability >= 21
}

// ── クイズセッション ───────────────────────────────────────
export type QuizMode = 'flashcard' | 'exam'

export interface QuizSession {
  mode: QuizMode
  questions: Question[]
  currentIndex: number
  answers: (number | null)[]  // user's chosen index
  startedAt: string
  finishedAt: string | null
}

// ── 設定 ──────────────────────────────────────────────────
export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  dailyGoal: number     // 問/日
  examQuestionCount: number
}
