"use client";

import { useMemo, useState } from "react";
import { GalleryCard } from "@/components/GalleryCard";
import { SortToggle, type SortMode } from "@/components/SortToggle";
import { WorkEditForm, type AdminWork } from "@/components/WorkEditForm";
import { UNKNOWN_AUTHOR } from "@/lib/authors";
import type { GalleryItem, GalleryKind } from "@/lib/gallery";

type LoadState = "idle" | "loading" | "ready" | "error";
type SubmitState = "idle" | "submitting" | "success" | "error";

function shuffleItems(items: GalleryItem[]) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }

  return next;
}

export function GalleryGrid({ items, kind, authors = [] }: { items: GalleryItem[]; kind: GalleryKind; authors?: string[] }) {
  const [mode, setMode] = useState<SortMode>("published");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [seed, setSeed] = useState(0);
  const [manageOpen, setManageOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [adminWorks, setAdminWorks] = useState<AdminWork[]>([]);
  const [editingWork, setEditingWork] = useState<AdminWork | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const authorOptions = useMemo(
    () => Array.from(new Set([...authors, ...items.map((item) => item.author), UNKNOWN_AUTHOR].filter(Boolean))),
    [authors, items]
  );

  const visibleItems = useMemo(() => {
    const filteredItems = authorFilter === "all" ? items : items.filter((item) => item.author === authorFilter);

    if (mode === "published") {
      return filteredItems;
    }

    return shuffleItems(filteredItems);
  }, [items, mode, seed, authorFilter]);

  function handleChange(nextMode: SortMode) {
    setMode(nextMode);
    if (nextMode === "random") {
      setSeed((current) => current + 1);
    }
  }

  async function loadWorks() {
    setLoadState("loading");
    setSubmitState("idle");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/works?password=${encodeURIComponent(password)}`);
      const result = (await response.json()) as { works?: AdminWork[]; message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "作品を読み込めませんでした。");
      }

      setAdminWorks((result.works ?? []).filter((work) => work.kind === kind));
      setLoadState("ready");
    } catch (error) {
      setLoadState("error");
      setMessage(error instanceof Error ? error.message : "作品を読み込めませんでした。");
    }
  }

  function findAdminWork(item: GalleryItem) {
    return adminWorks.find((work) => work.slug === item.slug && work.kind === item.kind) ?? null;
  }

  async function handleEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingWork) {
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
      setMessage(result.message ?? "更新しました。");
      setEditingWork(null);
      await loadWorks();
    } catch (error) {
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "作品を更新できませんでした。");
    }
  }

  async function handleDelete(work: AdminWork) {
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
      setEditingWork(null);
      await loadWorks();
    } catch (error) {
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "作品を削除できませんでした。");
    }
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 border-b-4 border-ink pb-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="w-fit border-2 border-ink bg-[#ffde59] px-3 py-1 text-sm font-black text-ink">{visibleItems.length} / {items.length}作品</p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-black text-muted">
            製作者
            <select
              value={authorFilter}
              onChange={(event) => setAuthorFilter(event.target.value)}
              className="border-2 border-ink bg-bone px-3 py-2 text-sm font-black text-ink shadow-[3px_3px_0_#21180f]"
            >
              <option value="all">全員</option>
              {authorOptions.map((author) => (
                <option key={author} value={author}>
                  {author}
                </option>
              ))}
            </select>
          </label>
          <SortToggle value={mode} onChange={handleChange} />
          <button
            type="button"
            onClick={() => {
              setManageOpen((current) => !current);
              setMessage("");
            }}
            className={`border-2 px-4 py-2 text-sm font-black transition ${
              manageOpen
                ? "border-ink bg-ink text-bone"
                : "border-ink bg-bone text-muted hover:bg-[#57d4c4] hover:text-ink"
            }`}
          >
            管理
          </button>
        </div>
      </div>

      {manageOpen ? (
        <div className="grid gap-4 border-b-4 border-ink bg-bone/80 p-4 pb-6">
          <div className="flex flex-wrap items-end gap-3">
            <label className="grid w-48 gap-1.5 text-xs text-muted">
              管理パスワード
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="text"
                className="border-2 border-ink bg-bone px-2.5 py-1.5 text-sm text-ink"
              />
            </label>
            <button
              type="button"
              onClick={loadWorks}
              disabled={loadState === "loading"}
              className="border-2 border-ink bg-[#ffde59] px-3 py-1.5 text-xs font-black text-ink transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadState === "loading" ? "読み込み中..." : "読み込む"}
            </button>
          </div>

          {editingWork ? (
            <WorkEditForm
              work={editingWork}
              password={password}
              submitLabel={submitState === "submitting" ? "保存中..." : "変更を保存"}
              disabled={submitState === "submitting"}
              authors={authors}
              onCancel={() => setEditingWork(null)}
              onSubmit={handleEdit}
            />
          ) : null}

          {message ? (
            <p className={`text-sm ${loadState === "error" || submitState === "error" ? "text-[#f0a7a7]" : "text-muted"}`}>
              {message}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleItems.map((item) => {
          const adminWork = findAdminWork(item);

          return (
            <div key={item.slug} className="grid gap-3">
              <GalleryCard item={item} />
              {manageOpen && loadState === "ready" ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => adminWork && setEditingWork(adminWork)}
                    disabled={!adminWork || submitState === "submitting"}
                  className="flex-1 border-2 border-ink bg-bone px-3 py-2 text-sm font-black text-muted transition hover:bg-[#57d4c4] hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => adminWork && handleDelete(adminWork)}
                    disabled={!adminWork || submitState === "submitting"}
                    className="flex-1 border-2 border-[#d92755] bg-bone px-3 py-2 text-sm font-black text-[#d92755] transition hover:bg-[#d92755] hover:text-bone disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    削除
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
