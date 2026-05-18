import matter from "gray-matter";
import { fallbackMembers, fallbackSiteContent, type Member, type SiteContent } from "@/lib/site-data";

export type AdminKind = "paintings";
export type AdminPostKind = "news";

export type AdminWork = {
  kind: AdminKind;
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

export type AdminHistoryItem = {
  sha: string;
  message: string;
  date: string;
  author: string;
  url: string;
};

export type AdminPost = {
  kind: AdminPostKind;
  title: string;
  slug: string;
  date: string;
  description: string;
  images: string[];
  contentPath: string;
  contentSha: string;
};

export const allowedKinds = new Set<AdminKind>(["paintings"]);
export const allowedPostKinds = new Set<AdminPostKind>(["news"]);

export const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"]
]);

type GithubContentItem = {
  name: string;
  path: string;
  sha: string;
  type: "file" | "dir";
  content?: string;
  encoding?: string;
};

export function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getBranch() {
  return process.env.GITHUB_BRANCH || "main";
}

export function validateAdminPassword(password: string) {
  if (password !== requiredEnv("ADMIN_PASSWORD")) {
    throw new Error("Invalid password.");
  }
}

export function normalizeSlug(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

  if (!slug) {
    throw new Error("Slug must contain letters or numbers.");
  }

  return slug;
}

export function escapeFrontmatter(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function toBase64(buffer: ArrayBuffer) {
  return Buffer.from(buffer).toString("base64");
}

export function buildMarkdown({
  kind,
  title,
  author,
  slug,
  image,
  date,
  materials,
  description
}: {
  kind: AdminKind;
  title: string;
  author: string;
  slug: string;
  image: string;
  date: string;
  materials?: string;
  description: string;
}) {
  return [
    "---",
    `title: "${escapeFrontmatter(title)}"`,
    `author: "${escapeFrontmatter(author)}"`,
    `slug: "${slug}"`,
    `image: "${image}"`,
    `date: "${escapeFrontmatter(date)}"`,
    kind === "paintings" && materials ? `materials: "${escapeFrontmatter(materials)}"` : "",
    "---",
    "",
    description,
    ""
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function buildPostMarkdown({
  title,
  slug,
  images,
  date,
  description
}: {
  title: string;
  slug: string;
  images: string[];
  date: string;
  description: string;
}) {
  return [
    "---",
    `title: "${escapeFrontmatter(title)}"`,
    `slug: "${slug}"`,
    `date: "${escapeFrontmatter(date)}"`,
    "images:",
    ...images.map((image) => `  - "${image}"`),
    "---",
    "",
    description,
    ""
  ].join("\n");
}

export async function githubRequest(path: string, init: RequestInit = {}) {
  const owner = requiredEnv("GITHUB_OWNER");
  const repo = requiredEnv("GITHUB_REPO");
  const token = requiredEnv("GITHUB_TOKEN");
  const url = `https://api.github.com/repos/${owner}/${repo}${path}`;

  return fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...init.headers
    }
  });
}

export async function ensurePathDoesNotExist(path: string, branch = getBranch()) {
  const response = await githubRequest(`/contents/${path}?ref=${encodeURIComponent(branch)}`);

  if (response.status === 200) {
    throw new Error(`${path} already exists.`);
  }

  if (response.status !== 404) {
    throw new Error(`Could not check ${path}.`);
  }
}

export async function getGithubContent(path: string, branch = getBranch()) {
  const response = await githubRequest(`/contents/${path}?ref=${encodeURIComponent(branch)}`);

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as GithubContentItem | GithubContentItem[];
}

export async function createGithubFile(path: string, content: string, message: string, branch = getBranch()) {
  const response = await githubRequest(`/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      branch,
      content,
      message
    })
  });

  if (!response.ok) {
    const details = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(details?.message ?? `Failed to create ${path}.`);
  }
}

export async function updateGithubFile(
  path: string,
  sha: string,
  content: string,
  message: string,
  branch = getBranch()
) {
  const response = await githubRequest(`/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      branch,
      content,
      message,
      sha
    })
  });

  if (!response.ok) {
    const details = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(details?.message ?? `Failed to update ${path}.`);
  }
}

export async function deleteGithubFile(path: string, sha: string, message: string, branch = getBranch()) {
  const response = await githubRequest(`/contents/${path}`, {
    method: "DELETE",
    body: JSON.stringify({
      branch,
      message,
      sha
    })
  });

  if (!response.ok) {
    const details = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(details?.message ?? `Failed to delete ${path}.`);
  }
}

