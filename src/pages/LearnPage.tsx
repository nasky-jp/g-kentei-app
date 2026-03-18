import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SYLLABUS_ITEMS, CATEGORY_LABELS, CATEGORY_COLORS } from '@/data/syllabus'
import { useProgressStore } from '@/store/progressStore'
import { QUESTIONS } from '@/data/questions'
import type { SyllabusCategory } from '@/types'

const CATEGORIES = Object.keys(CATEGORY_LABELS) as SyllabusCategory[]

export function LearnPage() {
  const [selected, setSelected] = useState<SyllabusCategory | 'all'>('all')
  const { cards } = useProgressStore()
  const navigate = useNavigate()

  const filtered = selected === 'all'
    ? SYLLABUS_ITEMS
    : SYLLABUS_ITEMS.filter((s) => s.category === selected)

  // シラバス項目が「学習済み」= その項目に紐づく問題を1問以上回答した
  const isItemLearned = (syllabusId: string) => {
    const qs = QUESTIONS.filter((q) => q.syllabusId === syllabusId)
    return qs.some((q) => (cards[q.id]?.reps ?? 0) > 0)
  }
  // シラバス項目が「習得済み」= 紐づく全問題の stability >= 21
  const isItemMastered = (syllabusId: string) => {
    const qs = QUESTIONS.filter((q) => q.syllabusId === syllabusId)
    return qs.length > 0 && qs.every((q) => (cards[q.id]?.stability ?? 0) >= 21)
  }

  // カテゴリ別統計
  const categoryStats = (cat: SyllabusCategory) => {
    const items = SYLLABUS_ITEMS.filter((s) => s.category === cat)
    const learned = items.filter((s) => isItemLearned(s.id)).length
    const mastered = items.filter((s) => isItemMastered(s.id)).length
    const qs = QUESTIONS.filter((q) => q.category === cat)
    const answeredQs = qs.filter((q) => (cards[q.id]?.reps ?? 0) > 0)
    const pct = items.length > 0 ? Math.round((learned / items.length) * 100) : 0
    return { pct, learned, mastered, total: items.length, totalQs: qs.length, answeredQs: answeredQs.length }
  }

  // 全体サマリ（問題ベース）
  const totalItems = SYLLABUS_ITEMS.length
  const totalLearned = SYLLABUS_ITEMS.filter((s) => isItemLearned(s.id)).length
  const totalPct = totalItems > 0 ? Math.round((totalLearned / totalItems) * 100) : 0

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-28 lg:pb-8">
      {/* ヘッダー + 全体進捗 */}
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold">学習</h1>
            <p className="text-sm text-muted-foreground">シラバスを体系的に学ぶ</p>
          </div>
          <span className="text-2xl font-bold text-primary">{totalPct}%</span>
        </div>
        <div>
          <Progress value={totalPct} className="h-3" />
          <p className="text-xs text-muted-foreground mt-1">
            {totalLearned} / {totalItems} トピック学習済み
          </p>
        </div>
      </div>

      {/* カテゴリフィルタ */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        <button
          onClick={() => setSelected('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors shrink-0 ${
            selected === 'all'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-border hover:text-foreground'
          }`}
        >
          すべて
        </button>
        {CATEGORIES.map((cat) => {
          const { pct } = categoryStats(cat)
          return (
            <button
              key={cat}
              onClick={() => setSelected(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors shrink-0 ${
                selected === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {CATEGORY_LABELS[cat]}
              {pct > 0 && (
                <span className="ml-1 opacity-70">{pct}%</span>
              )}
            </button>
          )
        })}
      </div>

      {/* カテゴリ進捗サマリ（all表示時） */}
      {selected === 'all' && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">カテゴリ別進捗</h2>
          <div className="space-y-3">
            {CATEGORIES.map((cat) => {
              const { pct, learned, mastered, total, totalQs, answeredQs } = categoryStats(cat)
              return (
                <button
                  key={cat}
                  onClick={() => setSelected(cat)}
                  className="w-full text-left"
                >
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">{CATEGORY_LABELS[cat]}</span>
                    <span className="text-muted-foreground">
                      {learned}/{total}トピック
                      {mastered > 0 && <span className="text-green-500 ml-1">✓{mastered}習得</span>}
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  {answeredQs > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      問題 {answeredQs}/{totalQs}問回答済み
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* シラバス一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((item) => {
          const isLearned = isItemLearned(item.id)
          const isMastered = isItemMastered(item.id)
          const qCount = QUESTIONS.filter((q) => q.syllabusId === item.id).length

          return (
            <Card
              key={item.id}
              onClick={() => navigate(`/learn/${item.id}`)}
              className={`cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm ${
                isMastered ? 'border-green-500/30 bg-green-500/10' : ''
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <Badge className={`text-xs shrink-0 border-0 ${CATEGORY_COLORS[item.category]}`}>
                    {CATEGORY_LABELS[item.category]}
                  </Badge>
                </div>
                <CardDescription className="text-xs">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    {isMastered && (
                      <span className="text-xs text-green-500 font-medium">✓ 習得済み</span>
                    )}
                    {isLearned && !isMastered && (
                      <span className="text-xs text-blue-500 font-medium">● 学習中</span>
                    )}
                    {!isLearned && (
                      <span className="text-xs text-muted-foreground">○ 未学習</span>
                    )}
                    {qCount > 0 && (
                      <span className="text-xs text-muted-foreground">{qCount}問</span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
