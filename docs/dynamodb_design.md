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
- Attributes: 
    - Email: ログインメールアドレス
    - Name: ユーザー名 (Gen Kaizu等)
    - UserRole: 権限 (PRO / AMATEUR / GENERAL)
    - ProfileImageKey: S3上のアイコン画像パス
    - Bio: 自己紹介文
    - Links(JSON): SNSやShopifyストアのURL
    - Preferences(JSON): 単位設定や公開設定
    - CreatedAt: アカウント作成日

[Coffee Bean Entity]
- PK: USER#<UserId>
- SK: BEAN#<BeanId>
- Attributes: 
    - Name: コーヒー豆の名前
    - Roaster: 焙煎所名
    - Origin: 生産国 (Ethiopia等)
    - Region: 地域 (Yirga Chefe等)
    - Elevation: 標高 (2200-2300m等)
    - Process: 精製方法 (Wash, Natural等)
    - RoastLevel: 焙煎度 (浅煎り〜深煎り)
    - PackageImageS3Key: S3に保存されたパッケージ画像パス
    - Price: 購入価格
    - ShopifyProductId: 紐づくShopifyの商品ID

[Cupping Log Entity]
- PK: USER#<UserId>
- SK: LOG#<LogId>
- Attributes: 
    - BeanId: 紐づく豆のID
    - TotalScore: 最終合計点 (0-100)
    - IsPublic: SNS等への公開フラグ
    - ImageS3Key: S3に保存された抽出/カッピング時の画像パス
    - CuppingData(JSON): 以下の詳細データ
        - sca_scores: 各評価項目 (Fragrance, Acidity, Balance等)
        - defects: 欠点数、強さ、自動計算された減点
        - sensory_review: 温かい時/冷めた時の感覚的メモと色の記録
        - flavor_tags: 選択されたフレーバータグの配列
        - notes: 全体の自由記述メモ


CuppingData(JSON) の詳細構造

SCA（Specialty Coffee Association）のプロトコルに基づき、以下の数値を保持します。

{
  "sca_scores": {
    "fragrance": 7.50,
    "aroma": 8.00,
    "flavor": 7.75,
    "aftertaste": 7.75,
    "acidity": 8.25,
    "body": 7.50,
    "balance": 7.75,
    "sweetness": 10.00,
    "clean_cup": 10.00,
    "uniformity": 10.00,
    "overall": 7.75
  },
  "defects": {
    "cups": 1,
    "intensity": 2,
    "deduction": 2.00
  },
  "sensory_review": {
    "hot": {
      "notes": "華やかなベリーの香り。酸が明るい",
      "color": "#FAD02E"
    },
    "cold": {
      "notes": "ナッツのような甘さが強まる",
      "color": "#D4AC0D"
    }
  },
  "flavor_tags": [
    "Berry",
    "Floral",
    "Nutty"
  ],
  "notes": "全体的にクリーンでバランスが良い。"
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