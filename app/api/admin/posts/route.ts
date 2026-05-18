import { NextResponse } from "next/server";
import {
  allowedImageTypes,
  allowedPostKinds,
  buildPostMarkdown,
  createGithubFile,
  deleteGithubFile,
  ensurePathDoesNotExist,
  getBranch,
  listAdminPosts,
  normalizeSlug,
  toBase64,
  updateGithubFile,
  validateAdminPassword,
  type AdminPostKind
} from "@/lib/github-admin";

export const runtime = "nodejs";

function field(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${name} is required.`);
  }

  return value.trim();
}

function passwordFromRequest(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("password") ?? "";
}

function selectedImagePaths(formData: FormData, name: string) {
  return formData
    .getAll(name)
    .filter((image): image is string => typeof image === "string" && image.startsWith("/images/"));
}

export async function GET(request: Request) {
  try {
    validateAdminPassword(passwordFromRequest(request));
    return NextResponse.json({ posts: await listAdminPosts() });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "投稿を読み込めませんでした。" },
      { status: error instanceof Error && error.message === "Invalid password." ? 401 : 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const password = field(formData, "password");

    try {
      validateAdminPassword(password);
    } catch {
      return NextResponse.json({ message: "管理パスワードが違います。" }, { status: 401 });
    }

    const kind = field(formData, "kind") as AdminPostKind;

    if (!allowedPostKinds.has(kind)) {
      throw new Error("種類はお知らせのみです。");
    }

    const title = field(formData, "title");
    const slug = normalizeSlug(field(formData, "slug"));
    const date = field(formData, "date");
    const description = field(formData, "description");
    const images = formData.getAll("images").filter((image): image is File => image instanceof File && image.size > 0);
    const workImages = selectedImagePaths(formData, "workImages");

    if (images.length === 0 && workImages.length === 0) {
      throw new Error("写真を1枚以上選んでください。");
    }

    const branch = getBranch();
    const contentPath = `content/${kind}/${slug}.md`;

    await ensurePathDoesNotExist(contentPath, branch);

    const publicImagePaths: string[] = [];

    for (const [index, image] of images.entries()) {
      const extension = allowedImageTypes.get(image.type);

      if (!extension) {
        throw new Error("写真はJPG、PNG、WebP、AVIFのいずれかにしてください。");
      }

      const imagePath = `public/images/${kind}/${slug}-${index + 1}.${extension}`;
      const publicImagePath = `/images/${kind}/${slug}-${index + 1}.${extension}`;

      await ensurePathDoesNotExist(imagePath, branch);
      await createGithubFile(
        imagePath,
        toBase64(await image.arrayBuffer()),
        `Add ${kind} image: ${title}`,
        branch
      );
      publicImagePaths.push(publicImagePath);
    }

    publicImagePaths.push(...workImages.filter((image) => !publicImagePaths.includes(image)));

    await createGithubFile(
      contentPath,
      Buffer.from(
        buildPostMarkdown({
          title,
          slug,
          date,
          images: publicImagePaths,
          description
        }),
        "utf8"
      ).toString("base64"),
      `Add ${kind}: ${title}`,
      branch
    );

    return NextResponse.json({
      message: "保存しました。新しいコミットからVercelが再デプロイします。",
      url: `/${kind}/${slug}`
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "投稿に失敗しました。" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const formData = await request.formData();
    const password = field(formData, "password");

    try {
      validateAdminPassword(password);
    } catch {
      return NextResponse.json({ message: "管理パスワードが違います。" }, { status: 401 });
    }

    const kind = field(formData, "kind") as AdminPostKind;

    if (!allowedPostKinds.has(kind)) {
      throw new Error("種類はお知らせのみです。");
    }

    const title = field(formData, "title");
    const slug = normalizeSlug(field(formData, "slug"));
    const date = field(formData, "date");
    const description = field(formData, "description");
    const contentPath = field(formData, "contentPath");
    const contentSha = field(formData, "contentSha");
    const existingImages = selectedImagePaths(formData, "existingImages");
    const workImages = selectedImagePaths(formData, "workImages");
    const images = formData.getAll("images").filter((image): image is File => image instanceof File && image.size > 0);
    const branch = getBranch();
    const publicImagePaths = [...existingImages];

    for (const [index, image] of images.entries()) {
      const extension = allowedImageTypes.get(image.type);

      if (!extension) {
        throw new Error("写真はJPG、PNG、WebP、AVIFのいずれかにしてください。");
      }

      const stamp = Date.now();
      const imagePath = `public/images/${kind}/${slug}-${stamp}-${index + 1}.${extension}`;
      const publicImagePath = `/images/${kind}/${slug}-${stamp}-${index + 1}.${extension}`;

      await createGithubFile(
        imagePath,
        toBase64(await image.arrayBuffer()),
        `Add ${kind} image: ${title}`,
        branch
      );
      publicImagePaths.push(publicImagePath);
    }

    for (const image of workImages) {
      if (!publicImagePaths.includes(image)) {
        publicImagePaths.push(image);
      }
    }

    if (publicImagePaths.length === 0) {
      throw new Error("写真を1枚以上残すか追加してください。");
    }

    await updateGithubFile(
      contentPath,
      contentSha,
      Buffer.from(
        buildPostMarkdown({
          title,
          slug,
          date,
          images: publicImagePaths,
          description
        }),
        "utf8"
      ).toString("base64"),
      `Update ${kind}: ${title}`,
      branch
    );

    return NextResponse.json({
      message: "保存しました。新しいコミットからVercelが再デプロイします。",
      url: `/${kind}/${slug}`
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "投稿を更新できませんでした。" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as {
      password?: string;
      title?: string;
      contentPath?: string;
      contentSha?: string;
    };

    validateAdminPassword(body.password ?? "");

    if (!body.contentPath || !body.contentSha) {
      throw new Error("本文ファイルとSHAが必要です。");
    }

    await deleteGithubFile(
      body.contentPath,
      body.contentSha,
      `Delete post: ${body.title || body.contentPath}`,
      getBranch()
    );

    return NextResponse.json({ message: "削除しました。新しいコミットからVercelが再デプロイします。" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "投稿を削除できませんでした。" },
      { status: error instanceof Error && error.message === "Invalid password." ? 401 : 400 }
    );
  }
}
