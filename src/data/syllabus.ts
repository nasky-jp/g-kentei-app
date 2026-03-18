import type { SyllabusCategory, SyllabusItem } from '@/types'

export const CATEGORY_LABELS: Record<SyllabusCategory, string> = {
  ai_overview: 'AI概論',
  machine_learning: '機械学習',
  deep_learning: 'ディープラーニング',
  math_stats: '数学・統計',
  data_engineering: 'データエンジニアリング',
  ethics_law: '倫理・法律・社会',
  business: 'ビジネス応用',
}

export const CATEGORY_COLORS: Record<SyllabusCategory, string> = {
  ai_overview: 'bg-purple-600 text-white dark:bg-purple-500 dark:text-white',
  machine_learning: 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white',
  deep_learning: 'bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white',
  math_stats: 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white',
  data_engineering: 'bg-orange-600 text-white dark:bg-orange-500 dark:text-white',
  ethics_law: 'bg-red-600 text-white dark:bg-red-500 dark:text-white',
  business: 'bg-amber-500 text-white dark:bg-amber-400 dark:text-gray-900',
}

export const SYLLABUS_ITEMS: SyllabusItem[] = [
  {
    id: 'ai-history',
    category: 'ai_overview',
    title: 'AIの歴史と発展',
    description: 'AIブームの変遷・強いAI/弱いAI・汎用AI',
    markdownPath: '/content/learn/ai-history.md',
  },
  {
    id: 'ai-types',
    category: 'ai_overview',
    title: 'AIの種類と分類',
    description: 'ルールベース・機械学習・深層学習の違い',
    markdownPath: '/content/learn/ai-types.md',
  },
  {
    id: 'ml-supervised',
    category: 'machine_learning',
    title: '教師あり学習',
    description: '回帰・分類・代表的アルゴリズム',
    markdownPath: '/content/learn/ml-supervised.md',
  },
  {
    id: 'ml-unsupervised',
    category: 'machine_learning',
    title: '教師なし学習',
    description: 'クラスタリング・次元削減・異常検知',
    markdownPath: '/content/learn/ml-unsupervised.md',
  },
  {
    id: 'ml-evaluation',
    category: 'machine_learning',
    title: 'モデル評価',
    description: '精度・再現率・F1・交差検証・過学習',
    markdownPath: '/content/learn/ml-evaluation.md',
  },
  {
    id: 'dl-basics',
    category: 'deep_learning',
    title: 'ニューラルネットワーク基礎',
    description: 'パーセプトロン・活性化関数・誤差逆伝播',
    markdownPath: '/content/learn/dl-basics.md',
  },
  {
    id: 'dl-cnn',
    category: 'deep_learning',
    title: 'CNN・画像認識',
    description: '畳み込み層・プーリング・代表モデル',
    markdownPath: '/content/learn/dl-cnn.md',
  },
  {
    id: 'dl-rnn',
    category: 'deep_learning',
    title: 'RNN・Transformer',
    description: 'LSTM・Attention・大規模言語モデル',
    markdownPath: '/content/learn/dl-rnn.md',
  },
  {
    id: 'math-probability',
    category: 'math_stats',
    title: '確率・統計基礎',
    description: '確率分布・期待値・ベイズ定理',
    markdownPath: '/content/learn/math-probability.md',
  },
  {
    id: 'math-linear-algebra',
    category: 'math_stats',
    title: '線形代数',
    description: 'ベクトル・行列・固有値分解',
    markdownPath: '/content/learn/math-linear-algebra.md',
  },
  {
    id: 'data-preprocessing',
    category: 'data_engineering',
    title: 'データ前処理',
    description: '欠損値・外れ値・正規化・エンコーディング',
    markdownPath: '/content/learn/data-preprocessing.md',
  },
  {
    id: 'data-pipeline',
    category: 'data_engineering',
    title: 'データパイプライン',
    description: 'ETL・データレイク・ストリーミング処理',
    markdownPath: '/content/learn/data-pipeline.md',
  },
  {
    id: 'ethics-bias',
    category: 'ethics_law',
    title: 'AIバイアスと公平性',
    description: 'アルゴリズムバイアス・公平性指標・対策',
    markdownPath: '/content/learn/ethics-bias.md',
  },
  {
    id: 'ethics-law',
    category: 'ethics_law',
    title: 'AI関連法規制',
    description: '個人情報保護法・GDPR・AI戦略・著作権',
    markdownPath: '/content/learn/ethics-law.md',
  },
  {
    id: 'business-usecase',
    category: 'business',
    title: 'AIビジネス活用事例',
    description: '産業別ユースケース・ROI・導入プロセス',
    markdownPath: '/content/learn/business-usecase.md',
  },
  // ── AI概論追加 ──────────────────────────────────────────────
  {
    id: 'ai-search',
    category: 'ai_overview',
    title: '探索・推論・知識表現',
    description: '探索アルゴリズム・論理推論・知識グラフ・オントロジー',
    markdownPath: '/content/learn/ai-search.md',
  },
  {
    id: 'ai-agent',
    category: 'ai_overview',
    title: 'AIエージェントと強化学習概論',
    description: 'エージェント・環境・報酬・Q学習・マルコフ決定過程',
    markdownPath: '/content/learn/ai-agent.md',
  },
  // ── 機械学習追加 ────────────────────────────────────────────
  {
    id: 'ml-reinforcement',
    category: 'machine_learning',
    title: '強化学習',
    description: 'Q学習・方策勾配・DQN・AlphaGoへの応用',
    markdownPath: '/content/learn/ml-reinforcement.md',
  },
  {
    id: 'ml-ensemble',
    category: 'machine_learning',
    title: 'アンサンブル学習',
    description: 'バギング・ブースティング・スタッキング・XGBoost',
    markdownPath: '/content/learn/ml-ensemble.md',
  },
  // ── ディープラーニング追加 ──────────────────────────────────
  {
    id: 'dl-generative',
    category: 'deep_learning',
    title: '生成AI・GAN・VAE',
    description: 'GAN・VAE・拡散モデル・画像生成・LLM',
    markdownPath: '/content/learn/dl-generative.md',
  },
  {
    id: 'dl-nlp',
    category: 'deep_learning',
    title: '自然言語処理（NLP）',
    description: '単語埋め込み・Word2Vec・BERT・GPT・トークナイザ',
    markdownPath: '/content/learn/dl-nlp.md',
  },
  {
    id: 'dl-optimization',
    category: 'deep_learning',
    title: '学習の最適化テクニック',
    description: '最適化アルゴリズム・正則化・バッチ正規化・ドロップアウト',
    markdownPath: '/content/learn/dl-optimization.md',
  },
  // ── 数学・統計追加 ──────────────────────────────────────────
  {
    id: 'math-calculus',
    category: 'math_stats',
    title: '微積分と勾配',
    description: '偏微分・勾配降下法・連鎖律・ヤコビアン',
    markdownPath: '/content/learn/math-calculus.md',
  },
  {
    id: 'math-information',
    category: 'math_stats',
    title: '情報理論',
    description: 'エントロピー・相互情報量・KLダイバージェンス・交差エントロピー',
    markdownPath: '/content/learn/math-information.md',
  },
  // ── データエンジニアリング追加 ─────────────────────────────
  {
    id: 'data-visualization',
    category: 'data_engineering',
    title: 'データ可視化・EDA',
    description: '探索的データ分析・可視化手法・分布・相関',
    markdownPath: '/content/learn/data-visualization.md',
  },
  // ── 倫理・法律追加 ─────────────────────────────────────────
  {
    id: 'ethics-governance',
    category: 'ethics_law',
    title: 'AIガバナンスと原則',
    description: 'AI原則・リスク管理・説明責任・透明性・国際動向',
    markdownPath: '/content/learn/ethics-governance.md',
  },
  // ── ビジネス追加 ─────────────────────────────────────────
  {
    id: 'business-mlops',
    category: 'business',
    title: 'MLOpsとAI開発プロセス',
    description: 'MLOps・CI/CD・モデル監視・ドリフト検知・フィーチャーストア',
    markdownPath: '/content/learn/business-mlops.md',
  },
  {
    id: 'business-strategy',
    category: 'business',
    title: 'AI戦略・DXとデータ活用',
    description: 'DX・データドリブン経営・AI人材・組織変革',
    markdownPath: '/content/learn/business-strategy.md',
  },
  // ── ディープラーニング追加 ──────────────────────────────────
  {
    id: 'dl-llm-advanced',
    category: 'deep_learning',
    title: 'LLM応用・RAG・プロンプト技術',
    description: 'RAG・LoRA・RLHF・プロンプトエンジニアリング・エージェント',
    markdownPath: '/content/learn/dl-llm-advanced.md',
  },
  // ── 倫理・法律追加 ─────────────────────────────────────────
  {
    id: 'ethics-international',
    category: 'ethics_law',
    title: '国際AI規制・著作権法',
    description: 'EU AI Act・広島AIプロセス・著作権法30条の4・ディープフェイク',
    markdownPath: '/content/learn/ethics-international.md',
  },
  // ── ビジネス追加 ─────────────────────────────────────────
  {
    id: 'business-project',
    category: 'business',
    title: 'AIプロジェクトマネジメント',
    description: '要件定義・データ収集・PoC・本番化・失敗パターン・KPI設定',
    markdownPath: '/content/learn/business-project.md',
  },
]
