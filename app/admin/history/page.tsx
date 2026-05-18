import type { Metadata } from "next";
import Link from "next/link";
import { AdminHistory } from "@/components/AdminHistory";

export const metadata: Metadata = {
  title: "編集履歴",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminHistoryPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-8">
      <header className="mb-5 border-b border-line pb-4">
        <Link href="/admin" className="mb-3 inline-block text-sm font-black text-muted transition hover:text-ink">
          管理ページへ戻る
        </Link>
        <p className="mb-2 text-sm text-muted">管理ページ</p>
        <h1 className="text-3xl font-medium leading-none text-ink sm:text-4xl">編集履歴</h1>
      </header>
      <AdminHistory />
    </div>
  );
}
