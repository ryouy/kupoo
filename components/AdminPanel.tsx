"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PostUploadForm } from "@/components/PostUploadForm";
import { UploadForm } from "@/components/UploadForm";
import { UNKNOWN_AUTHOR } from "@/lib/authors";
import type { Member, SiteContent } from "@/lib/site-data";

type Section = "works" | "posts" | "site" | "members";
type Tab = "add" | "edit" | "delete";
type Kind = "paintings";

type AdminWork = {
  kind: Kind;
  title: string;
  author: string;
  slug: string;
  date: string;
  materials?: string;
  description: string;
  image: string;
  contentPath: string;
  contentSha: string;
  imagePath: string;
  imageSha?: string;
};

type LoadState = "idle" | "loading" | "ready" | "error";
type SubmitState = "idle" | "submitting" | "success" | "error";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "add", label: "追加" },
  { id: "edit", label: "編集" },
  { id: "delete", label: "削除" }
];

const sections: Array<{ id: Section; label: string }> = [
  { id: "works", label: "作品集" },
  { id: "posts", label: "活動記録・お知らせ" },
  { id: "site", label: "サイト文言" },
  { id: "members", label: "メンバー" }
];

const emptyMember: Member = {
  name: "",
  role: "",
  comment: "",
  image: "/kupoo-mascot.svg",
};

