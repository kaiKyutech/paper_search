# AGENTS

## プロジェクト構成

```
paper_search/
├── AGENTS.md
├── README.md
├── docker-compose.yml
├── docs
│   └── migration_plan.md
├── react_app
│   ├── backend
│   │   ├── Dockerfile
│   │   ├── README.md
│   │   ├── main.py
│   │   └── requirements.txt
│   └── frontend
│       ├── Dockerfile
│       ├── README.md
│       ├── app
│       │   ├── favicon.ico
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── results
│       │       └── page.tsx
│       ├── components
│       │   ├── ResultsPage.tsx
│       │   └── SearchPage.tsx
│       ├── eslint.config.mjs
│       ├── lib
│       │   └── api.ts
│       ├── next.config.ts
│       ├── postcss.config.mjs
│       ├── public
│       │   ├── file.svg
│       │   ├── globe.svg
│       │   ├── next.svg
│       │   ├── vercel.svg
│       │   └── window.svg
│       ├── package.json
│       ├── package-lock.json
│       └── tsconfig.json
├── streamlit_app
│   ├── Dockerfile
│   ├── README.md
│   ├── __init__.py
│   ├── api
│   │   ├── __init__.py
│   │   ├── lm_studio_api.py
│   │   ├── ollama_api.py
│   │   └── paper_api.py
│   ├── app.py
│   ├── core
│   │   ├── __init__.py
│   │   ├── data_models.py
│   │   ├── llm_service.py
│   │   └── paper_service.py
│   ├── requirements.txt
│   ├── state
│   │   ├── __init__.py
│   │   ├── state_manager.py
│   │   └── state_manager_back.py
│   ├── ui
│   │   ├── __init__.py
│   │   ├── chat_panel.py
│   │   ├── paper_network.py
│   │   ├── result_summary.py
│   │   └── search_bar.py
│   └── utils
│       ├── __init__.py
│       ├── config.py
│       ├── cytoscape_utils.py
│       ├── field_colors.py
│       ├── llm_controller.py
│       └── paper_controller.py
├── temp
│   └── paper-search-ui.tsx
└── tools
    ├── project_tree.py
    └── pulling_files.py
```
新しいファイルやディレクトリを追加・削除した場合は、上記のツリーを必ず最新の状態に更新してください。構成の確認には `python tools/project_tree.py` を利用するとディレクトリ構成のみを簡潔に表示できます。詳細な一覧が必要な場合は `python tools/pulling_files.py` を実行してください。いずれのスクリプトも `.gitignore` と `.dockerignore` を参照して不要なファイルを除外します。

## 開発規約
- 使用言語は **Python** とする
- コードスタイルは PEP8 を基準とする
  - インデントは4スペース
  - 行長の目安は100文字
  - クラス名は `PascalCase`
  - 変数名・関数名は `snake_case`
- コメントおよび docstring は日本語で記述する
- Pull Request の本文も日本語で作成する
- tempフォルダには参考にしてほしいファイルが入っていることがあります。指示があれば確認をしてください。

## テスト
- テストコードが存在する場合は `pytest` を実行すること
- テストが無い場合は `pytest` 実行結果が `no tests ran` であっても問題ない

## React フロントエンド開発フロー
- Next.js プロジェクトは `npx create-next-app` で作成する。
- `docker-compose.yml` と `frontend/Dockerfile` を利用し、依存ライブラリはコンテナ内で管理する。
- `docker-compose up frontend backend` で開発用コンテナを起動し、ホットリロードで動作確認を行う。
- ライブラリを追加するときは `docker-compose exec frontend sh` でコンテナに入り、`npm install` を実行する。
- 追加後は `docker-compose build frontend` を実行してイメージを更新する。
- `node_modules` は匿名ボリューム `/app/node_modules` に置くことでホスト側に作成しない。
- コードを保存すると即座に画面に反映されるよう `volumes` を設定する。
