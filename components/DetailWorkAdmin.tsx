"use client";

import { useMemo, useState } from "react";
import { WorkEditForm, type AdminWork } from "@/components/WorkEditForm";
import type { GalleryItem } from "@/lib/gallery";

type LoadState = "idle" | "loading" | "ready" | "error";
type SubmitState = "idle" | "submitting" | "success" | "error";

export function DetailWorkAdmin({ item, backHref, authors = [] }: { item: GalleryItem; backHref: string; authors?: string[] }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [works, setWorks] = useState<AdminWork[]>([]);
  const [editing, setEditing] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const work = useMemo(
    () => works.find((candidate) => candidate.kind === item.kind && candidate.slug === item.slug) ?? null,
    [item.kind, item.slug, works]
  );

  async function loadWork() {
    setLoadState("loading");
    setSubmitState("idle");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/works?password=${encodeURIComponent(password)}`);
      const result = (await response.json()) as { works?: AdminWork[]; message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "作品を読み込めませんでした。");
      }

      setWorks(result.works ?? []);
      setLoadState("ready");
    } catch (error) {
      setLoadState("error");
      setMessage(error instanceof Error ? error.message : "作品を読み込めませんでした。");
    }
  }

  async function handleEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!work) {
      return;
    }

    setSubmitState("submitting");
    setMessage("");

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/admin/works", {
        method: "PATCH",
        body: formData
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "作品を更新できませんでした。");
      }

      setSubmitState("success");
      setMessage(result.message ?? "保存しました。新しいコミットからVercelが再デプロイします。");
      setEditing(false);
      await loadWork();
    } catch (error) {
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "作品を更新できませんでした。");
    }
  }

  async function handleDelete() {
    if (!work) {
      return;
    }

    const confirmed = window.confirm(`「${work.title}」を削除しますか？Markdownと画像も削除されます。`);

    if (!confirmed) {
      return;
    }

    setSubmitState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/admin/works", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password,
          title: work.title,
          contentPath: work.contentPath,
          contentSha: work.contentSha,
          imagePath: work.imagePath,
          imageSha: work.imageSha
        })
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "作品を削除できませんでした。");
      }

      setSubmitState("success");
      setMessage(result.message ?? "削除しました。");
      window.location.assign(backHref);
    } catch (error) {
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "作品を削除できませんでした。");
    }
  }

  return (
    <section className="mx-auto max-w-5xl border-t border-line pt-5">
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          setMessage("");
        }}
        className={`border px-3 py-1.5 text-xs transition ${
          open ? "border-ink bg-ink text-bone" : "border-line text-muted hover:border-ink hover:text-ink"
        }`}
      >
        管理
      </button>

      {open ? (
        <div className="mt-4 grid gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="grid w-48 gap-1.5 text-xs text-muted">
              管理パスワード
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="text"
                className="border border-line bg-bone px-2.5 py-1.5 text-sm text-ink"
              />
            </label>
            <button
              type="button"
              onClick={loadWork}
              disabled={loadState === "loading"}
              className="border border-line px-3 py-1.5 text-xs text-muted transition hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadState === "loading" ? "読み込み中..." : "読み込む"}
            </button>
          </div>

          {loadState === "ready" && work && !editing ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                disabled={submitState === "submitting"}
                className="border border-line px-3 py-1.5 text-xs text-muted transition hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                編集
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitState === "submitting"}
                className="border border-[#f0a7a7] px-3 py-1.5 text-xs text-[#f0a7a7] transition hover:bg-[#f0a7a7] hover:text-paper disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitState === "submitting" ? "削除中..." : "削除"}
              </button>
            </div>
          ) : null}

          {loadState === "ready" && !work ? (
            <p className="text-sm text-[#f0a7a7]">管理データ内でこの作品を見つけられませんでした。</p>
          ) : null}

          {editing && work ? (
            <WorkEditForm
              work={work}
              password={password}
              submitLabel={submitState === "submitting" ? "保存中..." : "変更を保存"}
              disabled={submitState === "submitting"}
              authors={authors}
              onCancel={() => setEditing(false)}
              onSubmit={handleEdit}
            />
          ) : null}

          {message ? (
            <p
              role={loadState === "error" || submitState === "error" ? "alert" : "status"}
              className={`border-2 px-4 py-3 text-sm font-black shadow-[3px_3px_0_#21180f] ${
                loadState === "error" || submitState === "error"
                  ? "border-[#d92755] bg-bone text-[#d92755]"
                  : "border-ink bg-[#ffde59] text-ink"
              }`}
            >
              {message}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
