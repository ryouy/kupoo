"use client";

import { useState } from "react";
import { AdminPanel } from "@/components/AdminPanel";

export function AdminPageContent({ authors }: { authors: string[] }) {
  const [password, setPassword] = useState("");

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-8">
      <header className="mb-5 grid gap-4 border-b border-line pb-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="mb-2 text-sm text-muted">管理ページ</p>
          <h1 className="text-3xl font-medium leading-none text-ink sm:text-4xl">作品を管理する</h1>
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
      <AdminPanel authors={authors} password={password} setPassword={setPassword} />
    </div>
  );
}