export async function listAdminWorks() {
  const works: AdminWork[] = [];

  for (const kind of allowedKinds) {
    const directory = await getGithubContent(`content/${kind}`);

    if (!Array.isArray(directory)) {
      continue;
    }

    for (const item of directory) {
      if (item.type !== "file" || !item.name.endsWith(".md")) {
        continue;
      }

      const file = await getGithubContent(item.path);

      if (!file || Array.isArray(file) || !file.content) {
        continue;
      }

      const source = Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8");
      const parsed = matter(source);
      const slug = typeof parsed.data.slug === "string" ? parsed.data.slug : item.name.replace(/\.md$/, "");
      const image = typeof parsed.data.image === "string" ? parsed.data.image : "";
      const imagePath = image.startsWith("/") ? `public${image}` : image;
      const imageFile = imagePath ? await getGithubContent(imagePath) : null;

      works.push({
        kind,
        title: typeof parsed.data.title === "string" ? parsed.data.title : slug,
        author: typeof parsed.data.author === "string" ? parsed.data.author : "Kupooメンバー",
        slug,
        date: typeof parsed.data.date === "string" ? parsed.data.date : "",
        materials: typeof parsed.data.materials === "string" ? parsed.data.materials : undefined,
        description: parsed.content.trim(),
        image,
        contentPath: item.path,
        contentSha: file.sha,
        imagePath,
        imageSha: imageFile && !Array.isArray(imageFile) ? imageFile.sha : undefined
      });
    }
  }

  return works.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function listAdminPosts() {
  const posts: AdminPost[] = [];

  for (const kind of allowedPostKinds) {
    const directory = await getGithubContent(`content/${kind}`);

    if (!Array.isArray(directory)) {
      continue;
    }

    for (const item of directory) {
      if (item.type !== "file" || !item.name.endsWith(".md")) {
        continue;
      }

      const file = await getGithubContent(item.path);

      if (!file || Array.isArray(file) || !file.content) {
        continue;
      }

      const source = Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8");
      const parsed = matter(source);
      const slug = typeof parsed.data.slug === "string" ? parsed.data.slug : item.name.replace(/\.md$/, "");
      const images = Array.isArray(parsed.data.images)
        ? parsed.data.images.filter((image): image is string => typeof image === "string" && image.length > 0)
        : typeof parsed.data.image === "string"
          ? [parsed.data.image]
          : [];

      posts.push({
        kind,
        title: typeof parsed.data.title === "string" ? parsed.data.title : slug,
        slug,
        date: typeof parsed.data.date === "string" ? parsed.data.date : "",
        images,
        description: parsed.content.trim(),
        contentPath: item.path,
        contentSha: file.sha
      });
    }
  }

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function listAdminHistory() {
  const branch = getBranch();
  const response = await githubRequest(
    `/commits?sha=${encodeURIComponent(branch)}&path=content&per_page=50`
  );

  if (!response.ok) {
    const details = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(details?.message ?? "編集履歴を読み込めませんでした。");
  }

  const commits = (await response.json()) as Array<{
    sha: string;
    html_url: string;
    commit: {
      message: string;
      author?: {
        name?: string;
        date?: string;
      };
      committer?: {
        name?: string;
        date?: string;
      };
    };
    author?: {
      login?: string;
    } | null;
  }>;

  return commits.map((commit) => ({
    sha: commit.sha,
    message: commit.commit.message.split("\n")[0] || "(no message)",
    date: commit.commit.author?.date ?? commit.commit.committer?.date ?? "",
    author: commit.author?.login ?? commit.commit.author?.name ?? commit.commit.committer?.name ?? "unknown",
    url: commit.html_url
  }));
}

function decodeGithubFile(file: GithubContentItem | GithubContentItem[] | null) {
  if (!file || Array.isArray(file) || !file.content) {
    return null;
  }

  return {
    sha: file.sha,
    source: Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8")
  };
}

export async function getAdminSiteData() {
  const siteFile = await getGithubContent("content/site.json");
  const membersFile = await getGithubContent("content/members.json");
  const siteSource = decodeGithubFile(siteFile);
  const membersSource = decodeGithubFile(membersFile);

  return {
    site: {
      data: siteSource ? (JSON.parse(siteSource.source) as SiteContent) : fallbackSiteContent,
      sha: siteSource?.sha ?? ""
    },
    members: {
      data: membersSource ? (JSON.parse(membersSource.source) as Member[]) : fallbackMembers,
      sha: membersSource?.sha ?? ""
    }
  };
}
