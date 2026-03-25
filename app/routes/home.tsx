import { data } from "react-router";
import type { Route } from "./+types/home";
import CuppingPrototype from "../components/CuppingPrototype";
import { saveCuppingLog, type CuppingLogBody } from "../lib/aws.server";

export async function action({ request }: Route.ActionArgs) {
  console.log(
    "[action] called — TABLE:", process.env.DYNAMODB_TABLE_NAME,
    "REGION:", process.env.AWS_REGION
  );

  let body: CuppingLogBody;
  try {
    body = await request.json();
  } catch {
    return data({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const logId = await saveCuppingLog(body);
    return data({ ok: true, logId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[action] save failed:", message);
    return data({ error: message }, { status: 500 });
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Coffee Cupping App - SCA Standard" },
    { name: "description", content: "元バリスタが設計する、プロ仕様のカッピング記録アプリ" },
  ];
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <CuppingPrototype />
    </main>
  );
}
