# Claude Code 設定ファイル

## プロジェクト概要
論文検索・可視化アプリケーション。StreamlitからReact + FastAPIへの移行プロジェクト。
AI/LLMを活用した論文解析、翻訳、要約機能を搭載。

## プロジェクト構成
```
paper_search/
├── streamlit_app/          # Streamlit版アプリ（既存）
├── react_app/
│   ├── INST.md             # このディレクトリのガイド
│   ├── backend/            # FastAPI アプリ
│   │   ├── Dockerfile
│   │   ├── README.md
│   │   ├── main.py         # API 実装
│   │   └── requirements.txt
│   └── frontend/           # Next.js アプリ（メイン開発対象）
│       ├── Dockerfile
│       ├── README.md
│       ├── app/            # ルーティングエントリ
│       │   ├── layout.tsx  # 全体レイアウト
│       │   ├── page.tsx    # トップページ (SearchPage)
│       │   └── results/
│       │       └── page.tsx # 検索結果ページ (ResultsPage)
│       ├── components/     # UI組み合わせ用コンポーネント
│       │   ├── SearchPage.tsx     # 検索画面
│       │   ├── ResultsPage.tsx    # 結果画面の骨格
│       │   ├── PaperCard.tsx      # 各論文カード
│       │   └── AnalysisPanel.tsx  # 解析・翻訳結果パネル
│       ├── features/       # 機能別のロジックとUI
│       │   ├── search/
│       │   │   ├── hooks/useSearch.ts    # 検索処理
│       │   │   ├── SearchBar.tsx         # ヘッダー用検索バー
│       │   │   └── ResultsHeader.tsx     # 件数表示やソート
│       │   ├── analysis/
│       │   │   ├── hooks/useAnalysis.ts  # 解析API呼び出し
│       │   │   └── AnalysisResult.tsx    # 解析結果表示
│       │   ├── translation/
│       │   │   ├── hooks/useTranslation.ts  # 翻訳API呼び出し(ストリーミング)
│       │   │   └── TranslationResult.tsx    # 翻訳結果表示
│       │   └── summary/
│       │       ├── hooks/useSummary.ts      # 要約API呼び出し
│       │       ├── QuickSummary.tsx         # 簡潔要約
│       │       └── DetailedSummary.tsx      # 詳細要約
│       ├── layout/
│       │   ├── Header.tsx  # 共通ヘッダー
│       │   ├── Sidebar.tsx # サイドメニュー
│       │   └── index.ts
│       ├── settings/
│       │   ├── hooks/useModelSettings.ts # モデル設定取得/更新
│       │   ├── ModelSettings.tsx         # 設定モーダル
│       │   └── index.ts
│       ├── ui/             # 汎用UI部品
│       │   ├── ExpandableText.tsx
│       │   ├── LoadingSpinner.tsx
│       │   ├── ResizablePanel.tsx
│       │   └── index.ts
│       ├── config/         # API URLや定数
│       │   ├── api.ts
│       │   └── constants.ts
│       ├── types/          # TypeScript型定義
│       │   ├── analysis.ts
│       │   ├── api.ts
│       │   ├── index.ts
│       │   ├── paper.ts
│       │   └── summary.ts
│       ├── next.config.ts
│       ├── postcss.config.mjs
│       ├── package.json
│       ├── package-lock.json
│       └── tsconfig.json
└── docker-compose.yml      # Docker環境設定
```

## 開発コマンド

### フロントエンド（Next.js）
```bash
cd react_app/frontend
npm run dev      # 開発サーバー起動
npm run build    # ビルド
npm run lint     # ESLint実行
```

### バックエンド（FastAPI）
```bash
cd react_app/backend
python main.py   # 開発サーバー起動
```

### Docker環境
```bash
# 全サービス起動
docker-compose up --build

# フロントエンド + バックエンドのみ
docker-compose up frontend backend

# Streamlitのみ
docker-compose up streamlit
```

## 技術スタック

### フロントエンド
- **Next.js 15.3.3** (App Router)
- **React 19** 
- **TypeScript** (厳密な型チェック)
- **Tailwind CSS** (スタイリング)
- **Lucide React** (アイコン)

### バックエンド
- **FastAPI** (Python 3.10+)
- **ストリーミングAPI** (リアルタイム翻訳)

### AI/LLM
- **Ollama** (ホスト環境で起動)
- **モデル**: gemma3:12b (Q4_K_M, Q3_K_M)
- **API接続**: http://host.docker.internal:11435

## アーキテクチャ設計（2025-06-17実装完了）

### フィーチャーベースアーキテクチャ
詳細なディレクトリ構成は上記「プロジェクト構成」を参照。

### 設計原則
1. **単一責任原則**: 各コンポーネント/フックは1つの責任のみ
2. **関心の分離**: UI・ロジック・データアクセスを分離
3. **カスタムフック活用**: ビジネスロジックの再利用性
4. **型安全性**: 厳密なTypeScript型定義
5. **設定一元管理**: ハードコードの排除

## 主要機能

### 1. 論文検索
- **リアルタイム検索**: 高速な論文検索
- **ソート機能**: 関連度順、新しい順、引用数順
- **件数調整**: 5-100件まで可変

### 2. AI論文解析
- **分野分類**: 自動的な研究分野の特定
- **技術要素抽出**: 手法、要因、指標の構造化
- **検索キーワード生成**: 日英対応

### 3. 翻訳機能
- **ストリーミング翻訳**: リアルタイム翻訳表示
- **アブストラクト対応**: 論文要約の日本語化

