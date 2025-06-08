# AGENTS

## プロジェクト構成

```
paper_search/
├── AGENTS.md
├── README.md
├── docker-compose.yml
├── pulling_files.py
├── project_export.md
├── react_app
│   ├── backend
│   │   ├── Dockerfile
│   │   ├── README.md
│   │   ├── main.py
│   │   └── requirements.txt
│   ├── frontend
│   │   ├── Dockerfile
│   │   ├── README.md
│   │   ├── next-env.d.ts
│   │   ├── next.config.js
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── pages
│   │       └── index.tsx
│   └── temp
│       └── .gitkeep
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
    ├── temp
    │   └── .gitkeep
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
```

新しいファイルやディレクトリを追加・削除した場合は、上記のツリーを必ず最新の状態に更新してください。`pulling_files.py` を実行すると `project_export.md` に現在の構成が出力されるので参考にするとよいでしょう。

各プロジェクトの `temp` ディレクトリには、参考用コードを配置します。編集作業を行う際は **まず各 temp フォルダを確認し、該当するコードがあれば参考にしてください。**

## 開発規約
- 使用言語は **Python** とする
- コードスタイルは PEP8 を基準とする
  - インデントは4スペース
  - 行長の目安は100文字
  - クラス名は `PascalCase`
  - 変数名・関数名は `snake_case`
- コメントおよび docstring は日本語で記述する
- Pull Request の本文も日本語で作成する

## テスト
- テストコードが存在する場合は `pytest` を実行すること
- テストが無い場合は `pytest` 実行結果が `no tests ran` であっても問題ない
