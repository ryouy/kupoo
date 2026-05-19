"use client";

import { useState } from "react";
import { AdminPanel } from "@/components/AdminPanel";

type AdminSection = "works" | "posts" | "inquiries" | "site" | "members";

export function AdminPageContent({
  authors,
  githubUrl,
  initialSection
}: {
  authors: string[];
  githubUrl: string;
  initialSection?: AdminSection;
}) {
  const [password, setPassword] = useState("");

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-8">
      <header className="mb-5 grid gap-4 border-b border-line pb-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted">管理ページ</p>
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="border-2 border-ink bg-[#ffde59] px-3 py-1.5 text-xs font-black text-ink shadow-[3px_3px_0_#21180f] transition hover:-translate-y-0.5"
          >
            GitHubを開く
          </a>
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
      <AdminPanel authors={authors} password={password} setPassword={setPassword} initialSection={initialSection} />
    </div>
  );
}
