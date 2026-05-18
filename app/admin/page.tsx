import type { Metadata } from "next";
import { AdminPanel } from "@/components/AdminPanel";
import { getMembers } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "管理",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  const authorOptions = getMembers().map((member) => member.name);

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-8">
      <header className="mb-5 border-b border-line pb-4">
        <p className="mb-2 text-sm text-muted">管理ページ</p>
        <h1 className="text-3xl font-medium leading-none text-ink sm:text-4xl">作品を管理する</h1>
      </header>
      <AdminPanel authors={authorOptions} />
    </div>
  );
}