export function AdminPanel({ authors = [] }: { authors?: string[] }) {
  const [section, setSection] = useState<Section>("works");
  const [tab, setTab] = useState<Tab>("add");
  const selectedKind: Kind = "paintings";
  const [password, setPassword] = useState("");
  const [works, setWorks] = useState<AdminWork[]>([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [site, setSite] = useState<SiteContent | null>(null);
  const [siteSha, setSiteSha] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [previousMembers, setPreviousMembers] = useState<Member[]>([]);
  const [membersSha, setMembersSha] = useState("");
  const [siteState, setSiteState] = useState<LoadState>("idle");
  const [siteSubmitState, setSiteSubmitState] = useState<SubmitState>("idle");
  const [siteMessage, setSiteMessage] = useState("");

  const filteredWorks = useMemo(
    () => works.filter((work) => work.kind === selectedKind),
    [selectedKind, works]
  );

  const selectedWork = useMemo(
    () => filteredWorks.find((work) => work.contentPath === selectedPath) ?? filteredWorks[0] ?? null,
    [filteredWorks, selectedPath]
  );

  async function loadWorks() {
    setLoadState("loading");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/works?password=${encodeURIComponent(password)}`);
      const result = (await response.json()) as { works?: AdminWork[]; message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "作品を読み込めませんでした。");
      }

      const nextWorks = result.works ?? [];
      const nextFilteredWorks = nextWorks.filter((work) => work.kind === selectedKind);

      setWorks(nextWorks);
      setSelectedPath((current) => {
        const currentStillVisible = nextFilteredWorks.some((work) => work.contentPath === current);
        return currentStillVisible ? current : nextFilteredWorks[0]?.contentPath || "";
      });
      setLoadState("ready");
    } catch (error) {
      setLoadState("error");
      setMessage(error instanceof Error ? error.message : "作品を読み込めませんでした。");
    }
  }

  async function handleEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedWork) {
      setMessage("先に作品を選んでください。");
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
      await loadWorks();
    } catch (error) {
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "作品を更新できませんでした。");
    }
  }

  async function handleDelete() {
    if (!selectedWork) {
      setMessage("先に作品を選んでください。");
      return;
    }

    const confirmed = window.confirm(`「${selectedWork.title}」を削除しますか？Markdownと画像も削除されます。`);

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
          title: selectedWork.title,
          contentPath: selectedWork.contentPath,
          contentSha: selectedWork.contentSha,
          imagePath: selectedWork.imagePath,
          imageSha: selectedWork.imageSha
        })
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "作品を削除できませんでした。");
      }

      setSubmitState("success");
      setMessage(result.message ?? "削除しました。");
      setSelectedPath("");
      await loadWorks();
    } catch (error) {
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "作品を削除できませんでした。");
    }
  }

  async function loadSiteData() {
    setSiteState("loading");
    setSiteSubmitState("idle");
    setSiteMessage("");

    try {
      const response = await fetch(`/api/admin/site?password=${encodeURIComponent(password)}`);
      const result = (await response.json()) as {
        site?: { data: SiteContent; sha: string };
        members?: { data: Member[]; sha: string };
        message?: string;
      };

      if (!response.ok || !result.site || !result.members) {
        throw new Error(result.message ?? "サイト情報を読み込めませんでした。");
      }

      setSite(result.site.data);
      setSiteSha(result.site.sha);
      setMembers(result.members.data);
      setPreviousMembers(result.members.data);
      setMembersSha(result.members.sha);
      setSiteState("ready");
    } catch (error) {
      setSiteState("error");
      setSiteMessage(error instanceof Error ? error.message : "サイト情報を読み込めませんでした。");
    }
  }

  async function saveSiteData() {
    if (!site) {
      setSiteMessage("先にサイト情報を読み込んでください。");
      return;
    }

    setSiteSubmitState("submitting");
    setSiteMessage("");

    try {
      const response = await fetch("/api/admin/site", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password,
          site,
          siteSha,
          members,
          previousMembers,
          membersSha
        })
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "サイト情報を更新できませんでした。");
      }

      setSiteSubmitState("success");
      setSiteMessage(result.message ?? "保存しました。新しいコミットからVercelが再デプロイします。");
      await loadSiteData();
    } catch (error) {
      setSiteSubmitState("error");
      setSiteMessage(error instanceof Error ? error.message : "サイト情報を更新できませんでした。");
    }
  }

  function updateMember(index: number, field: keyof Member, value: string) {
    setMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member
      )
    );
  }

  async function uploadMemberImage(index: number, image: File | null) {
    if (!image) {
      setSiteMessage("アイコン画像を選んでください。");
      return;
    }

    const member = members[index];

    if (!member) {
      setSiteMessage("メンバーを見つけられませんでした。");
      return;
    }

    setSiteSubmitState("submitting");
    setSiteMessage("");

    try {
      const formData = new FormData();
      formData.append("password", password);
      formData.append("name", member.name || `member-${index + 1}`);
      formData.append("image", image);

      const response = await fetch("/api/admin/member-image", {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as { image?: string; message?: string };

      if (!response.ok || !result.image) {
        throw new Error(result.message ?? "画像を保存できませんでした。");
      }

      updateMember(index, "image", result.image);
      setSiteSubmitState("success");
      setSiteMessage(result.message ?? "画像をGitHubに保存しました。最後にメンバー情報を保存してください。");
    } catch (error) {
      setSiteSubmitState("error");
      setSiteMessage(error instanceof Error ? error.message : "画像を保存できませんでした。");
    }
  }

  function updateFact(index: number, field: "label" | "value", value: string) {
    setSite((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        about: {
          ...current.about,
          facts: current.about.facts.map((fact, factIndex) =>
            factIndex === index ? { ...fact, [field]: value } : fact
          )
        }
      };
    });
  }

  function setSiteField<Page extends keyof SiteContent, Field extends keyof SiteContent[Page]>(
    page: Page,
    field: Field,
    value: SiteContent[Page][Field]
  ) {
    setSite((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [page]: {
          ...current[page],
          [field]: value
        }
      };
    });
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2 border-b-4 border-ink pb-4">
        {sections.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setSection(item.id);
              setMessage("");
              setSiteMessage("");
            }}
            className={`border-2 px-4 py-2 text-sm font-black transition ${
              section === item.id
                ? "border-ink bg-[#ffde59] text-ink"
                : "border-ink bg-bone text-muted hover:bg-[#57d4c4] hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
        <Link
          href="/admin/history"
          className="border-2 border-ink bg-bone px-4 py-2 text-sm font-black text-muted transition hover:bg-[#57d4c4] hover:text-ink"
        >
          編集履歴
        </Link>
      </div>

      {section === "site" || section === "members" ? (
        <section className="grid gap-5">
          <div className="grid gap-4 border-b border-line pb-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
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
              onClick={loadSiteData}
              disabled={siteState === "loading"}
              className="border border-ink bg-ink px-5 py-2.5 text-sm text-bone transition hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              {siteState === "loading" ? "読み込み中..." : "情報を読み込む"}
            </button>
            <button
              type="button"
              onClick={saveSiteData}
              disabled={!site || siteSubmitState === "submitting"}
              className="border border-ink bg-[#ffde59] px-5 py-2.5 text-sm font-black text-ink transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {siteSubmitState === "submitting" ? "保存中..." : "保存"}
            </button>
          </div>

          {section === "site" && site ? (
            <div className="grid gap-8">
              <SiteTextEditor site={site} setSiteField={setSiteField} updateFact={updateFact} />
            </div>
          ) : null}

          {section === "members" && site ? (
            <div className="grid gap-4">
              {members.map((member, index) => (
                <div key={`${member.name}-${index}`} className="grid gap-4 border-4 border-ink bg-bone p-4 shadow-quiet">
                  <div className="grid gap-4 sm:grid-cols-[120px_1fr_1fr]">
                    <img src={member.image || "/kupoo-mascot.svg"} alt="" className="aspect-square w-28 border-4 border-ink object-cover" />
                    <label className="grid gap-2 text-sm text-muted">
                      名前
                      <input value={member.name} onChange={(event) => updateMember(index, "name", event.target.value)} className="border border-line bg-bone px-3 py-2.5 text-ink" />
                    </label>
                    <label className="grid gap-2 text-sm text-muted">
                      役割
                      <input value={member.role} onChange={(event) => updateMember(index, "role", event.target.value)} className="border border-line bg-bone px-3 py-2.5 text-ink" />
                    </label>
                  </div>
                  <label className="grid gap-2 text-sm text-muted">
                    コメント
                    <textarea value={member.comment} onChange={(event) => updateMember(index, "comment", event.target.value)} rows={3} className="border border-line bg-bone px-3 py-2.5 leading-7 text-ink" />
                  </label>
                  <div className="grid gap-4">
                    <label className="grid gap-2 text-sm text-muted">
                      アイコン画像URL
                      <input value={member.image} onChange={(event) => updateMember(index, "image", event.target.value)} className="border border-line bg-bone px-3 py-2.5 text-ink" />
                    </label>
                    <label className="grid gap-2 text-sm text-muted">
                      アイコン画像をアップロード
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={(event) => uploadMemberImage(index, event.target.files?.[0] ?? null)}
                        disabled={siteSubmitState === "submitting"}
                        className="border border-line bg-bone px-3 py-2.5 text-ink file:mr-4 file:border-0 file:bg-ink file:px-4 file:py-2 file:text-bone disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMembers((current) => current.filter((_, memberIndex) => memberIndex !== index))}
                    className="w-fit border border-[#d92755] px-4 py-2 text-sm text-[#d92755] transition hover:bg-[#d92755] hover:text-bone"
                  >
                    このメンバーを削除
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setMembers((current) => [...current, emptyMember])}
                className="w-fit border-4 border-ink bg-[#57d4c4] px-5 py-3 text-sm font-black text-ink shadow-quiet transition hover:-translate-y-1"
              >
                メンバーを追加
              </button>
            </div>
          ) : null}

          {siteMessage ? (
            <StatusMessage
              message={siteMessage}
              tone={siteState === "error" || siteSubmitState === "error" ? "error" : "success"}
            />
          ) : null}
        </section>
      ) : null}

      {section === "posts" ? (
        <section className="grid gap-5">
          <div className="border-b border-line pb-4">
            <h2 className="text-2xl font-black text-ink">活動記録・お知らせを追加</h2>
          </div>
          <PostUploadForm />
        </section>
      ) : null}

      {section === "works" ? (
      <>
      <div className="flex flex-wrap gap-2 border-b border-line pb-3">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id);
              setMessage("");
            }}
            className={`border px-4 py-2 text-sm transition ${
              tab === item.id
                ? "border-ink bg-ink text-bone"
                : "border-line text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "add" ? <UploadForm authors={authors} /> : null}

      {tab !== "add" ? (
        <section className="grid gap-4">
          <div className="grid gap-4 border-b border-line pb-4 sm:grid-cols-[1fr_auto] sm:items-end">
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
              onClick={loadWorks}
              disabled={loadState === "loading"}
              className="border border-ink bg-ink px-5 py-2.5 text-sm text-bone transition hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadState === "loading" ? "読み込み中..." : "作品を読み込む"}
            </button>
          </div>

          {works.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-[1fr] sm:items-end">
              <label className="grid gap-2 text-sm text-muted">
                作品
                <select
                  value={selectedWork?.contentPath ?? ""}
                  onChange={(event) => setSelectedPath(event.target.value)}
                  className="border border-line bg-bone px-3 py-2.5 text-ink"
                >
                  {filteredWorks.map((work) => (
                    <option key={work.contentPath} value={work.contentPath}>
                      {work.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          {selectedWork ? (
            <div className="grid gap-1 border-b border-line pb-4 text-xs leading-5 text-muted">
              <p>本文ファイル: {selectedWork.contentPath}</p>
              <p>画像ファイル: {selectedWork.imagePath}</p>
            </div>
          ) : null}

          {tab === "edit" && selectedWork ? (
            <form key={selectedWork.contentPath} onSubmit={handleEdit} className="grid gap-4">
              <input type="hidden" name="password" value={password} />
              <input type="hidden" name="contentPath" value={selectedWork.contentPath} />
              <input type="hidden" name="contentSha" value={selectedWork.contentSha} />
              <input type="hidden" name="imagePath" value={selectedWork.imagePath} />
              <input type="hidden" name="imageSha" value={selectedWork.imageSha ?? ""} />
              <input type="hidden" name="image" value={selectedWork.image} />

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <input type="hidden" name="kind" value="paintings" />
                <label className="grid gap-2 text-sm text-muted">
                  作品名
                  <input
                    name="title"
                    defaultValue={selectedWork.title}
                    className="border border-line bg-bone px-3 py-2.5 text-ink"
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm text-muted">
                  製作者
                  <input
                    name="author"
                    list={`admin-author-options-${selectedWork.slug}`}
                    defaultValue={selectedWork.author}
                    className="border border-line bg-bone px-3 py-2.5 text-ink"
                    required
                  />
                  <datalist id={`admin-author-options-${selectedWork.slug}`}>
                    {Array.from(new Set([...authors, selectedWork.author, UNKNOWN_AUTHOR].filter(Boolean))).map((author) => (
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
                    defaultValue={selectedWork.slug}
                    className="border border-line bg-bone px-3 py-2.5 text-ink"
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm text-muted">
                  制作日
                  <input
                    name="date"
                    type="date"
                    defaultValue={selectedWork.date}
                    className="border border-line bg-bone px-3 py-2.5 text-ink"
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm text-muted">
                  画材
                  <input
                    name="materials"
                    defaultValue={selectedWork.materials ?? ""}
                    className="border border-line bg-bone px-3 py-2.5 text-ink"
                  />
                </label>
                <label className="grid gap-2 text-sm text-muted">
                  画像を差し替え
                  <input
                    name="replacementImage"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="border border-line bg-bone px-3 py-2.5 text-ink file:mr-4 file:border-0 file:bg-ink file:px-4 file:py-2 file:text-bone"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm text-muted">
                コメント
                <textarea
                  name="description"
                  rows={5}
                  defaultValue={selectedWork.description}
                  className="border border-line bg-bone px-3 py-2.5 leading-7 text-ink"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={submitState === "submitting"}
                className="w-fit border border-ink bg-ink px-5 py-2.5 text-sm text-bone transition hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitState === "submitting" ? "保存中..." : "変更を保存"}
              </button>
            </form>
          ) : null}

          {tab === "delete" && selectedWork ? (
            <div className="grid gap-4 border border-line p-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-sm text-muted">選択中の作品</p>
                <h2 className="mt-2 text-2xl font-medium text-ink">{selectedWork.title}</h2>
                <p className="mt-2 text-sm text-muted">{selectedWork.contentPath}</p>
              </div>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitState === "submitting"}
                className="w-fit border border-[#f0a7a7] px-5 py-2.5 text-sm text-[#f0a7a7] transition hover:bg-[#f0a7a7] hover:text-paper disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitState === "submitting" ? "削除中..." : "作品を削除"}
              </button>
            </div>
          ) : null}

          {message ? (
            <StatusMessage
              message={message}
              tone={loadState === "error" || submitState === "error" ? "error" : "success"}
            />
          ) : null}
        </section>
      ) : null}
      </>
      ) : null}
    </div>
  );
}

function StatusMessage({ message, tone }: { message: string; tone: "success" | "error" }) {
  return (
    <p
      role={tone === "success" ? "status" : "alert"}
      className={`border-2 px-4 py-3 text-sm font-black shadow-[3px_3px_0_#21180f] ${
        tone === "error"
          ? "border-[#d92755] bg-bone text-[#d92755]"
          : "border-ink bg-[#ffde59] text-ink"
      }`}
    >
      {message}
    </p>
  );
}

function SiteTextEditor({
  site,
  setSiteField,
  updateFact
}: {
  site: SiteContent;
  setSiteField: <Page extends keyof SiteContent, Field extends keyof SiteContent[Page]>(
    page: Page,
    field: Field,
    value: SiteContent[Page][Field]
  ) => void;
  updateFact: (index: number, field: "label" | "value", value: string) => void;
}) {
  return (
    <>
      <section className="grid gap-4">
        <h2 className="text-2xl font-black text-ink">トップページ</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="ラベル" value={site.home.eyebrow} onChange={(value) => setSiteField("home", "eyebrow", value)} />
          <TextInput label="タイトル" value={site.home.title} onChange={(value) => setSiteField("home", "title", value)} />
          <TextInput label="キャッチコピー" value={site.home.tagline} onChange={(value) => setSiteField("home", "tagline", value)} />
          <TextInput label="新着ラベル" value={site.home.latestEyebrow} onChange={(value) => setSiteField("home", "latestEyebrow", value)} />
          <TextInput label="新着見出し" value={site.home.latestTitle} onChange={(value) => setSiteField("home", "latestTitle", value)} />
          <TextInput label="メインボタン" value={site.home.primaryCta} onChange={(value) => setSiteField("home", "primaryCta", value)} />
          <TextInput label="サブボタン" value={site.home.secondaryCta} onChange={(value) => setSiteField("home", "secondaryCta", value)} />
        </div>
        <TextArea label="説明文" value={site.home.description} onChange={(value) => setSiteField("home", "description", value)} />
      </section>

      <section className="grid gap-4 border-t border-line pt-6">
        <h2 className="text-2xl font-black text-ink">Kupooとは</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="ラベル" value={site.about.eyebrow} onChange={(value) => setSiteField("about", "eyebrow", value)} />
          <TextInput label="見出し" value={site.about.headline} onChange={(value) => setSiteField("about", "headline", value)} />
          <TextInput label="雰囲気見出し" value={site.about.vibeTitle} onChange={(value) => setSiteField("about", "vibeTitle", value)} />
          <TextInput label="小ネタラベル" value={site.about.jokeLabel} onChange={(value) => setSiteField("about", "jokeLabel", value)} />
        </div>
        <TextArea label="紹介文" value={site.about.body} onChange={(value) => setSiteField("about", "body", value)} />
        <TextArea label="雰囲気説明" value={site.about.vibeBody} onChange={(value) => setSiteField("about", "vibeBody", value)} />
        <TextArea label="小ネタ" value={site.about.joke} onChange={(value) => setSiteField("about", "joke", value)} />
        <div className="grid gap-3">
          <p className="text-sm font-black text-muted">基本情報</p>
          {site.about.facts.map((fact, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[0.4fr_1fr]">
              <input value={fact.label} onChange={(event) => updateFact(index, "label", event.target.value)} className="border border-line bg-bone px-3 py-2.5 text-ink" />
              <input value={fact.value} onChange={(event) => updateFact(index, "value", event.target.value)} className="border border-line bg-bone px-3 py-2.5 text-ink" />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 border-t border-line pt-6">
        <h2 className="text-2xl font-black text-ink">連絡先・メンバー見出し</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="連絡先ラベル" value={site.contact.eyebrow} onChange={(value) => setSiteField("contact", "eyebrow", value)} />
          <TextInput label="連絡先見出し" value={site.contact.headline} onChange={(value) => setSiteField("contact", "headline", value)} />
          <TextInput label="X / Twitter ID" value={site.contact.xHandle} onChange={(value) => setSiteField("contact", "xHandle", value)} />
          <TextInput label="X / Twitter URL" value={site.contact.xUrl} onChange={(value) => setSiteField("contact", "xUrl", value)} />
          <TextInput label="メンバーラベル" value={site.members.eyebrow} onChange={(value) => setSiteField("members", "eyebrow", value)} />
          <TextInput label="メンバー見出し" value={site.members.headline} onChange={(value) => setSiteField("members", "headline", value)} />
        </div>
        <TextArea label="連絡先説明" value={site.contact.body} onChange={(value) => setSiteField("contact", "body", value)} />
        <TextArea label="メンバー説明" value={site.members.body} onChange={(value) => setSiteField("members", "body", value)} />
      </section>
    </>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm text-muted">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="border border-line bg-bone px-3 py-2.5 text-ink" />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm text-muted">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="border border-line bg-bone px-3 py-2.5 leading-7 text-ink" />
    </label>
  );
}
