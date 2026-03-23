DynamoDB Single Table Design

本プロジェクトでは、スケーラビリティとクエリ効率を最大化するため、NoSQLの設計手法である Single Table Design を採用しています。

1. Table Schema

Table Name: CoffeeCuppingTable

Partition Key (PK): PK (String)

Sort Key (SK): SK (String)

2. データ構造とアクセスパターン

設計の詳細は以下の通りです。

[User Entity]
- PK: USER#<UserId>
- SK: #METADATA#<UserId>
- Attributes: Email, Name, CreatedAt

[Coffee Bean Entity]
- PK: USER#<UserId>
- SK: BEAN#<BeanId>
- Attributes: Name, Roaster, Origin, Process

[Cupping Log Entity]
- PK: USER#<UserId>
- SK: LOG#<LogId>
- Attributes: 
    - BeanId: 紐づく豆のID
    - TotalScore: 最終合計点 (0-100)
    - ImageS3Key: S3に保存された画像パス
    - CuppingData(JSON): SCA基準の各評価項目 (以下詳細)


CuppingData(JSON) の詳細構造

SCA（Specialty Coffee Association）のプロトコルに基づき、以下の数値を保持します。

{
  "scores": {
    "fragrance_aroma": 7.50,
    "flavor": 8.00,
    "aftertaste": 7.75,
    "acidity": 8.25,
    "body": 7.50,
    "balance": 7.75,
    "uniformity": 10.00,
    "clean_cup": 10.00,
    "sweetness": 10.00,
    "overall": 7.75
  },
  "defects": {
    "cups": 0,
    "intensity": 0,
    "deduction": 0
  },
  "notes": "ベリー系の明るい酸味。冷めてからも甘さが持続する。"
}


3. 主要なクエリ

ユーザーの全豆リスト取得:
PK=USER#<UserId> かつ SK begins_with BEAN#

特定の豆に紐づく過去のカッピング履歴:
GSI1 を活用し、GSI1PK=BEAN#<BeanId>, GSI1SK=LOG# で検索。

4. Single Table Design 採用の理由

コスト効率: 1つのテーブルに集約することで、読み書きのキャパシティ（WCU/RCU）を効率的に管理。

結合の回避: 1回のクエリで関連データを取得可能にし、パフォーマンスを最適化。

実戦的スキル: 大規模なSaaSやShopifyアプリ等で採用される高度な設計手法を適用。