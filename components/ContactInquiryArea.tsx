"use client";

import { useState } from "react";

type PublicInquiry = {
  id: string;
  nickname: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    sender: "visitor" | "admin";
    body: string;
    createdAt: string;
  }>;
};

type Mode = "new" | "check";
type State = "idle" | "loading" | "success" | "error";

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

export function ContactInquiryArea() {
  const [mode, setMode] = useState<Mode>("new");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [body, setBody] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [inquiry, setInquiry] = useState<PublicInquiry | null>(null);
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function createInquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/contact/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, password, body })
      });
      const result = (await response.json()) as { inquiry?: PublicInquiry; message?: string };

      if (!response.ok || !result.inquiry) {
        throw new Error(result.message ?? "送信できませんでした。");
      }

      setInquiry(result.inquiry);
      setBody("");
      setMode("check");
      setState("success");
      setMessage("送信しました。返信はニックネームとパスワードで確認できます。");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "送信できませんでした。");
    }
  }

  async function loadInquiry(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setState("loading");
    setMessage("");

    try {
      const params = new URLSearchParams({
        nickname,
        password
      });
      const response = await fetch(`/api/contact/inquiries?${params.toString()}`);
      const result = (await response.json()) as { inquiry?: PublicInquiry; message?: string };

      if (!response.ok || !result.inquiry) {
        throw new Error(result.message ?? "問い合わせを読み込めませんでした。");
      }

      setInquiry(result.inquiry);
      setState("success");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "問い合わせを読み込めませんでした。");
    }
  }

  async function sendReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    try {
      if (!inquiry) {
        throw new Error("先にチャットを開いてください。");
      }

      const response = await fetch(`/api/contact/inquiries/${encodeURIComponent(inquiry.id)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, password, body: replyBody })
      });
      const result = (await response.json()) as { inquiry?: PublicInquiry; message?: string };

      if (!response.ok || !result.inquiry) {
        throw new Error(result.message ?? "返信できませんでした。");
      }

      setInquiry(result.inquiry);
      setReplyBody("");
      setState("success");
      setMessage("返信しました。");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "返信できませんでした。");
    }
  }

  const isBusy = state === "loading";

  return (
    <section className="border-4 border-ink bg-bone p-5 shadow-quiet sm:p-6">
      <div className="mb-5 flex flex-wrap gap-2 border-b-4 border-ink pb-4">
        <button
          type="button"
          onClick={() => setMode("new")}
          className={`border-2 border-ink px-4 py-2 text-sm font-black transition ${mode === "new" ? "bg-[#ffde59] text-ink" : "bg-paper text-muted hover:bg-[#57d4c4] hover:text-ink"}`}
        >
          新しく送る
        </button>
        <button
          type="button"
          onClick={() => setMode("check")}
          className={`border-2 border-ink px-4 py-2 text-sm font-black transition ${mode === "check" ? "bg-[#ffde59] text-ink" : "bg-paper text-muted hover:bg-[#57d4c4] hover:text-ink"}`}
        >
          返信を見る
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={mode === "new" ? createInquiry : loadInquiry} className="grid content-start gap-4">
          <label className="grid gap-2 text-sm font-bold text-muted">
            ニックネーム
            <input value={nickname} onChange={(event) => setNickname(event.target.value)} className="border-2 border-ink bg-paper px-3 py-2.5 text-ink" required />
          </label>
          <label className="grid gap-2 text-sm font-bold text-muted">
            パスワード
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" className="border-2 border-ink bg-paper px-3 py-2.5 text-ink" required />
          </label>
          {mode === "new" ? (
            <label className="grid gap-2 text-sm font-bold text-muted">
              本文
              <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={6} className="border-2 border-ink bg-paper px-3 py-2.5 leading-7 text-ink" required />
            </label>
          ) : null}
          <button type="submit" disabled={isBusy} className="w-fit border-4 border-ink bg-[#ff5e8f] px-5 py-3 text-sm font-black text-ink shadow-quiet transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60">
            {isBusy ? "処理中..." : mode === "new" ? "問い合わせを送る" : "チャットを開く"}
          </button>
          {message ? (
            <p role={state === "error" ? "alert" : "status"} className={`border-2 px-4 py-3 text-sm font-black ${state === "error" ? "border-[#d92755] text-[#d92755]" : "border-ink bg-[#ffde59] text-ink"}`}>
              {message}
            </p>
          ) : null}
        </form>

        <div className="min-h-64 border-4 border-ink bg-paper p-4">
          {mode === "check" && inquiry ? (
            <div className="grid gap-4">
              <div className="border-b-2 border-ink pb-3">
                <p className="text-xs font-black text-muted">問い合わせチャット</p>
                <p className="text-lg font-black text-ink">{inquiry.nickname}</p>
              </div>
              <div className="grid max-h-[28rem] gap-3 overflow-y-auto pr-1">
                {inquiry.messages.map((item) => (
                  <div key={item.id} className={`max-w-[88%] border-2 border-ink p-3 ${item.sender === "visitor" ? "justify-self-end bg-[#ffde59]" : "justify-self-start bg-[#57d4c4]"}`}>
                    <p className="mb-1 text-xs font-black text-muted">{item.sender === "visitor" ? inquiry.nickname : "Kupoo"}</p>
                    <p className="whitespace-pre-line text-sm font-bold leading-6 text-ink">{item.body}</p>
                    <time dateTime={item.createdAt} className="mt-1 block text-right text-[10px] font-black leading-none text-muted">
                      {formatMessageTime(item.createdAt)}
                    </time>
                  </div>
                ))}
              </div>
              <form onSubmit={sendReply} className="grid gap-3 border-t-2 border-ink pt-3">
                <textarea value={replyBody} onChange={(event) => setReplyBody(event.target.value)} rows={3} className="border-2 border-ink bg-bone px-3 py-2.5 leading-7 text-ink" required />
                <button type="submit" disabled={isBusy} className="w-fit border-2 border-ink bg-ink px-4 py-2 text-sm font-black text-bone transition hover:bg-[#ffde59] hover:text-ink disabled:cursor-not-allowed disabled:opacity-60">
                  返信する
                </button>
              </form>
            </div>
          ) : mode === "check" ? (
            <div className="grid h-full place-items-center text-center text-sm font-black leading-7 text-muted">
              問い合わせを送るか、ニックネーム・パスワードでチャットを開けます。
            </div>
          ) : (
            <div className="grid h-full place-items-center text-center text-sm font-black leading-7 text-muted">
              ニックネームとパスワードを決めて、問い合わせを送れます。
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
