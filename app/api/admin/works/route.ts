import { NextResponse } from "next/server";
import {
  allowedImageTypes,
  allowedKinds,
  buildMarkdown,
  createGithubFile,
  deleteGithubFile,
  ensurePathDoesNotExist,
  getBranch,
  listAdminWorks,
  normalizeSlug,
  toBase64,
  updateGithubFile,
  validateAdminPassword,
  type AdminKind
} from "@/lib/github-admin";

export const runtime = "nodejs";

function text(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${name} is required.`);
  }

  return value.trim();
}

function optionalText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function passwordFromRequest(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("password") ?? "";
}

export async function GET(request: Request) {
  try {
    validateAdminPassword(passwordFromRequest(request));
    return NextResponse.json({ works: await listAdminWorks() });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "作品を読み込めませんでした。" },
      { status: error instanceof Error && error.message === "Invalid password." ? 401 : 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const formData = await request.formData();
    validateAdminPassword(text(formData, "password"));

    const kind = text(formData, "kind") as AdminKind;

    if (!allowedKinds.has(kind)) {
      throw new Error("種類は作品のみです。");
    }

    const branch = getBranch();
    const title = text(formData, "title");
    const author = text(formData, "author");
    const slug = normalizeSlug(text(formData, "slug"));
    const date = text(formData, "date");
    const description = text(formData, "description");
    const materials = optionalText(formData, "materials");
    const contentPath = text(formData, "contentPath");
    const contentSha = text(formData, "contentSha");
    const previousImagePath = text(formData, "imagePath");
    const previousImageSha = optionalText(formData, "imageSha");
    const currentImage = text(formData, "image");
    const replacementImage = formData.get("replacementImage");
    let image = currentImage;

    if (replacementImage instanceof File && replacementImage.size > 0) {
      const extension = allowedImageTypes.get(replacementImage.type);

      if (!extension) {
        throw new Error("画像はJPG、PNG、WebP、AVIFのいずれかにしてください。");
      }

      const nextImagePath = `public/images/${kind}/${slug}.${extension}`;
      image = `/images/${kind}/${slug}.${extension}`;

      if (nextImagePath !== previousImagePath) {
        await ensurePathDoesNotExist(nextImagePath, branch);
      }

      if (nextImagePath === previousImagePath && previousImageSha) {
        await updateGithubFile(
          nextImagePath,
          previousImageSha,
          toBase64(await replacementImage.arrayBuffer()),
          `Update image: ${title}`,
          branch
        );
      } else {
        await createGithubFile(
          nextImagePath,
          toBase64(await replacementImage.arrayBuffer()),
          `Update image: ${title}`,
          branch
        );
      }

      if (previousImageSha && previousImagePath !== nextImagePath) {
        await deleteGithubFile(previousImagePath, previousImageSha, `Remove old image: ${title}`, branch);
      }
    }

    const markdown = buildMarkdown({
      kind,
      title,
      author,
      slug,
      image,
      date,
      materials,
      description
    });

    await updateGithubFile(
      contentPath,
      contentSha,
      Buffer.from(markdown, "utf8").toString("base64"),
      `Update work: ${title}`,
      branch
    );

    return NextResponse.json({ message: "GitHubで更新しました。新しいコミットからVercelが再デプロイします。" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "作品を更新できませんでした。" },
      { status: error instanceof Error && error.message === "Invalid password." ? 401 : 400 }
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
      imagePath?: string;
      imageSha?: string;
    };

    validateAdminPassword(body.password ?? "");

    if (!body.contentPath || !body.contentSha) {
      throw new Error("本文ファイルとSHAが必要です。");
    }

    const branch = getBranch();
    const title = body.title || body.contentPath;

    if (body.imagePath && body.imageSha) {
      await deleteGithubFile(body.imagePath, body.imageSha, `Delete image: ${title}`, branch);
    }

    await deleteGithubFile(body.contentPath, body.contentSha, `Delete work: ${title}`, branch);

    return NextResponse.json({ message: "GitHubから削除しました。新しいコミットからVercelが再デプロイします。" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "作品を削除できませんでした。" },
      { status: error instanceof Error && error.message === "Invalid password." ? 401 : 400 }
    );
  }
}
