# 新リポジトリ設計案

このフォルダでは、既存の `paper_search` プロジェクトから派生する新しいリポジトリの設計資料をまとめます。フロントエンドは React(TypeScript)、バックエンドは Python ベースの FastAPI を候補としています。LLM との通信はストリーミング API を用いる想定です。

## ディレクトリ構成案
```
new_project/
├── frontend/      # React(TypeScript)
└── backend/       # FastAPI
```

## 主要技術
- フロントエンド: React + TypeScript
- バックエンド: FastAPI
- LLM ランタイム: Ollama

## 今後のタスク
1. REST API とストリーミング API の設計
2. 開発環境用 Dockerfile の作成
3. CI/CD 設定案の検討
