import { data } from "react-router";
import { getPresignedUploadUrl } from "../lib/aws.server";

export async function action({ request }: { request: Request }) {
  console.log(
    "[presigned-url] called — BUCKET:", process.env.S3_BUCKET_NAME,
    "REGION:", process.env.AWS_REGION
  );

  let body: { fileName: string; contentType: string };
  try {
    body = await request.json();
  } catch {
    return data({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { fileName, contentType } = body;
  if (!fileName || !contentType) {
    return data({ error: "fileName and contentType are required" }, { status: 400 });
  }

  try {
    const { uploadUrl, key } = await getPresignedUploadUrl(fileName, contentType);
    return data({ uploadUrl, key });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[presigned-url] failed:", message);
    return data({ error: message }, { status: 500 });
  }
}
