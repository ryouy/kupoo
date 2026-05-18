import { NextResponse } from "next/server";
import {
  allowedImageTypes,
  createGithubFile,
  getBranch,
  normalizeSlug,
  toBase64,
  validateAdminPassword
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

    const name = field(formData, "name");
    const image = formData.get("image");

    if (!(image instanceof File) || image.size === 0) {
      throw new Error("アイコン画像を選んでください。");
    }

    const extension = allowedImageTypes.get(image.type);

    if (!extension) {
      throw new Error("画像はJPG、PNG、WebP、AVIFのいずれかにしてください。");
    }

    const branch = getBranch();
    let slug = "member";

    try {
      slug = normalizeSlug(name);
    } catch {
      slug = "member";
    }
    const stamp = Date.now();
    const imagePath = `public/images/members/${slug}-${stamp}.${extension}`;
    const publicImagePath = `/images/members/${slug}-${stamp}.${extension}`;

    await createGithubFile(
      imagePath,
      toBase64(await image.arrayBuffer()),
      `Add member image: ${name}`,
      branch
    );

    return NextResponse.json({
      message: "画像をGitHubに保存しました。最後にメンバー情報を保存してください。",
      image: publicImagePath
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "画像を保存できませんでした。" },
      { status: 400 }
    );
  }
}
