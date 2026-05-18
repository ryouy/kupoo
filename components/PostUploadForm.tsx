"use client";

import { useState } from "react";
import type { PostKind } from "@/lib/posts";

type UploadState = "idle" | "submitting" | "success" | "error";

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function PostUploadForm() {
  const [state, setState] = useState<UploadState>("idle");
  const [message, setMessage] = useState("");
  const [dateKey, setDateKey] = useState(0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "投稿に失敗しました。");
      }

      setState("success");
      setMessage(result.message ?? "保存しました。新しいコミットからVercelが再デプロイします。");
      form.reset();
      setDateKey((current) => current + 1);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "投稿に失敗しました。");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-4 border-b border-line pb-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm text-muted">
          種類
          <select name="kind" className="border border-line bg-bone px-3 py-2.5 text-ink" required>
            {([
              ["activities", "活動記録"],
              ["news", "お知らせ"]
            ] as Array<[PostKind, string]>).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid w-48 gap-1.5 text-xs text-muted">
          管理パスワード
          <input name="password" type="text" className="border border-line bg-bone px-2.5 py-1.5 text-sm text-ink" required />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-2 text-sm text-muted">
          タイトル
          <input name="title" className="border border-line bg-bone px-3 py-2.5 text-ink" required />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          URL名
          <input name="slug" className="border border-line bg-bone px-3 py-2.5 text-ink" required />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          日付
          <input
            key={dateKey}
            name="date"
            type="date"
            defaultValue={todayValue()}
            className="border border-line bg-bone px-3 py-2.5 text-ink"
            required
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm text-muted">
        写真
        <input
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="border border-line bg-bone px-3 py-2.5 text-ink file:mr-4 file:border-0 file:bg-ink file:px-4 file:py-2 file:text-bone"
          required
        />
      </label>

      <label className="grid gap-2 text-sm text-muted">
        本文
        <textarea name="description" rows={8} className="border border-line bg-bone px-3 py-2.5 leading-7 text-ink" required />
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state === "submitting"}
          className="border border-ink bg-ink px-5 py-2.5 text-sm text-bone transition hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "submitting" ? "投稿中..." : "投稿する"}
        </button>
        {message ? (
          <p
            role={state === "error" ? "alert" : "status"}
            className={`border-2 px-4 py-3 text-sm font-black shadow-[3px_3px_0_#21180f] ${
              state === "error" ? "border-[#d92755] bg-bone text-[#d92755]" : "border-ink bg-[#ffde59] text-ink"
            }`}
          >
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
