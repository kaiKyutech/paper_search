# Streamlit アプリ

Streamlit を用いた論文検索・可視化アプリです。別途起動している Ollama API と連携して動作します。

## 実行方法
```bash
pip install -r requirements.txt
streamlit run app.py
```

Ollama API のエンドポイントは環境変数 `OLLAMA_API_BASE_URL` で指定できます。Docker で実行する場合は `http://host.docker.internal:11435` が自動で設定され、ローカル実行時は `http://127.0.0.1:11435` が既定値となります。
