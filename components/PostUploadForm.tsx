"use client";

import { useMemo, useState } from "react";
import type { PostKind } from "@/lib/posts";

type UploadState = "idle" | "submitting" | "success" | "error";
type LoadState = "idle" | "loading" | "ready" | "error";
type PostTab = "add" | "edit" | "delete";

type AdminWork = {
  title: string;
  author: string;
  slug: string;
  image: string;
};

type AdminPost = {
  kind: PostKind;
  title: string;
  slug: string;
  date: string;
  description: string;
  images: string[];
  contentPath: string;
  contentSha: string;
};

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

const postTabs: Array<{ id: PostTab; label: string }> = [
  { id: "add", label: "追加" },
  { id: "edit", label: "編集" },
  { id: "delete", label: "削除" }
];

export function PostUploadForm({ password }: { password: string }) {
  const [state, setState] = useState<UploadState>("idle");
  const [workLoadState, setWorkLoadState] = useState<LoadState>("idle");
  const [message, setMessage] = useState("");
  const [kind, setKind] = useState<PostKind>("activities");
  const [postTab, setPostTab] = useState<PostTab>("add");
  const [works, setWorks] = useState<AdminWork[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [postLoadState, setPostLoadState] = useState<LoadState>("idle");
  const [editState, setEditState] = useState<UploadState>("idle");
  const [dateKey, setDateKey] = useState(0);
  const [addWorkPickerOpen, setAddWorkPickerOpen] = useState(false);
  const [addWorkImages, setAddWorkImages] = useState<string[]>([]);

  const selectedPost = useMemo(
    () => posts.find((post) => post.contentPath === selectedPath) ?? posts[0] ?? null,
    [posts, selectedPath]
  );

  async function loadWorks() {
    setWorkLoadState("loading");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/works?password=${encodeURIComponent(password)}`);
      const result = (await response.json()) as { works?: AdminWork[]; message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "作品を読み込めませんでした。");
      }

      setWorks(result.works ?? []);
      setWorkLoadState("ready");
    } catch (error) {
      setWorkLoadState("error");
      setMessage(error instanceof Error ? error.message : "作品を読み込めませんでした。");
    }
  }

  async function loadPosts() {
    setPostLoadState("loading");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/posts?password=${encodeURIComponent(password)}`);
      const result = (await response.json()) as { posts?: AdminPost[]; message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "投稿を読み込めませんでした。");
      }

      const nextPosts = result.posts ?? [];
      setPosts(nextPosts);
      setSelectedPath((current) =>
        nextPosts.some((post) => post.contentPath === current) ? current : nextPosts[0]?.contentPath ?? ""
      );
      setPostLoadState("ready");
    } catch (error) {
      setPostLoadState("error");
      setMessage(error instanceof Error ? error.message : "投稿を読み込めませんでした。");
    }
  }

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
      setKind("activities");
      setAddWorkImages([]);
      setAddWorkPickerOpen(false);
      setDateKey((current) => current + 1);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "投稿に失敗しました。");
    }
  }

  async function handleEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEditState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/admin/posts", {
        method: "PATCH",
        body: new FormData(event.currentTarget)
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "投稿を更新できませんでした。");
      }

      setEditState("success");
      setMessage(result.message ?? "保存しました。新しいコミットからVercelが再デプロイします。");
      await loadPosts();
    } catch (error) {
      setEditState("error");
      setMessage(error instanceof Error ? error.message : "投稿を更新できませんでした。");
    }
  }

  async function handleDelete() {
    if (!selectedPost) {
      setMessage("先に投稿を選んでください。");
      return;
    }

    const confirmed = window.confirm(`「${selectedPost.title}」を削除しますか？本文ファイルを削除します。`);

    if (!confirmed) {
      return;
    }

    setEditState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password,
          title: selectedPost.title,
          contentPath: selectedPost.contentPath,
          contentSha: selectedPost.contentSha
        })
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "投稿を削除できませんでした。");
      }

      setEditState("success");
      setMessage(result.message ?? "削除しました。");
      setSelectedPath("");
      await loadPosts();
    } catch (error) {
      setEditState("error");
      setMessage(error instanceof Error ? error.message : "投稿を削除できませんでした。");
    }
  }

  return (
    <div className="grid gap-8">
    <div className="flex flex-wrap gap-2 border-b border-line pb-3">
      {postTabs.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            setPostTab(item.id);
            setMessage("");
          }}
          className={`border px-4 py-2 text-sm transition ${
            postTab === item.id
              ? "border-ink bg-ink text-bone"
              : "border-line text-muted hover:border-ink hover:text-ink"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>

    {postTab === "add" ? (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-4 border-b border-line pb-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm text-muted">
          種類
          <select
            name="kind"
            value={kind}
            onChange={(event) => setKind(event.target.value as PostKind)}
            className="border border-line bg-bone px-3 py-2.5 text-ink"
            required
          >
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
        <input type="hidden" name="password" value={password} />
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
        写真（複数選択できます）
        <input
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="border border-line bg-bone px-3 py-2.5 text-ink file:mr-4 file:border-0 file:bg-ink file:px-4 file:py-2 file:text-bone"
        />
      </label>

      <WorkImagePicker
        works={works}
        selectedImages={addWorkImages}
        open={addWorkPickerOpen}
        workLoadState={workLoadState}
        hiddenName="workImages"
        onLoad={async () => {
          await loadWorks();
          setAddWorkPickerOpen(true);
        }}
        onSelect={(image) => {
          setAddWorkImages((current) => (current.includes(image) ? current : [...current, image]));
          setAddWorkPickerOpen(false);
        }}
        onRemove={(image) => setAddWorkImages((current) => current.filter((item) => item !== image))}
        onClose={() => setAddWorkPickerOpen(false)}
      />

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
    ) : null}

    {postTab !== "add" ? (
    <section className="grid gap-4 border-t-4 border-ink pt-6">
      <div className="flex flex-wrap items-end gap-3">
        <button
          type="button"
          onClick={loadPosts}
          disabled={postLoadState === "loading"}
          className="border border-ink bg-ink px-5 py-2.5 text-sm text-bone transition hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {postLoadState === "loading" ? "読み込み中..." : "投稿を読み込む"}
        </button>
      </div>

      {posts.length > 0 ? (
        <label className="grid gap-2 text-sm text-muted">
          編集する投稿
          <select
            value={selectedPost?.contentPath ?? ""}
            onChange={(event) => setSelectedPath(event.target.value)}
            className="border border-line bg-bone px-3 py-2.5 text-ink"
          >
            {posts.map((post) => (
              <option key={post.contentPath} value={post.contentPath}>
                {post.kind === "activities" ? "活動記録" : "お知らせ"}: {post.title}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {selectedPost ? (
        postTab === "edit" ? (
        <PostEditForm
          key={selectedPost.contentPath}
          post={selectedPost}
          password={password}
          works={works}
          workLoadState={workLoadState}
          disabled={editState === "submitting"}
          onLoadWorks={loadWorks}
          onSubmit={handleEdit}
        />
        ) : (
          <div className="grid gap-4 border border-line p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-sm text-muted">選択中の投稿</p>
              <h2 className="mt-2 text-2xl font-medium text-ink">{selectedPost.title}</h2>
              <p className="mt-2 text-sm text-muted">{selectedPost.contentPath}</p>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              disabled={editState === "submitting"}
              className="w-fit border border-[#f0a7a7] px-5 py-2.5 text-sm text-[#f0a7a7] transition hover:bg-[#f0a7a7] hover:text-paper disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editState === "submitting" ? "削除中..." : "投稿を削除"}
            </button>
          </div>
        )
      ) : null}
    </section>
    ) : null}
    {postTab !== "add" && message ? (
      <p
        role={editState === "error" || postLoadState === "error" || workLoadState === "error" ? "alert" : "status"}
        className={`border-2 px-4 py-3 text-sm font-black shadow-[3px_3px_0_#21180f] ${
          editState === "error" || postLoadState === "error" || workLoadState === "error"
            ? "border-[#d92755] bg-bone text-[#d92755]"
            : "border-ink bg-[#ffde59] text-ink"
        }`}
      >
        {message}
      </p>
    ) : null}
    </div>
  );
}

function PostEditForm({
  post,
  password,
  works,
  workLoadState,
  disabled,
  onLoadWorks,
  onSubmit
}: {
  post: AdminPost;
  password: string;
  works: AdminWork[];
  workLoadState: LoadState;
  disabled: boolean;
  onLoadWorks: () => Promise<void>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [workPickerOpen, setWorkPickerOpen] = useState(false);
  const [workImages, setWorkImages] = useState<string[]>([]);

  return (
    <form onSubmit={onSubmit} className="grid gap-5 border-4 border-ink bg-bone p-4 shadow-[3px_3px_0_#21180f]">
      <input type="hidden" name="password" value={password} />
      <input type="hidden" name="contentPath" value={post.contentPath} />
      <input type="hidden" name="contentSha" value={post.contentSha} />
      <input type="hidden" name="kind" value={post.kind} />
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="grid gap-2 text-sm text-muted">
          種類
          <p className="border border-line bg-paper px-3 py-2.5 text-ink">
            {post.kind === "activities" ? "活動記録" : "お知らせ"}
          </p>
        </div>
        <label className="grid gap-2 text-sm text-muted">
          タイトル
          <input name="title" defaultValue={post.title} className="border border-line bg-bone px-3 py-2.5 text-ink" required />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          URL名
          <input name="slug" defaultValue={post.slug} className="border border-line bg-bone px-3 py-2.5 text-ink" required />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          日付
          <input name="date" type="date" defaultValue={post.date} className="border border-line bg-bone px-3 py-2.5 text-ink" required />
        </label>
      </div>

      <section className="grid gap-3">
        <p className="text-sm font-black text-muted">残す画像</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {post.images.map((image) => (
            <label key={image} className="grid cursor-pointer gap-2 border-2 border-ink bg-paper p-2 text-xs font-black text-ink">
              <input name="existingImages" type="checkbox" value={image} defaultChecked className="h-4 w-4" />
              <img src={image} alt="" className="aspect-[4/3] w-full border-2 border-ink object-cover" />
            </label>
          ))}
        </div>
      </section>

      <label className="grid gap-2 text-sm text-muted">
        追加写真
        <input
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="border border-line bg-bone px-3 py-2.5 text-ink file:mr-4 file:border-0 file:bg-ink file:px-4 file:py-2 file:text-bone"
        />
      </label>

      <WorkImagePicker
        works={works.filter((work) => !post.images.includes(work.image))}
        selectedImages={workImages}
        open={workPickerOpen}
        workLoadState={workLoadState}
        hiddenName="workImages"
        onLoad={async () => {
          await onLoadWorks();
          setWorkPickerOpen(true);
        }}
        onSelect={(image) => {
          setWorkImages((current) => (current.includes(image) ? current : [...current, image]));
          setWorkPickerOpen(false);
        }}
        onRemove={(image) => setWorkImages((current) => current.filter((item) => item !== image))}
        onClose={() => setWorkPickerOpen(false)}
      />

      <label className="grid gap-2 text-sm text-muted">
        本文
        <textarea name="description" rows={8} defaultValue={post.description} className="border border-line bg-bone px-3 py-2.5 leading-7 text-ink" required />
      </label>

      <button
        type="submit"
        disabled={disabled}
        className="w-fit border border-ink bg-ink px-5 py-2.5 text-sm text-bone transition hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        {disabled ? "保存中..." : "変更を保存"}
      </button>
    </form>
  );
}

function WorkImagePicker({
  works,
  selectedImages,
  open,
  workLoadState,
  hiddenName,
  onLoad,
  onSelect,
  onRemove,
  onClose
}: {
  works: AdminWork[];
  selectedImages: string[];
  open: boolean;
  workLoadState: LoadState;
  hiddenName: string;
  onLoad: () => Promise<void>;
  onSelect: (image: string) => void;
  onRemove: (image: string) => void;
  onClose: () => void;
}) {
  return (
    <section className="grid gap-3 border-4 border-ink bg-bone p-4 shadow-[3px_3px_0_#21180f]">
      {selectedImages.map((image) => (
        <input key={image} type="hidden" name={hiddenName} value={image} />
      ))}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-3">
        <div>
          <p className="text-sm font-black text-ink">作品集から画像を貼り付ける</p>
          <p className="mt-1 text-xs font-bold text-muted">お知らせ・活動記録どちらにも既存作品の画像を入れられます。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {open ? (
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-ink bg-bone px-3 py-2 text-xs font-black text-ink transition hover:-translate-y-0.5"
            >
              閉じる
            </button>
          ) : null}
          <button
            type="button"
            onClick={onLoad}
            disabled={workLoadState === "loading"}
            className="border-2 border-ink bg-[#ffde59] px-3 py-2 text-xs font-black text-ink transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {workLoadState === "loading" ? "読み込み中..." : "作品を選ぶ"}
          </button>
        </div>
      </div>

      {selectedImages.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {selectedImages.map((image) => (
            <div key={image} className="grid gap-2 border-2 border-ink bg-paper p-2">
              <img src={image} alt="" className="aspect-[4/3] w-full border-2 border-ink object-cover" />
              <button
                type="button"
                onClick={() => onRemove(image)}
                className="border border-[#d92755] px-2 py-1 text-xs font-black text-[#d92755] transition hover:bg-[#d92755] hover:text-bone"
              >
                外す
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm font-bold text-muted">作品画像を選ぶと、ここに小さく表示されます。</p>
      )}

      {open && works.length > 0 ? (
        <div className="grid max-h-[360px] gap-3 overflow-y-auto border-t-2 border-ink pt-3 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((work) => (
            <button
              key={work.slug}
              type="button"
              onClick={() => onSelect(work.image)}
              className="grid gap-2 border-2 border-ink bg-paper p-2 text-left text-sm font-black text-ink transition hover:bg-[#b8ff6a]"
            >
              <img src={work.image} alt="" className="aspect-[4/3] w-full border-2 border-ink object-cover" />
              <span>{work.title}</span>
              <span className="text-xs text-muted">{work.author}</span>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
