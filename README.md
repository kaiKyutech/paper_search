# paper_search_v2

このプロジェクトは Streamlit で動作する論文検索・可視化アプリです。まだ開発途中のため動作は安定していませんが、以下の手順で起動できます。

## 必要条件
- Python 3.10 以上
- [Ollama](https://github.com/ollama/ollama) がインストールされていること
- 使用したいモデルを事前に `ollama pull` で取得しておくこと（例: `gemma:2b`, `mistral`, `llama2` など）

## セットアップ
1. 依存パッケージをインストールします。
   ```bash
   pip install -r requirements.txt
   ```
2. 必要に応じて環境変数 `OLLAMA_MODEL` を設定します。
3. 以下のコマンドでアプリを起動します。
   ```bash
   streamlit run app.py
   ```
4. ブラウザに表示される画面から検索を行ってください。
