# Claude Code 設定ファイル

## プロジェクト概要
論文検索・可視化アプリケーション。StreamlitからReact + FastAPIへの移行中。

## プロジェクト構成
- `streamlit_app/`: Streamlit版アプリ（既存）
- `react_app/frontend/`: Next.jsアプリ（新規）
- `react_app/backend/`: FastAPI アプリ（新規）

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
- Next.js 15.3.3
- React 19
- TypeScript
- Tailwind CSS
- Material-UI
- Lucide React (アイコン)

### バックエンド
- FastAPI
- Python 3.10+

### AI/LLM
- Ollama (ホスト環境で起動)
- モデル: gemma3:12b (Q4_K_M, Q3_K_M)
- API接続: http://host.docker.internal:11435

## 作業時の注意点
- lint/typecheckコマンドは `npm run lint`
- コミット前には必ずlintを実行
- Docker環境での開発を推奨
- Ollamaはホスト環境で別途起動が必要

## 現在の作業状況
- Streamlit → React移行中
- 検索API実装済み
- UI改善中（検索結果表示機能）

## ResultsPage.tsx大規模リファクタリング計画

### 現在の問題点（2025-06-16分析）
- **巨大なファイル**: 1700行の単一コンポーネント
- **責任の混在**: 検索・解析・翻訳・要約・UI状態管理がすべて混在
- **ハードコードされたURL**: `http://localhost:8000` が直接記述
- **複雑な状態管理**: 25個以上のuseStateが混在
- **型定義の散在**: 複数のインターフェースが分離されていない
- **拡張性の欠如**: 新機能追加が困難な構造

### リファクタリング戦略

#### Phase 1: 基盤整備
1. **型定義の分離** → `types/` ディレクトリ
   - `paper.ts`: 論文関連の型
   - `analysis.ts`: 解析結果の型
   - `summary.ts`: 要約関連の型
   - `api.ts`: API レスポンスの型

2. **設定の一元管理** → `config/` ディレクトリ
   - `api.ts`: API URL、エンドポイントの管理
   - `constants.ts`: 定数の管理

3. **共通UIコンポーネント** → `ui/` ディレクトリ
   - `ExpandableText.tsx`: 展開可能テキスト
   - `ResizablePanel.tsx`: リサイズ可能パネル
   - `LoadingSpinner.tsx`: ローディング表示

#### Phase 2: フィーチャー別分離
1. **検索機能** → `features/search/`
   - `SearchBar.tsx`: 検索バー
   - `SearchResults.tsx`: 検索結果一覧
   - `hooks/useSearch.ts`: 検索ロジック

2. **解析機能** → `features/analysis/`
   - `AnalysisPanel.tsx`: 解析パネル
   - `AnalysisResult.tsx`: 解析結果表示
   - `hooks/useAnalysis.ts`: 解析ロジック

3. **翻訳機能** → `features/translation/`
   - `TranslationPanel.tsx`: 翻訳パネル
   - `hooks/useTranslation.ts`: 翻訳ロジック（ストリーミング対応）

4. **要約機能** → `features/summary/`
   - `QuickSummary.tsx`: 簡潔要約表示
   - `DetailedSummary.tsx`: 詳細要約（構造化）
   - `hooks/useSummary.ts`: 要約ロジック

#### Phase 3: レイアウト分離
1. **ヘッダー** → `layout/Header.tsx`
   - 検索バー、ロゴ、表示件数選択

2. **サイドバー** → `layout/Sidebar.tsx`
   - ナビゲーション、ドロワー機能

3. **設定画面** → `settings/ModelSettings.tsx`
   - モデル設定画面の分離

#### Phase 4: 最終統合
1. **ResultsPage.tsxの簡素化**
   - メインレイアウトと状態管理のみ
   - フィーチャーコンポーネントの組み合わせ

2. **カスタムフックの活用**
   - ビジネスロジックの分離
   - 状態管理の最適化

### 重要な設計原則
1. **単一責任原則**: 各コンポーネントは1つの責任のみ
2. **依存性の逆転**: 抽象に依存し、具象に依存しない
3. **開放閉鎖原則**: 拡張に開放、修正に閉鎖
4. **関心の分離**: UI・ロジック・データアクセスの分離

### 推定作業量
- **Phase 1-2**: 2-3セッション（基盤とコア機能）
- **Phase 3-4**: 1-2セッション（レイアウトと統合）
- **テスト・調整**: 1セッション

### 次回作業時の開始点
1. `types/` ディレクトリ作成と型定義の移動
2. `config/api.ts` 作成とURL一元管理
3. `ui/ExpandableText.tsx` の分離から開始

### Docker開発環境での注意点
- 開発中は `docker-compose up frontend backend` を使用
- リファクタリング後は必ず動作確認を実施
- lintエラーが出ないよう段階的に修正