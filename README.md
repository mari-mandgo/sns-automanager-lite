# SNS AutoManager Lite

Codexで作ったSNS投稿を、外出先から確認・コピー・下書き作成するための軽量アプリです。

## GitHubに入れるもの

- アプリコード
- UI
- Vercel設定

## GitHubに入れないもの

- 投稿本文の実データ
- 投稿URL
- 表示数、いいね数などのログ
- アカウント情報
- APIキー

## 現在の保存方式

ブラウザの localStorage と Google Sheets を併用します。
`Sheets読込` / `Sheets保存` で投稿案とログを同期します。

## 安全方針

- 自動で投稿ボタンは押しません。
- X投稿は、教育AIアカウントだけAPI投稿できます。
- X投稿時は確認ダイアログを出します。
- X投稿APIは `SNS_POST_SECRET` の入力が必要です。
- Threadsは本文コピーとThreads画面を開くところまで。

## X API環境変数

Vercelの Environment Variables に以下を登録します。

```text
X_API_KEY
X_API_KEY_SECRET
X_ACCESS_TOKEN
X_ACCESS_TOKEN_SECRET
SNS_POST_SECRET
```

`SNS_POST_SECRET` は自分で決める投稿キーです。アプリで `X投稿` を押した時に、同じ値を入力します。

`X_Client_ID` / `X_Client_Secret` はOAuth2用です。現在の投稿API実装では使用していません。
