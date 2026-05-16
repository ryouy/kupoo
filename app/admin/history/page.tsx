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
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="mb-6 border-b border-line pb-5">
        <Link href="/admin" className="mb-4 inline-block text-sm font-black text-muted transition hover:text-ink">
          管理ページへ戻る
        </Link>
        <p className="mb-2 text-sm text-muted">管理ページ</p>
        <h1 className="text-4xl font-medium leading-none text-ink sm:text-5xl">編集履歴</h1>
      </header>
      <AdminHistory />
    </div>
  );
}
