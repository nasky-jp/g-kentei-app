import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChevronLeft, ChevronRight, BookOpen, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SYLLABUS_ITEMS, CATEGORY_LABELS, CATEGORY_COLORS } from '@/data/syllabus'
import { useProgressStore } from '@/store/progressStore'
import { useQuizStore } from '@/store/quizStore'
import { QUESTIONS } from '@/data/questions'
import type { SyllabusCategory } from '@/types'

export function LearnDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { cards } = useProgressStore()
  const { startSession } = useQuizStore()
  const [markdown, setMarkdown] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const item = SYLLABUS_ITEMS.find((s) => s.id === id)
  const currentIndex = SYLLABUS_ITEMS.findIndex((s) => s.id === id)
  const prevItem = currentIndex > 0 ? SYLLABUS_ITEMS[currentIndex - 1] : null
  const nextItem = currentIndex < SYLLABUS_ITEMS.length - 1 ? SYLLABUS_ITEMS[currentIndex + 1] : null

  const qCount = item ? QUESTIONS.filter((q) => q.syllabusId === item.id).length : 0

  useEffect(() => {
    if (!item) return
    setLoading(true)
    fetch(item.markdownPath)
      .then((r) => r.text())
      .then((text) => {
        setMarkdown(text)
        setLoading(false)
      })
      .catch(() => {
        setMarkdown('コンテンツを読み込めませんでした。')
        setLoading(false)
      })
  }, [item])

  if (!item) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>トピックが見つかりません</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/learn')}>
          学習一覧に戻る
        </Button>
      </div>
    )
  }

  const categories = Array.from(new Set(SYLLABUS_ITEMS.map((s) => s.category))) as SyllabusCategory[]

  const isItemLearned = (syllabusId: string) => {
    const qs = QUESTIONS.filter((q) => q.syllabusId === syllabusId)
    return qs.some((q) => (cards[q.id]?.reps ?? 0) > 0)
  }

  return (
    // AppShellのmax-w-xlを突き破って全幅を使う
    <div className="-mx-4 sm:-mx-6 lg:mx-0">
      {/* モバイル: サイドバーオーバーレイ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* モバイルサイドバー（スライドイン） */}
      <aside
        className="fixed top-0 left-0 h-full w-64 bg-background border-r z-30 overflow-y-auto p-4 transition-transform duration-200 lg:hidden"
        style={{ transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-sm">トピック一覧</span>
          <button type="button" className="p-1" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <SidebarContent
          categories={categories}
          currentId={id!}
          isItemLearned={isItemLearned}
          onSelect={(sid) => { navigate(`/learn/${sid}`); setSidebarOpen(false) }}
        />
      </aside>

      <div className="flex">
        {/* デスクトップサイドバー（fixed固定） */}
        {/* AppShellのサイドバーがw-56=224px なのでleft-56から開始 */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="fixed top-0 left-56 w-52 h-screen border-r overflow-y-auto bg-background">
            <div className="p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3">トピック一覧</p>
              <SidebarContent
                categories={categories}
                currentId={id!}
                isItemLearned={isItemLearned}
                onSelect={(sid) => navigate(`/learn/${sid}`)}
              />
            </div>
          </div>
        </aside>

        {/* メインコンテンツ */}
        <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
          {/* ヘッダー */}
          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={() => navigate('/learn')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            >
              <BookOpen className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold">{item.title}</h1>
                <Badge className={`text-xs shrink-0 border-0 ${CATEGORY_COLORS[item.category]}`}>
                  {CATEGORY_LABELS[item.category]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </div>

          {/* Markdownコンテンツ */}
          <div className="max-w-2xl">
            {loading ? (
              <div className="py-16 text-center text-muted-foreground text-sm">読み込み中...</div>
            ) : (
              <div className="
                prose prose-sm max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-h1:text-xl prose-h1:mb-4 prose-h1:mt-0
                prose-h2:text-base prose-h2:mt-6 prose-h2:mb-3 prose-h2:border-b prose-h2:pb-1
                prose-h3:text-sm prose-h3:mt-4 prose-h3:mb-2
                prose-p:text-sm prose-p:text-foreground prose-p:leading-relaxed prose-p:my-2
                prose-ul:my-2 prose-li:text-sm prose-li:text-foreground
                prose-table:text-xs prose-table:w-full
                prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold
                prose-td:px-3 prose-td:py-2 prose-td:border prose-td:border-border prose-td:text-foreground
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5
                prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:my-4
                prose-blockquote:not-italic prose-blockquote:text-foreground
                prose-code:bg-muted prose-code:text-foreground prose-code:px-1 prose-code:rounded prose-code:text-xs
                prose-pre:bg-muted prose-pre:text-foreground prose-pre:p-3 prose-pre:rounded-lg prose-pre:text-xs prose-pre:overflow-x-auto
                prose-strong:text-foreground prose-strong:font-semibold
                prose-hr:border-border prose-hr:my-4
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdown}
                </ReactMarkdown>
              </div>
            )}

            {/* 問題を解くボタン */}
            {qCount > 0 && (
              <div className="mt-6 p-4 border rounded-lg bg-primary/5 border-primary/20">
                <p className="text-sm font-medium mb-1">このトピックの問題を解く</p>
                <p className="text-xs text-muted-foreground mb-3">{qCount}問が利用できます</p>
                <Button
                  onClick={() => {
                    const qs = QUESTIONS.filter((q) => q.syllabusId === item.id)
                    startSession('flashcard', qs)
                    navigate('/practice')
                  }}
                  size="sm"
                >
                  練習問題へ
                </Button>
              </div>
            )}

            {/* 前後ナビ */}
            <div className="flex justify-between mt-6 pt-4 border-t gap-3 pb-8">
              {prevItem ? (
                <button
                  onClick={() => navigate(`/learn/${prevItem.id}`)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors max-w-[45%] text-left"
                >
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                  <span className="truncate">{prevItem.title}</span>
                </button>
              ) : <div />}
              {nextItem ? (
                <button
                  onClick={() => navigate(`/learn/${nextItem.id}`)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors max-w-[45%] text-right ml-auto"
                >
                  <span className="truncate">{nextItem.title}</span>
                  <ChevronRight className="h-4 w-4 shrink-0" />
                </button>
              ) : <div />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SidebarContent({
  categories,
  currentId,
  isItemLearned,
  onSelect,
}: {
  categories: SyllabusCategory[]
  currentId: string
  isItemLearned: (id: string) => boolean
  onSelect: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const items = SYLLABUS_ITEMS.filter((s) => s.category === cat)
        return (
          <div key={cat}>
            <p className="text-xs font-medium text-muted-foreground mb-1 px-1">
              {CATEGORY_LABELS[cat]}
            </p>
            <div className="space-y-0.5">
              {items.map((s) => {
                const learned = isItemLearned(s.id)
                const isActive = s.id === currentId
                return (
                  <button
                    key={s.id}
                    onClick={() => onSelect(s.id)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <span className={`mr-1.5 ${learned ? 'text-green-500' : 'opacity-30'}`}>
                      {learned ? '●' : '○'}
                    </span>
                    {s.title}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
