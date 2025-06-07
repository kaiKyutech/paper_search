# paper_search

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

### Docker を利用する場合（推奨）
1. リポジトリ直下で以下を実行し、必要なサービスを起動します。
   ```bash
   # すべてのサービスを起動する例
   docker-compose up
   ```
   それぞれ個別に起動したい場合はサービス名を指定してください。
   - Streamlit アプリのみ: `docker-compose up streamlit`
   - React フロントエンド + FastAPI バックエンド: `docker-compose up frontend backend`

2. 停止する際は `Ctrl+C` で終了後に `docker-compose down` を実行します。

### Docker を使わない場合（参考）
1. Python 3.10 以上の環境を用意し、依存パッケージをインストールします。
   ```bash
   pip install -r streamlit_app/requirements.txt
   ```
   `streamlit_app/requirements.txt` は Docker 用に最小限の依存のみを列挙
   しています。`pip install` で不足がある場合は適宜追加してください。
2. 必要に応じて環境変数 `OLLAMA_MODEL` を設定します。未設定の場合は
   `gemma-textonly_v3:latest` が使用されます。
3. Ollama API の接続先を変更したい場合は環境変数 `OLLAMA_API_BASE_URL`
   を設定します。Docker 実行時は `http://host.docker.internal:11435` が
   自動で使用され、ネイティブ環境では `http://127.0.0.1:11435` が
   既定値となります。
4. 以下のコマンドでアプリを起動します。
   ```bash
   streamlit run streamlit_app/app.py
   ```

### Ollama API 接続先の変更例
`.env` ファイルに以下のように記述すると、API エンドポイントを簡単に切り替えられます。

```env
OLLAMA_API_BASE_URL=http://host.docker.internal:11435
```

Docker 起動時は上記の値が自動で設定されています。ネイティブ環境で起動する場合は
`http://127.0.0.1:11435` など実際の Ollama のホストを指定してください。

## 今後追加したい機能とそれに対する展望
- 既に解析した論文を保存しておく機能。
- 使用するモデルを動的に変更できる機能。これは解析AIと解説AIは別として登録できるようにすること。デフォルトまで指定できるといい。
- React などに環境移行し、UI を見やすくする。

## 新構成
React フロントエンドと FastAPI バックエンドの開発を開始しました。
既存の Streamlit アプリは `streamlit_app` ディレクトリで従来通り動作します。
新しいディレクトリ構成は以下の通りです。

- `streamlit_app/` Streamlit 版アプリケーション
- `react_app/frontend/` React アプリケーション
- `react_app/backend/` FastAPI アプリケーション


## Docker Compose での起動方法
Docker 環境が利用できる場合は、`docker-compose` で各アプリケーションを簡単に起動できます。

### Streamlit アプリのみ起動
```bash
docker-compose up streamlit
```

### React フロントエンド + FastAPI バックエンドを起動
```bash
docker-compose up frontend backend
```

### すべてのサービスを起動
```bash
docker-compose up
```

停止する場合は `Ctrl+C` で終了後、`docker-compose down` を実行してください。
