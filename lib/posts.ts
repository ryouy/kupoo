import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const contentRoot = path.join(process.cwd(), "content");

export type PostKind = "activities" | "news";

export type PostItem = {
  kind: PostKind;
  title: string;
  slug: string;
  date: string;
  description: string;
  images: string[];
};

export type PostNeighbor = Pick<PostItem, "slug" | "title"> | null;

const postLabels: Record<PostKind, string> = {
  activities: "活動記録",
  news: "お知らせ"
};

function assertString(value: unknown, field: string, filePath: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${filePath}: frontmatter "${field}" is required.`);
  }

  return value;
}

function readPosts(kind: PostKind): PostItem[] {
  const directory = path.join(contentRoot, kind);

  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const filePath = path.join(directory, file);
      const source = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(source);
      const fallbackSlug = file.replace(/\.md$/, "");
      const images = Array.isArray(data.images)
        ? data.images.filter((image): image is string => typeof image === "string" && image.length > 0)
        : typeof data.image === "string"
          ? [data.image]
          : [];

      return {
        kind,
        title: assertString(data.title, "title", filePath),
        slug: typeof data.slug === "string" && data.slug ? data.slug : fallbackSlug,
        date: assertString(data.date, "date", filePath),
        images,
        description: content.trim()
      };
    })
    .sort(comparePosts);
}

export function comparePosts(a: PostItem, b: PostItem) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

export function getPosts(kind: PostKind) {
  return readPosts(kind);
}

export function getLatestNews(limit = 3) {
  return readPosts("news").slice(0, limit);
}

export function getPost(kind: PostKind, slug: string) {
  return readPosts(kind).find((item) => item.slug === slug) ?? null;
}

export function getPostNeighbors(kind: PostKind, slug: string) {
  const items = readPosts(kind);
  const index = items.findIndex((item) => item.slug === slug);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: index > 0 ? pickNeighbor(items[index - 1]) : null,
    next: index < items.length - 1 ? pickNeighbor(items[index + 1]) : null
  };
}

function pickNeighbor(item: PostItem): PostNeighbor {
  return {
    slug: item.slug,
    title: item.title
  };
}

export function getPostLabel(kind: PostKind) {
  return postLabels[kind];
}

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(date));
}
