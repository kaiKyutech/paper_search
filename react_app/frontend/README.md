# React フロントエンド

このディレクトリには Next.js 製フロントエンドのソースを配置しています。初期化は `create-next-app` で行いました。

## 初期化手順（参考）
以下のコマンドで新規プロジェクトを生成します。

```bash
npx create-next-app@latest . --ts --use-npm --tailwind
```

## Docker 関連ファイル
`Dockerfile` と `docker-compose.yml` を用いて開発環境を構築します。例としてそれぞれの主要部分を示します。

### Dockerfile
```Dockerfile
FROM node:18
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . /app
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

### docker-compose.yml の frontend サービス
```yaml
frontend:
  build:
    context: ./react_app/frontend
  ports:
    - "3000:3000"
  container_name: react_frontend
  depends_on:
    - backend
  volumes:
    - ./react_app/frontend:/app
    - /app/node_modules
```
`/app/node_modules` を匿名ボリュームとして確保することで、ホスト側に `node_modules` フォルダが作成されないようにしています。

## Docker での開発方法
依存ライブラリはすべてコンテナ内で管理します。ホスト PC で `npm install` を実行する必要はありません。

1. コンテナを起動します。
   ```bash
   docker-compose up frontend backend
   ```
   `package.json` を変更した際などは `--build` を付けて再起動してください。
2. `http://localhost:3000` へアクセスするとアプリが確認できます。
3. ソースコードを変更するとホットリロードですぐに反映されます。

### ライブラリ追加手順
1. コンテナに入ります。
   ```bash
   docker-compose exec frontend sh
   ```
2. コンテナ内で `npm install <パッケージ名>` を実行します。
3. 作業後は `exit` し、`docker-compose build frontend` でイメージを更新します。

ボリューム指定によりホスト側でファイルを編集すると即座にコンテナに反映されます。`node_modules` は上書きされないため、常にコンテナ内で一貫して管理できます。
