import { NextResponse } from "next/server";
import {
  allowedImageTypes,
  allowedPostKinds,
  buildPostMarkdown,
  createGithubFile,
  ensurePathDoesNotExist,
  getBranch,
  normalizeSlug,
  toBase64,
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
      throw new Error("種類は活動記録かお知らせのみです。");
    }

    const title = field(formData, "title");
    const slug = normalizeSlug(field(formData, "slug"));
    const date = field(formData, "date");
    const description = field(formData, "description");
    const images = formData.getAll("images").filter((image): image is File => image instanceof File && image.size > 0);

    if (images.length === 0) {
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
