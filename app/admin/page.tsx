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
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="mb-6 border-b border-line pb-5">
        <p className="mb-2 text-sm text-muted">管理ページ</p>
        <h1 className="text-4xl font-medium leading-none text-ink sm:text-5xl">作品を管理する</h1>
      </header>
      <AdminPanel authors={authorOptions} />
    </div>
  );
}
