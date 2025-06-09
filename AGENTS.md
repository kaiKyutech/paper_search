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
│       │   └── page.tsx
│       ├── components
│       │   └── PaperSearchApp.tsx
│       ├── eslint.config.mjs
│       ├── next.config.ts
│       ├── postcss.config.mjs
│       └── public
│           ├── file.svg
│           ├── globe.svg
│           ├── next.svg
│           ├── vercel.svg
│           └── window.svg
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
