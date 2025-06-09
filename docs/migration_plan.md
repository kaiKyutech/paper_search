# 機能・ロジック整理メモ

現在の Streamlit 版アプリで実装されている主な機能やロジックを洗い出し、FastAPI へ移行すべきポイントをまとめます。


## Streamlit 側で実装されている機能

### API モジュール (`streamlit_app/api`)
- **paper_api.py**
  - Semantic Scholar API を呼び出し、タイトルやアブストラクトを取得する。
  - 再試行処理を含み、検索結果をリストで返す。
- **ollama_api.py**
  - Ollama の `/api/generate` および `/api/chat` を利用して構造化レスポンスを取得する。
  - `get_structured_response_v2` では JSON Schema 検証まで行う。
- **lm_studio_api.py**
  - LM Studio との通信を担当。`get_structured_response`、`stream_chat_response` などを提供。

### サービス層 (`streamlit_app/core`)
- **paper_service.py**
  - `fetch_papers_by_query` で `paper_api` を呼び出し、`PaperResult` 型へ整形。
- **llm_service.py**
  - ユーザー文書や検索結果に対する分析処理を提供。
  - Ollama または LM Studio を選択して利用可能。

これらの処理は内部でデータモデル(`data_models.py`)を用いて結果を保持している。

## FastAPI への切り出し候補
1. **論文検索 API**
   - `paper_service.fetch_papers_by_query` をエンドポイント化する。
   - クエリ文字列、年範囲、件数を受け取り `PaperResult` を JSON で返す。
2. **LLM 分析 API**
   - `llm_service.analyze_user_paper` などの分析系関数をまとめて POST エンドポイント化。
   - モデル選択やプロンプト入力を受け、分析結果(`PaperAnalysisResult`)を返す。
3. **状態管理**
   - Streamlit で `state_manager` が担っている状態更新は、フロントエンド側(React)で管理し、FastAPI は純粋なデータ提供に徹する。

## 移行作業の進め方
1. 上記 API を FastAPI `react_app/backend` 内で実装する。
2. 既存の Streamlit モジュールを参照しつつ、ロジックを共通化できる箇所はモジュールとして切り出す。
3. 移行が完了した機能から React フロントエンドで呼び出すように修正する。

