# React フロントエンド

このディレクトリは Next.js を利用したフロントエンドのソースを配置します。初期化には `create-next-app` を使用しました。

## 初期化手順（参考）
空のディレクトリを用意し、次のコマンドでプロジェクトを作成します。

```bash
npx create-next-app@latest . --ts --use-npm
```

Tailwind CSS も使う場合は `--tailwind` オプションを付けてください。

## Docker での開発方法
依存ライブラリはすべて Docker コンテナ内で管理します。ホスト PC で `npm install` を実行する必要はありません。

1. リポジトリ直下で `docker-compose up frontend backend` を実行します。
   初回は `--build` を付けることでコンテナ内で `npm install` が行われます。
2. ブラウザで `http://localhost:3000` を開くと Next.js が起動していることを確認できます。
3. ソースコードを編集するとホットリロードで即座に反映されます。

### 注意点
- `react_app/frontend` ディレクトリがコンテナの `/app` にマウントされています。
  `node_modules` は `/app/node_modules` として匿名ボリュームに置かれるため、ホスト側には作成されません。
- ライブラリを追加したい場合は `package.json` を更新してから `docker-compose build frontend` を実行してください。
- ホスト PC に Node.js 環境を構築する必要はなく、すべて Docker 内で作業します。
