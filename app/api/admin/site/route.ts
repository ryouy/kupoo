import { NextResponse } from "next/server";
import {
  createGithubFile,
  getAdminSiteData,
  getBranch,
  updateGithubFile,
  validateAdminPassword
} from "@/lib/github-admin";
import type { Member, SiteContent } from "@/lib/site-data";

export const runtime = "nodejs";

function passwordFromRequest(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("password") ?? "";
}

function jsonBase64(value: unknown) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8").toString("base64");
}

function assertString(value: unknown, name: string) {
  if (typeof value !== "string") {
    throw new Error(`${name} は文字列で入力してください。`);
  }
}

function validateSite(value: SiteContent) {
  assertString(value.home.eyebrow, "トップのラベル");
  assertString(value.home.title, "トップのタイトル");
  assertString(value.home.tagline, "トップのキャッチコピー");
  assertString(value.about.headline, "紹介ページの見出し");
  assertString(value.contact.xUrl, "X / Twitter URL");

  if (!Array.isArray(value.about.facts)) {
    throw new Error("紹介ページの基本情報が壊れています。");
  }
}

function validateMembers(value: Member[]) {
  if (!Array.isArray(value)) {
    throw new Error("メンバー情報が配列ではありません。");
  }

  for (const member of value) {
    assertString(member.name, "メンバー名");
    assertString(member.role, "メンバーの役割");
    assertString(member.comment, "メンバーコメント");
    assertString(member.image, "メンバー画像");
  }
}

export async function GET(request: Request) {
  try {
    validateAdminPassword(passwordFromRequest(request));
    return NextResponse.json(await getAdminSiteData());
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "サイト情報を読み込めませんでした。" },
      { status: error instanceof Error && error.message === "Invalid password." ? 401 : 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      password?: string;
      site?: SiteContent;
      siteSha?: string;
      members?: Member[];
      membersSha?: string;
    };

    validateAdminPassword(body.password ?? "");

    if (!body.site || !body.members) {
      throw new Error("サイト情報とメンバー情報が必要です。");
    }

    validateSite(body.site);
    validateMembers(body.members);

    const branch = getBranch();
    const siteContent = jsonBase64(body.site);
    const membersContent = jsonBase64(body.members);

    if (body.siteSha) {
      await updateGithubFile("content/site.json", body.siteSha, siteContent, "Update site text", branch);
    } else {
      await createGithubFile("content/site.json", siteContent, "Create site text", branch);
    }

    if (body.membersSha) {
      await updateGithubFile("content/members.json", body.membersSha, membersContent, "Update members", branch);
    } else {
      await createGithubFile("content/members.json", membersContent, "Create members", branch);
    }

    return NextResponse.json({ message: "サイト情報をGitHubで更新しました。Vercelが再デプロイします。" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "サイト情報を更新できませんでした。" },
      { status: error instanceof Error && error.message === "Invalid password." ? 401 : 400 }
    );
  }
}
