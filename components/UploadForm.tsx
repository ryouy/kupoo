"use client";

import { useState } from "react";
import { UNKNOWN_AUTHOR } from "@/lib/authors";

type UploadState = "idle" | "submitting" | "success" | "error";

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function UploadForm({ authors = [], password }: { authors?: string[]; password: string }) {
  const [state, setState] = useState<UploadState>("idle");
  const [message, setMessage] = useState("");
  const [dateKey, setDateKey] = useState(0);
  const authorOptions = Array.from(new Set([...authors.filter(Boolean), UNKNOWN_AUTHOR]));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!password.trim()) {
      setState("error");
      setMessage("管理パスワードを入力してください。");
      return;
    }

    setState("submitting");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as { message?: string; url?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "投稿に失敗しました。");
      }

      setState("success");
      setMessage(result.message ?? "投稿しました。新しいコミットからVercelが再デプロイします。");
      form.reset();
      setDateKey((current) => current + 1);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "投稿に失敗しました。");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-4 border-b border-line pb-5">
        <input type="hidden" name="kind" value="paintings" />
        <input type="hidden" name="password" value={password} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="grid gap-2 text-sm text-muted">
          作品名
          <input name="title" className="border border-line bg-bone px-3 py-2.5 text-ink" required />
        </label>

        <label className="grid gap-2 text-sm text-muted">
          製作者
          <input
            name="author"
            list="upload-author-options"
            className="border border-line bg-bone px-3 py-2.5 text-ink"
            required
          />
          <datalist id="upload-author-options">
            {authorOptions.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </datalist>
        </label>

        <label className="grid gap-2 text-sm text-muted">
          URL名
          <input
            name="slug"
            className="border border-line bg-bone px-3 py-2.5 text-ink"
            required
          />
        </label>

        <label className="grid gap-2 text-sm text-muted">
          制作日
          <input
            key={dateKey}
            name="date"
            type="date"
            defaultValue={todayValue()}
            className="border border-line bg-bone px-3 py-2.5 text-ink"
            required
          />
        </label>

        <label className="grid gap-2 text-sm text-muted">
          画材
          <input
            name="materials"
            className="border border-line bg-bone px-3 py-2.5 text-ink"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm text-muted">
        画像
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="border border-line bg-bone px-3 py-2.5 text-ink file:mr-4 file:border-0 file:bg-ink file:px-4 file:py-2 file:text-bone"
          required
        />
      </label>

      <label className="grid gap-2 text-sm text-muted">
        コメント
        <textarea
          name="description"
          rows={5}
          className="border border-line bg-bone px-3 py-2.5 leading-7 text-ink"
          required
        />
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state === "submitting"}
          className="border border-ink bg-ink px-5 py-2.5 text-sm text-bone transition hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "submitting" ? "投稿中..." : "作品を投稿"}
        </button>
        {message ? (
          <p className={`text-sm ${state === "error" ? "text-[#f0a7a7]" : "text-muted"}`}>{message}</p>
        ) : null}
      </div>
    </form>
  );
}
