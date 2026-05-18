"use client";

import { useState } from "react";

type LoadState = "idle" | "loading" | "ready" | "error";

type HistoryItem = {
  sha: string;
  message: string;
  date: string;
  author: string;
  url: string;
};

function formatDate(value: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function AdminHistory({ password }: { password: string }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [state, setState] = useState<LoadState>("idle");
  const [message, setMessage] = useState("");

  async function loadHistory() {
    if (!password.trim()) {
      setState("error");
      setMessage("管理パスワードを入力してください。");
      return;
    }

    setState("loading");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/history?password=${encodeURIComponent(password)}`);
      const result = (await response.json()) as { history?: HistoryItem[]; message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "編集履歴を読み込めませんでした。");
      }

      setHistory(result.history ?? []);
      setState("ready");
      setMessage((result.history ?? []).length > 0 ? "" : "編集履歴はまだありません。");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "編集履歴を読み込めませんでした。");
    }
  }

  return (
    <section className="grid gap-5">
      <div className="flex justify-end border-b border-line pb-4">
        <button
          type="button"
          onClick={loadHistory}
          disabled={state === "loading"}
          className="border border-ink bg-ink px-5 py-2.5 text-sm text-bone transition hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "loading" ? "読み込み中..." : "履歴を読み込む"}
        </button>
      </div>

      {message ? (
        <p
          role={state === "error" ? "alert" : "status"}
          className={`border-2 px-4 py-3 text-sm font-black shadow-[3px_3px_0_#21180f] ${
            state === "error"
              ? "border-[#d92755] bg-bone text-[#d92755]"
              : "border-ink bg-[#ffde59] text-ink"
          }`}
        >
          {message}
        </p>
      ) : null}

      {history.length > 0 ? (
        <div className="grid gap-3">
          {history.map((item) => (
            <article key={item.sha} className="border-2 border-ink bg-bone p-4 shadow-[3px_3px_0_#21180f]">
              <div className="flex flex-wrap items-center gap-2 text-xs font-black text-muted">
                <span>{formatDate(item.date)}</span>
                <span>{item.author}</span>
                <span>{item.sha.slice(0, 7)}</span>
              </div>
              <h2 className="mt-2 text-lg font-black text-ink">{item.message}</h2>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block border border-line px-3 py-1.5 text-xs text-muted transition hover:border-ink hover:text-ink"
              >
                GitHubで見る
              </a>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
