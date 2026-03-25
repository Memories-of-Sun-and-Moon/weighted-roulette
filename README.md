# Weighted Roulette

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

## 環境

```bash
npm install -g pnpm
```

## インストール

```bash
pnpm install
```

## 開発用サーバー起動 

```bash
pnpm dev
```

``http://localhost:3000``

## ビルド

```bash
pnpm build
pnpm start
```
