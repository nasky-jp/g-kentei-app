import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useQuizStore } from '@/store/quizStore'
import { useProgressStore } from '@/store/progressStore'
import { QUESTIONS } from '@/data/questions'
import { CATEGORY_LABELS } from '@/data/syllabus'
import { fsrs, createEmptyCard, Rating } from 'ts-fsrs'

const f = fsrs()

// ─── 離脱確認ダイアログ ───────────────────────────────────────
function ExitConfirmDialog({
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

// ─── 一問一答モード ───────────────────────────────────────────
function FlashcardView() {
  const { session, answer, next, finish, currentQuestion } = useQuizStore()
  const { getCard, setCard } = useProgressStore()
  const [revealed, setRevealed] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)

  const q = currentQuestion()
  const isLast = session ? session.currentIndex >= session.questions.length - 1 : false
  const progress = session ? ((session.currentIndex) / session.questions.length) * 100 : 0

  const handleAnswer = useCallback((idx: number) => {
    if (selected !== null || !q) return
    setSelected(idx)
    setRevealed(true)
    answer(idx)

    const isCorrect = idx === q.answer
    setFeedback(isCorrect ? 'correct' : 'wrong')

    const existing = getCard(q.id)
    const card = existing ? createEmptyCard(new Date(existing.due)) : createEmptyCard()
    const rating = isCorrect ? Rating.Good : Rating.Again
    const result = f.next(card, new Date(), rating)
    const updated = result.card

    setCard({
      questionId: q.id,
      due: updated.due.toISOString(),
      stability: updated.stability,
      difficulty: updated.difficulty,
      elapsed_days: updated.elapsed_days,
      scheduled_days: updated.scheduled_days,
      reps: updated.reps,
      lapses: updated.lapses,
      state: updated.state,
      last_review: updated.last_review?.toISOString() ?? new Date().toISOString(),
    })
  }, [selected, q, answer, getCard, setCard])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (revealed) {
        if (e.key === 'Enter') { e.preventDefault(); handleNext() }
        return
      }
      const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 }
      const idx = map[e.key.toLowerCase()]
      if (idx !== undefined) { e.preventDefault(); handleAnswer(idx) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [revealed, handleAnswer])

  const handleNext = () => {
    setRevealed(false)
    setSelected(null)
    setFeedback(null)
    if (isLast) finish()
    else next()
  }

  if (!q || !session) return null

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{session.currentIndex + 1} / {session.questions.length}</span>
          <Badge variant="outline" className="text-xs">{CATEGORY_LABELS[q.category]}</Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Card className={`transition-colors duration-300 ${
            feedback === 'correct' ? 'border-green-500/50 bg-green-500/10' :
            feedback === 'wrong' ? 'border-red-400 bg-red-50/20' : ''
          }`}>
            <CardHeader>
              <CardTitle className="text-base leading-relaxed whitespace-pre-line">{q.text}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {q.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={revealed}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all duration-200 ${
                    !revealed
                      ? 'hover:bg-accent hover:text-accent-foreground border-border hover:scale-[1.01]'
                      : idx === q.answer
                      ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-300 scale-[1.01]'
                      : idx === selected
                      ? 'bg-red-50 border-red-400 text-red-800'
                      : 'border-border opacity-40'
                  }`}
                >
                  <span className="font-mono text-xs mr-2 opacity-60">{String.fromCharCode(65 + idx)}</span>
                  {choice}
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm ${
              feedback === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {feedback === 'correct' ? '✓ 正解！' : '✗ 不正解'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
        >
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <p className="text-sm font-medium mb-1">解説</p>
              <p className="text-sm text-muted-foreground">{q.explanation}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {revealed && (
        <Button onClick={handleNext} className="w-full">
          {isLast ? '結果を見る' : '次の問題'} <span className="ml-1 opacity-50 text-xs">Enter</span>
        </Button>
      )}
    </div>
  )
}

// ─── 模擬試験モード ───────────────────────────────────────────
function ExamView() {
  const { session, answer, goto, finish } = useQuizStore()
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const { reset } = useQuizStore()

  const q = session ? session.questions[session.currentIndex] : null
  const currentAnswer = session ? session.answers[session.currentIndex] : null
  const answeredCount = session ? session.answers.filter((a) => a !== null).length : 0
  const total = session?.questions.length ?? 0

  const handleSelect = (idx: number) => {
    answer(idx)
  }

  const handleSubmit = () => {
    finish()
    setShowSubmitDialog(false)
  }

  const handleAbort = () => {
    reset()
    setShowExitDialog(false)
  }

  if (!session || !q) return null

  return (
    <div className="flex flex-col min-h-[calc(100svh-56px-72px)] lg:min-h-[calc(100svh-56px)]">
      {/* 試験ヘッダー */}
      <div className="sticky top-14 lg:top-0 z-10 bg-background border-b">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-muted-foreground">問題</span>
            <span className="text-primary font-bold">{session.currentIndex + 1}</span>
            <span className="text-muted-foreground">/ {total}</span>
          </div>
          <div className="flex-1">
            <Progress value={(answeredCount / total) * 100} className="h-1.5" />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{answeredCount}/{total}回答</span>
          <button
            onClick={() => setShowExitDialog(true)}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors shrink-0"
          >
            中断
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-0 lg:gap-4 max-w-3xl mx-auto w-full px-4 sm:px-6">
        {/* 問題番号パネル（デスクトップ: 右サイドバー） */}
        <aside className="hidden lg:block w-48 shrink-0 order-last">
          <div className="sticky top-12 p-3 border rounded-lg mt-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">問題一覧</p>
            <div className="grid grid-cols-5 gap-1">
              {session.questions.map((_, i) => {
                const answered = session.answers[i] !== null
                const isCurrent = i === session.currentIndex
                return (
                  <button
                    key={i}
                    onClick={() => goto(i)}
                    className={`aspect-square rounded text-xs font-medium transition-colors ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : answered
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-primary/20 inline-block" />回答済み
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-muted inline-block" />未回答
              </div>
            </div>
            <Button
              onClick={() => setShowSubmitDialog(true)}
              className="w-full mt-4"
              size="sm"
            >
              提出する
            </Button>
          </div>
        </aside>

        {/* 問題エリア */}
        <div className="flex-1 min-w-0 py-4 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={session.currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">{CATEGORY_LABELS[q.category]}</Badge>
                  </div>
                  <CardTitle className="text-base leading-relaxed font-normal whitespace-pre-line">
                    {q.text}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {q.choices.map((choice, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                        currentAnswer === idx
                          ? 'bg-primary/10 border-primary text-primary font-medium'
                          : 'border-border hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <span className="font-mono text-xs mr-2 opacity-60">{String.fromCharCode(65 + idx)}</span>
                      {choice}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* 前後ナビ */}
          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => goto(session.currentIndex - 1)}
              disabled={session.currentIndex === 0}
              className="flex-1"
            >
              ← 前の問題
            </Button>
            {session.currentIndex < total - 1 ? (
              <Button
                variant="outline"
                onClick={() => goto(session.currentIndex + 1)}
                className="flex-1"
              >
                次の問題 →
              </Button>
            ) : (
              <Button
                onClick={() => setShowSubmitDialog(true)}
                className="flex-1"
              >
                提出する
              </Button>
            )}
          </div>

          {/* モバイル: 問題番号グリッド */}
          <div className="lg:hidden">
            <p className="text-xs text-muted-foreground mb-2">問題一覧（タップでジャンプ）</p>
            <div className="grid grid-cols-10 gap-1">
              {session.questions.map((_, i) => {
                const answered = session.answers[i] !== null
                const isCurrent = i === session.currentIndex
                return (
                  <button
                    key={i}
                    onClick={() => goto(i)}
                    className={`aspect-square rounded text-xs font-medium transition-colors ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : answered
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
            <Button
              onClick={() => setShowSubmitDialog(true)}
              className="w-full mt-3"
            >
              提出する ({answeredCount}/{total}問回答済み)
            </Button>
          </div>
        </div>
      </div>

      {/* 中断確認ダイアログ */}
      {showExitDialog && (
        <ExitConfirmDialog
          onConfirm={handleAbort}
          onCancel={() => setShowExitDialog(false)}
        />
      )}

      {/* 提出確認ダイアログ */}
      {showSubmitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-background rounded-xl border shadow-xl p-6 space-y-4"
          >
            <div className="text-center">
              <p className="text-2xl mb-2">📝</p>
              <h2 className="font-bold text-base">解答を提出しますか？</h2>
              <p className="text-sm text-muted-foreground mt-1">
                回答済み: <span className="font-semibold text-foreground">{answeredCount}</span> / {total}問
              </p>
              {answeredCount < total && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ {total - answeredCount}問が未回答です
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowSubmitDialog(false)}>
                試験に戻る
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                提出する
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// ─── 結果画面 ─────────────────────────────────────────────────
function ResultView() {
  const { session, reset } = useQuizStore()
  if (!session) return null

  const correct = session.answers.filter((a, i) => a === session.questions[i].answer).length
  const total = session.questions.length
  const pct = Math.round((correct / total) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center py-8">
        <motion.p
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="text-6xl font-bold text-primary"
        >
          {pct}%
        </motion.p>
        <p className="text-muted-foreground mt-2">{total}問中 {correct}問正解</p>
      </div>

      <Progress value={pct} className="h-3" />

      <Card className={pct >= 70 ? 'border-green-500/50 bg-green-500/10' : 'border-orange-500/50 bg-orange-500/10'}>
        <CardContent className="pt-4 text-center">
          {pct >= 70
            ? <p className="text-green-700 font-semibold">🎉 合格ライン到達！</p>
            : <p className="text-orange-700 font-semibold">もう少し練習しましょう</p>
          }
          <p className="text-xs text-muted-foreground mt-1">
            {pct >= 70 ? '合格基準70%以上' : `あと${70 - pct}%で合格ライン`}
          </p>
        </CardContent>
      </Card>

      {/* 問題別レビュー */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">問題レビュー</h2>
        {session.questions.map((q, i) => {
          const userAnswer = session.answers[i]
          const isCorrect = userAnswer === q.answer
          return (
            <div
              key={q.id}
              className={`p-3 rounded-lg border text-sm ${
                isCorrect ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className={`shrink-0 font-medium ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                  {isCorrect ? '✓' : '✗'}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">問{i + 1}</p>
                  <p className="font-medium text-xs leading-relaxed line-clamp-2">{q.text}</p>
                  {!isCorrect && (
                    <p className="text-xs text-muted-foreground mt-1">
                      正解: {q.choices[q.answer]}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{q.explanation}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Button onClick={reset} className="w-full" variant="outline">
        メニューに戻る
      </Button>
    </motion.div>
  )
}

// ─── メインページ ─────────────────────────────────────────────
export function PracticePage() {
  const { session, startSession, reset } = useQuizStore()
  const { cards } = useProgressStore()
  const navigate = useNavigate()
  const location = useLocation()
  const prevPathRef = useRef(location.pathname)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const pendingNavRef = useRef<string | null>(null)

  const dueCount = Object.values(cards).filter(
    (c) => c.due <= new Date().toISOString()
  ).length

  // タブ遷移の検知: 他ページから/practiceに戻ってきたとき以外の遷移でリセット
  // 模試中は離脱警告を出す
  useEffect(() => {
    prevPathRef.current = location.pathname
  }, [location.pathname])

  // 模試中のブラウザバック / リロード検知
  useEffect(() => {
    if (!session || session.mode !== 'exam' || session.finishedAt !== null) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [session])

  const startFlashcard = () => {
    const due = QUESTIONS.filter((q) => (cards[q.id]?.due ?? '') <= new Date().toISOString())
    const pool = due.length >= 5 ? due : QUESTIONS
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10)
    startSession('flashcard', shuffled)
  }

  const startExam = () => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, Math.min(40, QUESTIONS.length))
    startSession('exam', shuffled)
  }

  const confirmExit = () => {
    reset()
    setShowExitDialog(false)
    if (pendingNavRef.current) {
      navigate(pendingNavRef.current)
      pendingNavRef.current = null
    }
  }

  const pageContainer = 'max-w-xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-28 lg:pb-8'

  if (session && session.finishedAt !== null) return <div className={pageContainer}><ResultView /></div>
  if (session && session.mode === 'exam') {
    return (
      <>
        <ExamView />
        {showExitDialog && (
          <ExitConfirmDialog
            onConfirm={confirmExit}
            onCancel={() => { setShowExitDialog(false); pendingNavRef.current = null }}
          />
        )}
      </>
    )
  }
  if (session && session.mode === 'flashcard') return <div className={pageContainer}><FlashcardView /></div>

  return (
    <div className={`space-y-6 ${pageContainer}`}>
      <div>
        <h1 className="text-xl font-bold">練習</h1>
        <p className="text-sm text-muted-foreground mt-1">一問一答・模擬試験</p>
      </div>

      <div className="space-y-3">
        <Card
          className="cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
          onClick={startFlashcard}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">一問一答</CardTitle>
              {dueCount > 0 && (
                <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                  復習 {dueCount}件
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              FSRS間隔反復で弱点を優先出題。10問ずつ。
            </p>
            <p className="text-xs text-muted-foreground mt-1 opacity-70">
              キーボード: A/B/C/D → 選択 / Enter → 次へ
            </p>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
          onClick={startExam}
        >
          <CardHeader>
            <CardTitle className="text-base">模擬試験</CardTitle>
            <p className="text-sm text-muted-foreground">
              本番形式{Math.min(40, QUESTIONS.length)}問。前後移動・問題ジャンプ対応。
            </p>
          </CardHeader>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        問題数: {QUESTIONS.length}問
      </div>
    </div>
  )
}
