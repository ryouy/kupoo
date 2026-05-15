import type { GalleryKind } from "@/lib/gallery";
import { UNKNOWN_AUTHOR } from "@/lib/authors";

export type AdminWork = {
  kind: GalleryKind;
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

export function WorkEditForm({
  work,
  password,
  submitLabel,
  disabled = false,
  authors = [],
  onCancel,
  onSubmit
}: {
  work: AdminWork;
  password: string;
  submitLabel: string;
  disabled?: boolean;
  authors?: string[];
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const authorOptions = Array.from(new Set([...authors.filter(Boolean), work.author, UNKNOWN_AUTHOR].filter(Boolean)));

  return (
    <form key={work.contentPath} onSubmit={onSubmit} className="grid gap-4 border border-line p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="text-xl font-medium text-ink">「{work.title}」を編集</h2>
        <button
          type="button"
          onClick={onCancel}
          className="border border-line px-4 py-2 text-sm text-muted transition hover:border-ink hover:text-ink"
        >
          キャンセル
        </button>
      </div>

      <input type="hidden" name="password" value={password} />
      <input type="hidden" name="contentPath" value={work.contentPath} />
      <input type="hidden" name="contentSha" value={work.contentSha} />
      <input type="hidden" name="imagePath" value={work.imagePath} />
      <input type="hidden" name="imageSha" value={work.imageSha ?? ""} />
      <input type="hidden" name="image" value={work.image} />
      <input type="hidden" name="kind" value={work.kind} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="grid gap-2 text-sm text-muted">
          作品名
          <input
            name="title"
            defaultValue={work.title}
            className="border border-line bg-bone px-3 py-2.5 text-ink"
            required
          />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          製作者
          <select
            name="author"
            defaultValue={work.author}
            className="border border-line bg-bone px-3 py-2.5 text-ink"
            required
          >
            {authorOptions.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-muted">
          URL名
          <input
            name="slug"
            defaultValue={work.slug}
            className="border border-line bg-bone px-3 py-2.5 text-ink"
            required
          />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          制作日
          <input
            name="date"
            type="date"
            defaultValue={work.date}
            className="border border-line bg-bone px-3 py-2.5 text-ink"
            required
          />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          画材
          <input
            name="materials"
            defaultValue={work.materials ?? ""}
            className="border border-line bg-bone px-3 py-2.5 text-ink"
          />
        </label>
        <label className="grid gap-2 text-sm text-muted sm:col-span-2">
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
          defaultValue={work.description}
          className="border border-line bg-bone px-3 py-2.5 leading-7 text-ink"
          required
        />
      </label>

      <button
        type="submit"
        disabled={disabled}
        className="w-fit border border-ink bg-ink px-5 py-2.5 text-sm text-bone transition hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitLabel}
      </button>
    </form>
  );
}
