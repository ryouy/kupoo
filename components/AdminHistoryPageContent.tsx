"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminHistory } from "@/components/AdminHistory";

const adminMenuItems = [
  { href: "/admin?section=works", label: "作品集" },
  { href: "/admin?section=posts", label: "お知らせ" },
  { href: "/admin?section=inquiries", label: "問い合わせ" },
  { href: "/admin?section=members", label: "メンバー" },
  { href: "/admin?section=site", label: "サイト文言" }
];

export function AdminHistoryPageContent() {
  const [password, setPassword] = useState("");

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-8">
      <header className="mb-5 grid gap-4 border-b border-line pb-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Link href="/admin" className="mb-3 inline-block text-sm font-black text-muted transition hover:text-ink">
            管理ページへ戻る
          </Link>
          <p className="text-sm text-muted">編集履歴</p>
        </div>
        <label className="grid w-56 gap-1.5 text-xs text-muted">
          管理パスワード
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="text"
            className="border border-line bg-bone px-2.5 py-1.5 text-sm text-ink"
          />
        </label>
      </header>
      <nav className="mb-5 flex flex-wrap gap-2 border-b-4 border-ink pb-4">
        {adminMenuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border-2 border-ink bg-bone px-4 py-2 text-sm font-black text-muted transition hover:bg-[#57d4c4] hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
        <span className="border-2 border-ink bg-[#ffde59] px-4 py-2 text-sm font-black text-ink">
          編集履歴
        </span>
      </nav>
      <AdminHistory password={password} />
    </div>
  );
}
