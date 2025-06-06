# paper_search_v2

このプロジェクトは Streamlit で動作する論文検索・可視化アプリです。まだ開発途中のため動作は安定していませんが、以下の手順で起動できます。

## 必要条件
- Python 3.10 以上
- [Ollama](https://github.com/ollama/ollama) がインストールされていること
- 使用したいモデルを事前に `ollama pull` で取得しておくこと。
  特に以下の2モデルは必須です。
  - `gemma3:12b(Q4_K_M ver)`[ollama:gemma3](https://ollama.com/library/gemma3:12b)
  - `gemma3:12b(Q3_K_M ver)`

  その他のモデルも `ollama pull モデル名` で追加取得できます。
  QAT 版が公開されていればそちらを利用するのも良いでしょう。  

## セットアップ
1. 依存パッケージをインストールします。
   ```bash
   pip install -r requirements.txt
   ```
2. 必要に応じて環境変数 `OLLAMA_MODEL` を設定します。
   未設定の場合は `gemma-textonly_v3:latest` が使用されます。 

   モデルの対応は以下です。（複雑ですまん、いつか整理する） 
   - 解説AI : gemma3:12b(Q4)  
   - 解析AI : gemma3:12b(Q3 テキストだけを抜き出したモデルなので、モデル名を`gemma-textonly_v3:latest`に変更してあります。)
3. 以下のコマンドでアプリを起動します。
   ```bash
   streamlit run app.py
   ```
4. ブラウザに表示される画面から検索を行ってください。
