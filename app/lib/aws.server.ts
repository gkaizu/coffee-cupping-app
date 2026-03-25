import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = process.env.AWS_REGION ?? "ap-northeast-1";
const TABLE  = process.env.DYNAMODB_TABLE_NAME!;
const BUCKET = process.env.S3_BUCKET_NAME!;
const MAX_RETRIES = 3;
const PRESIGNED_URL_TTL = 300; // 5分

// ---- クライアント初期化 ----
const dynamoClient = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(dynamoClient);
const s3  = new S3Client({ region: REGION });

// ---- 型定義 ----
export type CuppingLogBody = {
  scores:       Record<string, number>;
  intensities:  Record<string, number>;
  checks:       Record<string, boolean[]>;
  defects:      { cups: number; type: number };
  selectedTags: string[];
  totalScore:   number;
  notes:        string;
  imageS3Key?:  string;
};

// ---- DynamoDB 保存（リトライ付き） ----
async function putItemWithRetry(
  item: Record<string, unknown>,
  attempt = 0
): Promise<void> {
  try {
    await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  } catch (err) {
    if (attempt < MAX_RETRIES - 1) {
      await new Promise((r) => setTimeout(r, 200 * Math.pow(2, attempt)));
      return putItemWithRetry(item, attempt + 1);
    }
    throw err;
  }
}

/**
 * カッピングログを DynamoDB に保存し、生成した logId を返す。
 */
export async function saveCuppingLog(body: CuppingLogBody): Promise<string> {
  const logId  = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const userId = "anonymous"; // 認証実装後に差し替え
  const beanId = "unknown";   // Bean選択機能実装後に差し替え

  const item = {
    PK:        `USER#${userId}`,
    SK:        `LOG#${logId}`,
    BeanId:    beanId,
    TotalScore: body.totalScore,
    IsPublic:  false,
    CreatedAt: new Date().toISOString(),
    ...(body.imageS3Key ? { ImageS3Key: body.imageS3Key } : {}),
    GSI1PK: `BEAN#${beanId}`,
    GSI1SK: `LOG#${logId}`,
    CuppingData: {
      sca_scores:  body.scores,
      intensities: body.intensities,
      defects: {
        cups:      body.defects.cups,
        intensity: body.defects.type,
        deduction: body.defects.cups * body.defects.type,
      },
      flavor_tags: body.selectedTags,
      notes:       body.notes,
    },
  };

  await putItemWithRetry(item);
  return logId;
}

/**
 * S3 アップロード用の署名付き URL を発行する。
 */
export async function getPresignedUploadUrl(
  fileName:    string,
  contentType: string
): Promise<{ uploadUrl: string; key: string }> {
  const key = `cupping-images/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: PRESIGNED_URL_TTL });
  return { uploadUrl, key };
}
