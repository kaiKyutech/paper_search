# React App 構成ガイド

この `react_app` ディレクトリは Next.js + FastAPI による新UI の実装場所です。フロントエンドとバックエンドの主要な役割やファイル連携を以下にまとめます。

## ディレクトリツリー

```
react_app/
├── INST.md                # このガイド
├── backend/               # FastAPI アプリ
│   ├── Dockerfile
│   ├── README.md
│   ├── main.py            # API 実装
│   └── requirements.txt
└── frontend/              # Next.js アプリ
    ├── Dockerfile
    ├── README.md
    ├── app/               # ルーティングエントリ
    │   ├── layout.tsx     # 全体レイアウト
    │   ├── page.tsx       # トップページ (SearchPage)
    │   └── results/
    │       └── page.tsx   # 検索結果ページ (ResultsPage)
    ├── components/        # UI組み合わせ用コンポーネント
    │   ├── SearchPage.tsx     # 検索画面
    │   ├── ResultsPage.tsx    # 結果画面の骨格
    │   ├── PaperCard.tsx      # 各論文カード
    │   └── AnalysisPanel.tsx  # 解析・翻訳結果パネル
    ├── features/          # 機能別のロジックとUI
    │   ├── search/
    │   │   ├── hooks/useSearch.ts    # 検索処理
    │   │   ├── SearchBar.tsx         # ヘッダー用検索バー
    │   │   └── ResultsHeader.tsx     # 件数表示やソート
    │   ├── analysis/
    │   │   ├── hooks/useAnalysis.ts  # 解析API呼び出し
    │   │   └── AnalysisResult.tsx    # 解析結果表示
    │   ├── translation/
    │   │   ├── hooks/useTranslation.ts  # 翻訳API呼び出し(ストリーミング)
    │   │   └── TranslationResult.tsx    # 翻訳結果表示
    │   └── summary/
    │       ├── hooks/useSummary.ts      # 要約API呼び出し
    │       ├── QuickSummary.tsx         # 簡潔要約
    │       └── DetailedSummary.tsx      # 詳細要約
    ├── layout/
    │   ├── Header.tsx       # 共通ヘッダー
    │   ├── Sidebar.tsx      # サイドメニュー
    │   └── index.ts
    ├── settings/
    │   ├── hooks/useModelSettings.ts # モデル設定取得/更新
    │   ├── ModelSettings.tsx         # 設定モーダル
    │   └── index.ts
    ├── ui/                 # 汎用UI部品
    │   ├── ExpandableText.tsx
    │   ├── LoadingSpinner.tsx
    │   ├── ResizablePanel.tsx
    │   └── index.ts
    ├── config/             # API URLや定数
    │   ├── api.ts
    │   └── constants.ts
    ├── types/              # TypeScript型定義
    │   ├── analysis.ts
    │   ├── api.ts
    │   ├── index.ts
    │   ├── paper.ts
    │   └── summary.ts
    ├── next.config.ts
    ├── postcss.config.mjs
    ├── package.json
    ├── package-lock.json
    └── tsconfig.json
```

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

## 開発時のポイント

- **機能別ディレクトリ**に新しい機能を追加してください。フックでロジックを分離し、UIコンポーネントは `components` または `ui` に配置します。
- 型定義は `types/` に追加し、`config/api.ts` にエンドポイントを追記します。
- 新規ファイル・ディレクトリを作成したら `AGENTS.md` のツリーも更新します。

以上が React アプリケーションの概要とファイル連携です。詳細なファイルの配置や責務を把握する際の参考にしてください。
