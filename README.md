Coffee Cupping App (MVP)

元バリスタが設計する、SCA方式準拠のプロ仕様カッピング記録アプリ

本プロジェクトは、現場の課題を深く理解する「ドメイン知識」と、インフラからフロントエンドまで一気通貫で設計・構築できる「自走力」を形にしたフルスタック・アプリケーションです。
実戦的な技術選定と、スケーラビリティを考慮したアーキテクチャの構築をテーマに開発しています。

☕️ 背景と目的

プロのバリスタやロースターが使用する「カッピング（品質評価）」のプロセスは、未だに紙ベースや直感的でないツールで行われることが多いのが現状です。
元バリスタとしての経験を活かし、**「SCA（Specialty Coffee Association）基準」**に完全準拠した、直感的で堅牢なデジタル・カッピングシートを実現します。

🛠 技術スタック

「堅牢性」「スケーラビリティ」「開発体験」を重視した選定です。

Frontend / Backend (Full-stack)

React Router v7 (TypeScript): Remixの機能が統合された最新のフルスタック・フレームワーク。Web標準に準拠した設計を評価。

Tailwind CSS: 現場での操作性を最優先したモバイルファーストなUI。

Infrastructure (AWS - IaC)

Terraform: インフラをコードで管理（IaC）し、再現性と透明性を担保。

AWS App Runner: コンテナベースのデプロイにより、管理コストを抑えつつスケーラビリティを確保。

Amazon DynamoDB: Single Table Designを採用し、ミリ秒単位のレスポンスと高いコストパフォーマンスを実現。

Amazon S3: 署名付きURL（Presigned URL）を利用したセキュアな画像アップロードフロー。

🏗 アーキテクチャ

AWS SAA（ソリューションアーキテクト - アソシエイト）の設計原則に基づき、セキュリティ、信頼性、運用効率を考慮したアーキテクチャを構築しています。

graph TD
    User[ユーザー] --> CloudFront[CloudFront]
    CloudFront --> AppRunner[App Runner / React Router App]
    AppRunner --> DynamoDB[(DynamoDB)]
    AppRunner --> S3[S3 - Image Storage]
    AppRunner --> Cognito[Cognito - Auth]


🚀 主要機能（実装予定含む）

[ ] SCA準拠スコアリング: 0.25刻みの+/-ボタンによる、片手で操作可能なUI。

[ ] 欠点豆の自動計算: 数値を入力するだけで合計スコアをリアルタイム計算。

[ ] S3署名付きURLアップロード: ブラウザからS3への直接アップロードによるサーバー負荷の軽減。

[ ] ダイナミック・フレーバータグ: 直感的なタグ選択によるフレーバー記述。

🧠 技術選定の理由 (Why)

なぜ DynamoDB Single Table Design なのか？

将来的なデータ量の増加と検索速度の安定を両立させるため、リレーショナルDBではなくNoSQLの高度な設計手法を採用しました。これは、大規模なデータトラフィックを扱うSaaS開発や、Shopify App等の拡張性を考慮した選択です。

なぜ React Router v7なのか？

Shopify Hydrogen の基盤である Remix が React Router v7 へと統合されたことを受け、最新の標準仕様を採用しました。Web標準を最大限に活用し、サーバーサイドでのデータ処理を効率化できる点を重視しています。