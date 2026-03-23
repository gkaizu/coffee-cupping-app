import type { Route } from "./+types/home";
import CuppingPrototype from "../components/CuppingPrototype";

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