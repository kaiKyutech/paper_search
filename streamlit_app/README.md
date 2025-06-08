# Streamlit アプリ

Streamlit を用いた論文検索・可視化アプリです。別途起動している Ollama API と連携して動作します。

## 実行方法
```bash
pip install -r requirements.txt
streamlit run app.py
```

Ollama API への接続先は実行環境から自動で判定されます。
Docker コンテナ内では `http://host.docker.internal:11435`、
ローカル実行時は `http://127.0.0.1:11435` が既定値です。
別のエンドポイントを利用したい場合のみ
環境変数 `OLLAMA_API_BASE_URL` を設定してください。

参考用コードはtempディレクトリに配置します。編集時はここを確認してください。
