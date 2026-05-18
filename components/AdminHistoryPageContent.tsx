"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminHistory } from "@/components/AdminHistory";

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
      <AdminHistory password={password} />
    </div>
  );
}
