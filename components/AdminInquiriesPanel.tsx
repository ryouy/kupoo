"use client";

import { useState } from "react";

type InquirySummary = {
  id: string;
  nickname: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: string;
  messageCount: number;
};

type Inquiry = {
  id: string;
  nickname: string;
  messages: Array<{
    id: string;
    sender: "visitor" | "admin";
    body: string;
    createdAt: string;
  }>;
};

type LoadState = "idle" | "loading" | "ready" | "error";

function formatMessageTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function AdminInquiriesPanel({ password }: { password: string }) {
  const [items, setItems] = useState<InquirySummary[]>([]);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [reply, setReply] = useState("");
  const [state, setState] = useState<LoadState>("idle");
  const [message, setMessage] = useState("");

  async function loadInquiries(nextId?: string | null) {
    if (!password.trim()) {
      setState("error");
      setMessage("管理パスワードを入力してください。");
      return;
    }

    setState("loading");
    setMessage("");

    try {
      const params = new URLSearchParams({ password });
      const response = await fetch(`/api/admin/inquiries?${params.toString()}`);
      const result = (await response.json()) as { inquiries?: InquirySummary[]; inquiry?: Inquiry; message?: string };

      if (!response.ok || !result.inquiries) {
        throw new Error(result.message ?? "問い合わせを読み込めませんでした。");
      }

      setItems(result.inquiries);
      const id = nextId === null ? result.inquiries[0]?.id : nextId ?? selected?.id ?? result.inquiries[0]?.id;
      if (id) {
        await loadInquiry(id, false);
      }
      setState("ready");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "問い合わせを読み込めませんでした。");
    }
  }

  async function loadInquiry(id: string, showLoading = true) {
    if (!password.trim()) {
      setState("error");
      setMessage("管理パスワードを入力してください。");
      return;
    }

    if (showLoading) {
      setState("loading");
    }

    try {
      const params = new URLSearchParams({ password, id });
      const response = await fetch(`/api/admin/inquiries?${params.toString()}`);
      const result = (await response.json()) as { inquiry?: Inquiry; message?: string };

      if (!response.ok || !result.inquiry) {
        throw new Error(result.message ?? "問い合わせを読み込めませんでした。");
      }

      setSelected(result.inquiry);
      setState("ready");
      setMessage("");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "問い合わせを読み込めませんでした。");
    }
  }

  async function sendReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selected) {
      return;
    }

    setState("loading");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/inquiries/${encodeURIComponent(selected.id)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, body: reply })
      });
      const result = (await response.json()) as { inquiry?: Inquiry; message?: string };

      if (!response.ok || !result.inquiry) {
        throw new Error(result.message ?? "返信できませんでした。");
      }

      setSelected(result.inquiry);
      setReply("");
      setMessage("返信しました。");
      await loadInquiries(result.inquiry.id);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "返信できませんでした。");
    }
  }

  async function deleteSelectedInquiry() {
    if (!selected) {
      return;
    }

    const confirmed = window.confirm(`「${selected.nickname}」の問い合わせチャットを削除しますか？`);

    if (!confirmed) {
      return;
    }

    setState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/admin/inquiries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id: selected.id })
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "問い合わせを削除できませんでした。");
      }

      const successMessage = result.message ?? "問い合わせチャットを削除しました。";
      setSelected(null);
      setReply("");
      await loadInquiries(null);
      setMessage(successMessage);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "問い合わせを削除できませんでした。");
    }
  }

  return (
    <section className="grid gap-4">
      <div className="flex justify-end border-b border-line pb-4">
        <button
          type="button"
          onClick={() => loadInquiries()}
          disabled={state === "loading"}
          className="border border-ink bg-ink px-5 py-2.5 text-sm text-bone transition hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "loading" ? "読み込み中..." : "問い合わせを読み込む"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="grid content-start gap-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => loadInquiry(item.id)}
              className={`grid gap-2 border-4 border-ink p-3 text-left shadow-quiet transition hover:-translate-y-0.5 ${selected?.id === item.id ? "bg-[#ffde59]" : "bg-bone"}`}
            >
              <span className="text-sm font-black text-ink">{item.nickname}</span>
              <span className="line-clamp-2 text-xs font-bold leading-5 text-muted">{item.lastMessage}</span>
              <span className="text-xs font-black text-muted">{item.messageCount}件</span>
            </button>
          ))}
          {items.length === 0 ? (
            <p className="border-4 border-ink bg-bone p-4 text-sm font-black text-muted shadow-quiet">
              まだ問い合わせはありません。
            </p>
          ) : null}
        </div>

        <div className="min-h-80 border-4 border-ink bg-paper p-4 shadow-quiet">
          {selected ? (
            <div className="grid gap-4">
              <div className="grid gap-3 border-b-2 border-ink pb-3 sm:grid-cols-[1fr_auto] sm:items-start">
                <div>
                  <p className="text-xs font-black text-muted">問い合わせチャット</p>
                  <h2 className="text-xl font-black text-ink">{selected.nickname}</h2>
                </div>
                <button
                  type="button"
                  onClick={deleteSelectedInquiry}
                  disabled={state === "loading"}
                  className="w-fit border-2 border-ink bg-bone px-3 py-2 text-xs font-black text-[#d92755] transition hover:bg-[#ffde59] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  削除
                </button>
              </div>
              <div className="grid max-h-[30rem] gap-3 overflow-y-auto pr-1">
                {selected.messages.map((item) => (
                  <div key={item.id} className={`max-w-[88%] border-2 border-ink p-3 ${item.sender === "admin" ? "justify-self-end bg-[#57d4c4]" : "justify-self-start bg-[#ffde59]"}`}>
                    <p className="mb-1 text-xs font-black text-muted">{item.sender === "admin" ? "管理者" : selected.nickname}</p>
                    <p className="whitespace-pre-line text-sm font-bold leading-6 text-ink">{item.body}</p>
                    <time dateTime={item.createdAt} className="mt-1 block text-right text-[10px] font-black leading-none text-muted">
                      {formatMessageTime(item.createdAt)}
                    </time>
                  </div>
                ))}
              </div>
              <form onSubmit={sendReply} className="grid gap-3 border-t-2 border-ink pt-3">
                <textarea value={reply} onChange={(event) => setReply(event.target.value)} rows={4} className="border-2 border-ink bg-bone px-3 py-2.5 leading-7 text-ink" required />
                <button type="submit" disabled={state === "loading"} className="w-fit border-2 border-ink bg-ink px-4 py-2 text-sm font-black text-bone transition hover:bg-[#ffde59] hover:text-ink disabled:cursor-not-allowed disabled:opacity-60">
                  返信する
                </button>
              </form>
            </div>
          ) : (
            <div className="grid h-full place-items-center text-sm font-black text-muted">
              問い合わせを選ぶとチャットが表示されます。
            </div>
          )}
        </div>
      </div>

      {message ? (
        <p role={state === "error" ? "alert" : "status"} className={`border-2 px-4 py-3 text-sm font-black shadow-[3px_3px_0_#21180f] ${state === "error" ? "border-[#d92755] bg-bone text-[#d92755]" : "border-ink bg-[#ffde59] text-ink"}`}>
          {message}
        </p>
      ) : null}
    </section>
  );
}
