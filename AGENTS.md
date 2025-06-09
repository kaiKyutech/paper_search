# AGENTS

## プロジェクト構成

```
paper_search/
├── AGENTS.md
├── README.md
├── docker-compose.yml
├── project_export.md
├── react_app
│   ├── backend
│   │   ├── Dockerfile
│   │   ├── README.md
│   │   ├── main.py
│   │   └── requirements.txt
│   └── frontend
│       ├── Dockerfile
│       ├── README.md
│       ├── next.config.ts
│       ├── package.json
│       ├── app
│       │   ├── favicon.ico
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   └── page.tsx
│       └── public
│           ├── file.svg
│           ├── globe.svg
│           ├── next.svg
│           ├── vercel.svg
│           └── window.svg
└── streamlit_app
    ├── Dockerfile
    ├── README.md
    ├── api
    │   ├── lm_studio_api.py
    │   ├── ollama_api.py
    │   └── paper_api.py
    ├── app.py
    ├── core
    │   ├── data_models.py
    │   ├── llm_service.py
    │   └── paper_service.py
    ├── requirements.txt
    ├── state
    │   ├── state_manager.py
    │   └── state_manager_back.py
    ├── ui
    │   ├── chat_panel.py
    │   ├── paper_network.py
    │   ├── result_summary.py
    │   └── search_bar.py
    └── utils
        ├── config.py
        ├── cytoscape_utils.py
        ├── field_colors.py
        ├── llm_controller.py
        └── paper_controller.py
└── tools
    ├── pulling_files.py
    └── project_tree.py
```

新しいファイルやディレクトリを追加・削除した場合は、上記のツリーを必ず最新の状態に更新してください。`tools/pulling_files.py` を実行すると `project_export.md` に現在の構成が出力されるので参考にするとよいでしょう。

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
