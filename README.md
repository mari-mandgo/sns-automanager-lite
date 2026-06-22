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

初期版はブラウザの localStorage に保存します。
PCとスマホでリアルタイム同期するには、次の段階で Supabase / Vercel Postgres / Google Sheets などの保存先を追加します。

## 安全方針

- 自動で投稿ボタンは押しません。
- Xは下書き画面を開くところまで。
- Threadsは本文コピーとThreads画面を開くところまで。
