import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/store/settingsStore'
import { useProgressStore } from '@/store/progressStore'

export function SettingsPage() {
  const { theme, dailyGoal, examQuestionCount, update } = useSettingsStore()
  const { resetAll } = useProgressStore()

  const handleReset = () => {
    if (window.confirm('学習データをリセットしますか？この操作は取り消せません。')) {
      resetAll()
    }
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-28 lg:pb-8">
      <div>
        <h1 className="text-xl font-bold">設定</h1>
      </div>

      {/* テーマ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">テーマ</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => update({ theme: t })}
              className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                theme === t
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'light' ? 'ライト' : t === 'dark' ? 'ダーク' : 'システム'}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* 1日の目標 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">1日の目標問題数</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          {[10, 20, 30, 50].map((n) => (
            <button
              key={n}
              onClick={() => update({ dailyGoal: n })}
              className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                dailyGoal === n
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {n}問
            </button>
          ))}
        </CardContent>
      </Card>

      {/* 模擬試験問題数 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">模擬試験の問題数</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          {[20, 40, 60].map((n) => (
            <button
              key={n}
              onClick={() => update({ examQuestionCount: n })}
              className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                examQuestionCount === n
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {n}問
            </button>
          ))}
        </CardContent>
      </Card>

      {/* データリセット */}
      <Card className="border-destructive/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-destructive">学習データのリセット</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            すべての進捗・FSRS記録を削除します。
          </p>
          <Button variant="destructive" size="sm" onClick={handleReset}>
            リセットする
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
