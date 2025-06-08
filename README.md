# paper_search

このプロジェクトは論文検索・可視化を目的としたアプリケーション群です。
フロントエンドは **Next.js(React+TypeScript) + Material-UI**、バックエンドは **FastAPI**、補助ツールとして **Streamlit** を利用しています。
## 必要条件
- Python 3.10 以上
- [Ollama](https://github.com/ollama/ollama) がインストールされていること
- 使用したいモデルを事前に `ollama pull` で取得しておくこと。
  特に以下の2モデルは必須です。
  - `gemma3:12b(Q4_K_M ver)`[ollama:gemma3](https://ollama.com/library/gemma3:12b)
  - `gemma3:12b(Q3_K_M ver)`

  その他のモデルも `ollama pull モデル名` で追加取得できます。
  QAT 版が公開されていればそちらを利用するのも良いでしょう。

- Ollama は Docker コンテナとは別にホスト環境（例: WSL）で起動しておく必要があります。
  Docker からは `http://host.docker.internal:11435` 経由でアクセスします。

## セットアップ

### Docker を利用する場合（推奨）
1. リポジトリ直下で以下を実行し、必要なサービスを起動します。
   ```bash
   # すべてのサービスを起動する例
   docker-compose up --build
   ```
   それぞれ個別に起動したい場合はサービス名を指定してください。
   - Streamlit アプリのみ: `docker-compose up streamlit`
   - Next.js フロントエンド + FastAPI バックエンド: `docker-compose up frontend backend`
  (Next.js は http://localhost:3000 で起動します)

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
3. Ollama API の接続先は実行環境から自動で判定されます。
   Docker コンテナ内では `http://host.docker.internal:11435`、
   ネイティブ環境では `http://127.0.0.1:11435` が既定値となるため、
   環境変数 `OLLAMA_API_BASE_URL` を設定する必要はありません。
   別のエンドポイントを利用したい場合のみこの環境変数を指定してください。
4. 以下のコマンドでアプリを起動します。
   ```bash
   streamlit run streamlit_app/app.py
   ```

### Ollama API 接続先を手動で変更したい場合
通常は自動判定されますが、`.env` ファイルに以下のように記述することで
任意のエンドポイントを指定できます。

```env
OLLAMA_API_BASE_URL=http://host.docker.internal:11435
```

値を指定しない場合は、Docker 実行時は `http://host.docker.internal:11435`、
ネイティブ環境では `http://127.0.0.1:11435` が自動で使用されます。

## 今後追加したい機能とそれに対する展望
- 既に解析した論文を保存しておく機能。
- 使用するモデルを動的に変更できる機能。これは解析AIと解説AIは別として登録できるようにすること。デフォルトまで指定できるといい。
- Next.js などへの移行で UI を改善する。

## 新構成
Next.js フロントエンドと FastAPI バックエンドの開発を開始しました。
既存の Streamlit アプリは `streamlit_app` ディレクトリで従来通り動作します。
新しいディレクトリ構成は以下の通りです。

- `streamlit_app/` Streamlit 版アプリケーション
- `react_app/frontend/` Next.js アプリケーション
- `react_app/backend/` FastAPI アプリケーション


- 各プロジェクトにはサンプルコードを格納する `temp/` ディレクトリがあります。編集前に内容を確認してください。
## Docker Compose での起動方法
Docker 環境が利用できる場合は、`docker-compose` で各アプリケーションを簡単に起動できます。

### Streamlit アプリのみ起動
```bash
docker-compose up streamlit
```

### Next.js フロントエンド + FastAPI バックエンドを起動
```bash
docker-compose up frontend backend
```
Next.js は http://localhost:3000 で起動します。
`frontend` サービスでは `/app/node_modules` を名前付きボリュームにマウントして
います。これによりビルド時にインストールされた `next` コマンドがホスト側の
ボリュームで上書きされず、開発時にエラーが発生しません。

### すべてのサービスを起動
```bash
docker-compose up
```

停止する場合は `Ctrl+C` で終了後、`docker-compose down` を実行してください。
