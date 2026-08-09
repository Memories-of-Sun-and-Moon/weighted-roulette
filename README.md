# Weighted Roulette

![icon](./app/favicon.ico)

重み付きのルーレットです。

CSV 形式のテキスト或いは CSV ファイルから候補を読み取り、重み変換式を適用したうえで抽選できます。

GitHub Pages にて [公開](https://mm-rz.github.io/weighted-roulette/) しています。

## デモ画像

![demo](./figure/ss.png)

## 使える式

- ``+``
- ``-``
- ``*``
- ``min()``
- ``max()``

### 詳細(BNF記法)

```
expression := add
add        := mul (('+' | '-') mul)*
mul        := unary ('*' unary)*
unary      := '-' unary | primary
primary    := number | x | func | '(' expression ')'
func       := max '(' expression ',' expression ')'
           | min '(' expression ',' expression ')'
```

## 変換式例

- ``x`` (デフォルト)
- ``max(0, 100-x*0.2)``

# 使用技術

![skillicons](https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,nodejs)

# 導入方法


## Docker 開発環境

### ファイル構成
- `Dockerfile` - アプリをビルドして本番イメージを作成します
- `docker-compose.yml` - 開発用にローカルソースをマウントし、コンテナ内で `pnpm dev` を実行します

### Docker を使った起動

```bash
docker compose up --build
```

その後、ブラウザで `http://localhost:3000` にアクセスします。

### Docker 内で pnpm を使う

```bash
docker compose exec app pnpm --version
```

シェルを開いて作業する場合は:

```bash
docker compose exec app sh
```

### node_modules ボリュームのトラブルシュート

もし `next: not found` などが発生する場合は、古いボリュームが空のまま残っている可能性があります。以下で削除して再作成してください。

```bash
docker compose down -v
docker compose up --build
```

### Docker コンテナ停止

```bash
docker compose down
```

### Docker 本番ビルド

```bash
docker build -t weighted-roulette .
```

### 開発時の注意

- `docker-compose.yml` はソースをホストからコンテナへバインドマウントします。
- `node_modules` はコンテナ内に保持するため、ホスト環境を汚しません。
- コンテナ上でホットリロードが有効な `pnpm dev --host 0.0.0.0` を使っています。
