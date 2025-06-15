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