### 4. 要約機能
- **簡潔要約**: 自動実行、即座に日本語要約表示
- **詳細要約**: 構造化された詳細分析
  - 背景、手法、結果、結論の分離
  - キーワード自動抽出

### 5. モデル設定
- **機能別モデル選択**: 解析、翻訳、要約ごとに最適化
- **リアルタイム切り替え**: 即座反映

## リファクタリング成果（2025-06-17完了）

### Before（問題点）
- **1700行の巨大ファイル**: 保守困難
- **責任の混在**: 全機能が1ファイルに集約
- **ハードコードされたURL**: 設定管理の欠如
- **25個以上のuseState**: 複雑な状態管理
- **型定義の散在**: any型の多用
- **拡張性の欠如**: 新機能追加困難

### After（改善結果）
- **280行のメインファイル**: 83%コード削減
- **機能別分離**: 検索、解析、翻訳、要約の独立モジュール
- **設定一元管理**: `config/api.ts`でURL管理
- **カスタムフック活用**: 状態管理の最適化
- **型安全性確保**: 厳密なTypeScript型定義
- **拡張性向上**: 新機能追加が容易

### 品質指標
- **ESLint**: ✅ エラーなし
- **TypeScript**: ✅ 型安全性確保
- **コード重複**: 大幅削減
- **チーム開発**: 機能別ファイル分割でコンフリクト軽減

## ファイル間の連携

- **フロントエンド ↔ バックエンド**
  - `frontend/config/api.ts` に API ベースURLと各エンドポイントを定義。これをカスタムフック (例:`useSearch`) から参照し、`backend/main.py` の API を呼び出します。
- **ページ構成**
  - `app/page.tsx` → `components/SearchPage` を表示。検索クエリ入力後、Next.js の `router.push` で `/results` へ遷移します。
  - `app/results/page.tsx` → `components/ResultsPage` を表示。検索結果取得や解析・翻訳・要約の操作を行います。
- **ResultsPage の内部**
  - `features/search/useSearch` が検索 API `/search` を実行し結果リストを取得。
  - 各論文は `components/PaperCard` で表示し、解析や翻訳ボタン押下時に `useAnalysis` `useTranslation` などのフックを呼び出します。
  - 解析結果や翻訳結果は `components/AnalysisPanel` 内で `AnalysisResult` や `TranslationResult` コンポーネントにより表示されます。
  - 要約機能は `useSummary` フックを通じて `/quick-summary` `/summarize` へアクセスし、`QuickSummary` / `DetailedSummary` コンポーネントでUI表示します。
  - モデル設定は `settings/ModelSettings` がモーダルとして動作し、`Sidebar` から開きます。
- **共通UI**
  - `ui` ディレクトリのコンポーネントは複数画面で利用される小規模部品です。たとえば `LoadingSpinner` や `ResizablePanel` などです。

## 画面構成と責務

1. **検索画面 (`/`)**
   - `SearchPage` が中心。検索クエリ入力や高度なオプションを扱います。
   - 入力値は `useRouter` を利用して `/results` にクエリパラメータとして渡されます。

2. **結果画面 (`/results`)**
   - `ResultsPage` がメイン。ヘッダー (`Header`)、サイドバー (`Sidebar`)、論文一覧 (`PaperCard`) を組み合わせて構成。
   - 解析・翻訳・要約はサイドパネル (`AnalysisPanel`) で閲覧。
   - モデル設定 (`ModelSettings`) をモーダルで開くことができます。

3. **バックエンド (`backend/main.py`)**
   - 論文検索、解析、翻訳、要約などのAPIを提供します。フロントエンドの各フックはこれらのエンドポイントを呼び出し、結果を表示します。

## 開発ガイドライン

### 作業時の注意点
- **lint実行**: コミット前に `npm run lint` 必須
- **Docker環境**: `docker-compose up frontend backend` 推奨
- **型安全性**: any型の使用禁止
- **段階的修正**: lintエラーは即座修正

### 新機能追加時の手順
1. **機能別ディレクトリ**に新しい機能を追加してください。フックでロジックを分離し、UIコンポーネントは `components` または `ui` に配置します。
2. 型定義は `types/` に追加し、`config/api.ts` にエンドポイントを追記します。
3. 新規ファイル・ディレクトリを作成したら `react_app/INST.md` のツリーも更新します。
4. 適切な `features/` ディレクトリに配置
5. カスタムフックでビジネスロジック分離
6. UIコンポーネントは `ui/` で再利用性確保
7. 設定は `config/` で一元管理

### コード品質基準
- **ESLint準拠**: エラー0を維持
- **TypeScript厳密**: any型禁止
- **単一責任**: 1ファイル1機能
- **再利用性**: DRY原則遵守

## 次回開発時の継続事項
- 現在のアーキテクチャを維持
- 新機能は機能別ディレクトリに追加
- カスタムフック活用でロジック分離
- 型安全性の確保

## 環境構築
- **Ollama**: ホスト環境で別途起動が必要
- **Docker**: 開発環境での利用を推奨
- **Node.js**: フロントエンド開発用
- **Python**: バックエンド開発用

## プロジェクト状況
- ✅ **Streamlit → React移行**: 完了
- ✅ **大規模リファクタリング**: 完了（1700行→280行）
- ✅ **アーキテクチャ整備**: フィーチャーベース実装完了
- ✅ **型安全性確保**: TypeScript厳密化完了
- 🔄 **機能拡張**: 継続開発中