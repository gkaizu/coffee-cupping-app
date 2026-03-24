# ==========================================
# AWS Provider & Backend
# ==========================================
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1" # 東京リージョン
  
  default_tags {
    tags = {
      Project   = "CoffeeCuppingApp"
      ManagedBy = "Terraform"
      Owner     = "Gkaizu"
    }
  }
}

# ==========================================
# DynamoDB (Single Table Design)
# ==========================================
resource "aws_dynamodb_table" "cupping_table" {
  name           = "CoffeeCuppingTable"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "PK"
  range_key      = "SK"

  attribute {
    name = "PK"
    type = "S"
  }
  attribute {
    name = "SK"
    type = "S"
  }
  attribute {
    name = "GSI1PK"
    type = "S"
  }
  attribute {
    name = "GSI1SK"
    type = "S"
  }
  attribute {
    name = "GSI2PK"
    type = "S"
  }
  attribute {
    name = "GSI2SK"
    type = "S"
  }

  # GSI1: 豆(Bean)から過去のカッピング記録(Log)を検索するためのインデックス
  global_secondary_index {
    name               = "GSI1"
    hash_key           = "GSI1PK"
    range_key          = "GSI1SK"
    projection_type    = "ALL"
  }

  # GSI2: ユーザーの検索やプロフィールの取得用
  global_secondary_index {
    name               = "GSI2"
    hash_key           = "GSI2PK"
    range_key          = "GSI2SK"
    projection_type    = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }
}

# ==========================================
# S3 Bucket (Image Storage)
# ==========================================
resource "aws_s3_bucket" "image_storage" {
  # 世界で一意の名前にするためにランダムIDを付与
  bucket = "coffee-cupping-app-images-${random_id.bucket_id.hex}"
}

resource "random_id" "bucket_id" {
  byte_length = 4
}

# セキュリティ設定: パブリックアクセスの遮断
resource "aws_s3_bucket_public_access_block" "image_storage" {
  bucket = aws_s3_bucket.image_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CORS設定: ブラウザから署名付きURLによるPUT/POSTを許可
resource "aws_s3_bucket_cors_configuration" "image_storage" {
  bucket = aws_s3_bucket.image_storage.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET"]
    allowed_origins = ["*"] # 開発フェーズのためすべて許可
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# ==========================================
# Amazon Cognito (Auth)
# ==========================================
resource "aws_cognito_user_pool" "pool" {
  name = "coffee-cupping-user-pool"

  auto_verified_attributes = ["email"]
  username_attributes     = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Your Verification Code for Coffee Cupping App"
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name         = "coffee-cupping-client"
  user_pool_id = aws_cognito_user_pool.pool.id

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
}

# ==========================================
# IAM Policy (For App Runner / Backend Integration)
# ==========================================
resource "aws_iam_policy" "app_policy" {
  name        = "CoffeeCuppingAppPolicy"
  description = "IAM Policy for Coffee Cupping App to access DynamoDB and S3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Effect   = "Allow"
        Resource = [
          aws_dynamodb_table.cupping_table.arn,
          "${aws_dynamodb_table.cupping_table.arn}/index/*"
        ]
      },
      {
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Effect   = "Allow"
        Resource = [
          aws_s3_bucket.image_storage.arn,
          "${aws_s3_bucket.image_storage.arn}/*"
        ]
      }
    ]
  })
}

# ==========================================
# Outputs (for .env configuration)
# ==========================================
output "dynamodb_table_name" {
  value = aws_dynamodb_table.cupping_table.name
}

output "s3_bucket_name" {
  value = aws_s3_bucket.image_storage.id
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.pool.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.client.id
}