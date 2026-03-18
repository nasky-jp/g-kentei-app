import { useNavigate } from 'react-router-dom'
import { BookOpen, Dumbbell, FlameIcon, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useProgressStore } from '@/store/progressStore'
import { useQuizStore } from '@/store/quizStore'
import { QUESTIONS } from '@/data/questions'
import type { CardState } from '@/types'

function getStreakDays(cards: Record<string, CardState>): number {
  // 回答日のセットを作る
  const days = new Set<string>()
  for (const card of Object.values(cards)) {
    if (card.last_review) {
      days.add(card.last_review.slice(0, 10)) // YYYY-MM-DD
    }
  }
  if (days.size === 0) return 0

  // 今日から遡って連続日数を数える
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (days.has(key)) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export function HomePage() {
  const navigate = useNavigate()
  const { cards } = useProgressStore()
  const { startSession } = useQuizStore()

  // due数（今日以前に復習予定）
  const dueCount = Object.values(cards).filter(
    (c) => c.due <= new Date().toISOString()
  ).length

  // 習得済み問題数
  const masteredCount = Object.values(cards).filter((c) => c.stability >= 5).length

  // 連続学習日数
  const streak = getStreakDays(cards)

  // 今日の復習を開始
  const handleStartReview = () => {
    const dueIds = Object.values(cards)
      .filter((c) => c.due <= new Date().toISOString())
      .map((c) => c.questionId)
    const dueQuestions = QUESTIONS.filter((q) => dueIds.includes(q.id))
    if (dueQuestions.length === 0) return
    startSession('flashcard', dueQuestions)
    navigate('/practice')
  }

  // 新しい問題を解く（未回答の問題をランダムに）
  const handleStartNew = () => {
    const unanswered = QUESTIONS.filter((q) => !cards[q.id] || cards[q.id].reps === 0)
    const shuffled = [...unanswered].sort(() => Math.random() - 0.5).slice(0, 10)
    if (shuffled.length === 0) return
    startSession('flashcard', shuffled)
    navigate('/practice')
  }

  const unansweredCount = QUESTIONS.filter(
    (q) => !cards[q.id] || cards[q.id].reps === 0
  ).length
  const answeredCount = QUESTIONS.length - unansweredCount
  const totalPct = QUESTIONS.length > 0 ? Math.round((answeredCount / QUESTIONS.length) * 100) : 0
  const hasStarted = answeredCount > 0

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-28 lg:pb-8">
      {/* ヘッダー */}
      <div>
        <h1 className="text-xl font-bold">G検定対策</h1>
        <p className="text-sm text-muted-foreground">
          {hasStarted ? '今日も学習を続けよう' : 'まずは最初の問題を解いてみよう'}
        </p>
      </div>

      {/* 初回ユーザー向けCTA */}
      {!hasStarted && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-5 text-center space-y-3">
            <p className="text-2xl">🎯</p>
            <div>
              <p className="text-sm font-semibold">G検定の合格を目指そう</p>
              <p className="text-xs text-muted-foreground mt-1">
                まずは10問チャレンジ。間隔反復で効率よく定着させます。
              </p>
            </div>
            <Button className="w-full h-12 text-sm gap-2" onClick={handleStartNew}>
              <Dumbbell className="h-4 w-4" />
              最初の10問を始める
            </Button>
            <button
              onClick={() => navigate('/learn')}
              className="text-xs text-muted-foreground underline underline-offset-2"
            >
              先にシラバスを確認する
            </button>
          </CardContent>
        </Card>
      )}

      {/* 統計サマリ（学習開始後のみ） */}
      {hasStarted && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <CardContent className="pt-4 pb-3 px-2">
              <FlameIcon className="h-5 w-5 mx-auto mb-1 text-orange-500" />
              <p className="text-2xl font-bold">{streak}</p>
              <p className="text-xs text-muted-foreground">連続日数</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4 pb-3 px-2">
              <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <p className="text-2xl font-bold">{dueCount}</p>
              <p className="text-xs text-muted-foreground">復習待ち</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4 pb-3 px-2">
              <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-500" />
              <p className="text-2xl font-bold">{masteredCount}</p>
              <p className="text-xs text-muted-foreground">習得済み</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 全体進捗 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">全体の学習進捗</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-primary">{totalPct}%</span>
            <span className="text-sm text-muted-foreground">{answeredCount}/{QUESTIONS.length}問 回答済み</span>
          </div>
          <Progress value={totalPct} className="h-3" />
        </CardContent>
      </Card>

      {/* アクションボタン（学習開始後） */}
      {hasStarted && (
        <div className="space-y-3">
          {dueCount > 0 ? (
            <Button
              className="w-full h-14 text-base gap-2"
              onClick={handleStartReview}
            >
              <Clock className="h-5 w-5" />
              今日の復習を始める（{dueCount}問）
            </Button>
          ) : (
            <Card className="border-green-500/30 bg-green-500/10">
              <CardContent className="py-4 text-center">
                <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-green-500" />
                <p className="text-sm font-medium text-green-600 dark:text-green-400">今日の復習は完了！</p>
                <p className="text-xs text-muted-foreground mt-0.5">また明日来てね</p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-12 gap-2"
              onClick={handleStartNew}
              disabled={unansweredCount === 0}
            >
              <Dumbbell className="h-4 w-4" />
              <span className="text-sm">
                {unansweredCount > 0 ? `新問題（${unansweredCount}問）` : '全問回答済み'}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-12 gap-2"
              onClick={() => navigate('/learn')}
            >
              <BookOpen className="h-4 w-4" />
              <span className="text-sm">シラバスを学ぶ</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
