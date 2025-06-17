# Claude Code 設定ファイル

## プロジェクト概要
論文検索・可視化アプリケーション。StreamlitからReact + FastAPIへの移行プロジェクト。
AI/LLMを活用した論文解析、翻訳、要約機能を搭載。

## プロジェクト構成
```
paper_search/
├── streamlit_app/          # Streamlit版アプリ（既存）
├── react_app/
│   ├── frontend/           # Next.js アプリ（メイン開発対象）
│   │   ├── components/     # ページコンポーネント
│   │   ├── features/       # 機能別モジュール
│   │   ├── layout/         # レイアウトコンポーネント
│   │   ├── ui/             # 共通UIコンポーネント
│   │   ├── types/          # TypeScript型定義
│   │   ├── config/         # 設定・定数管理
│   │   └── settings/       # 設定画面
│   └── backend/            # FastAPI アプリ
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
```
frontend/
├── components/
│   ├── ResultsPage.tsx        # メインページ（280行、83%削減）
│   ├── PaperCard.tsx          # 論文カードコンポーネント
│   └── AnalysisPanel.tsx      # 解析結果パネル
├── features/                  # 機能別モジュール
│   ├── search/                # 検索機能
│   │   ├── hooks/useSearch.ts
│   │   ├── SearchBar.tsx
│   │   └── ResultsHeader.tsx
│   ├── analysis/              # 論文解析機能
│   │   ├── hooks/useAnalysis.ts
│   │   └── AnalysisResult.tsx
│   ├── translation/           # 翻訳機能（ストリーミング対応）
│   │   ├── hooks/useTranslation.ts
│   │   └── TranslationResult.tsx
│   └── summary/               # 要約機能
│       ├── hooks/useSummary.ts
│       ├── QuickSummary.tsx   # 簡潔要約（自動実行）
│       └── DetailedSummary.tsx # 詳細要約（構造化）
├── layout/                    # レイアウトコンポーネント
│   ├── Header.tsx
│   └── Sidebar.tsx
├── ui/                        # 再利用可能UIコンポーネント
│   ├── ExpandableText.tsx
│   ├── LoadingSpinner.tsx
│   └── ResizablePanel.tsx
├── types/                     # TypeScript型定義
│   ├── paper.ts
│   ├── analysis.ts
│   ├── summary.ts
│   └── api.ts
├── config/                    # 設定・定数管理
│   ├── api.ts                 # API URL一元管理
│   └── constants.ts
└── settings/                  # 設定画面
    ├── hooks/useModelSettings.ts
    └── ModelSettings.tsx
```

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

## 開発ガイドライン

### 作業時の注意点
- **lint実行**: コミット前に `npm run lint` 必須
- **Docker環境**: `docker-compose up frontend backend` 推奨
- **型安全性**: any型の使用禁止
- **段階的修正**: lintエラーは即座修正

### 新機能追加時の手順
1. 適切な `features/` ディレクトリに配置
2. カスタムフックでビジネスロジック分離
3. 型定義を `types/` に追加
4. UIコンポーネントは `ui/` で再利用性確保
5. 設定は `config/` で一元管理

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