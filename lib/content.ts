import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { GalleryItem, GalleryKind, GalleryNeighbor } from "@/lib/gallery";

const contentRoot = path.join(process.cwd(), "content");

function assertString(value: unknown, field: string, filePath: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${filePath}: frontmatter "${field}" is required.`);
  }

  return value;
}

function readItems(kind: GalleryKind): GalleryItem[] {
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

      return {
        kind,
        title: assertString(data.title, "title", filePath),
        author: typeof data.author === "string" && data.author ? data.author : "Kupooメンバー",
        slug: typeof data.slug === "string" && data.slug ? data.slug : fallbackSlug,
        image: assertString(data.image, "image", filePath),
        date: assertString(data.date, "date", filePath),
        description: content.trim(),
        materials: typeof data.materials === "string" ? data.materials : undefined
      };
    })
    .sort(compareByPublication);
}

export function compareByPublication(a: GalleryItem, b: GalleryItem) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

export function getGalleryItems(kind: GalleryKind) {
  return readItems(kind);
}

export function getLatestItems(limit = 4) {
  return readItems("paintings")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getGalleryItem(kind: GalleryKind, slug: string) {
  return readItems(kind).find((item) => item.slug === slug) ?? null;
}

export function getNeighbors(kind: GalleryKind, slug: string) {
  const items = readItems(kind);
  const index = items.findIndex((item) => item.slug === slug);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: index > 0 ? pickNeighbor(items[index - 1]) : null,
    next: index < items.length - 1 ? pickNeighbor(items[index + 1]) : null
  };
}

function pickNeighbor(item: GalleryItem): GalleryNeighbor {
  return {
    slug: item.slug,
    title: item.title
  };
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(date));
}
