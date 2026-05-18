import { NextResponse } from "next/server";
import {
  buildMarkdown,
  createGithubFile,
  getAdminSiteData,
  getBranch,
  listAdminWorks,
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

function getRenamedMembers(previousMembers: Member[] | undefined, members: Member[]) {
  if (!Array.isArray(previousMembers)) {
    return [];
  }

  return previousMembers
    .map((previousMember, index) => {
      const nextMember = members[index];

      if (!nextMember) {
        return null;
      }

      const before = previousMember.name.trim();
      const after = nextMember.name.trim();

      if (!before || !after || before === after) {
        return null;
      }

      return { before, after };
    })
    .filter((rename): rename is { before: string; after: string } => rename !== null);
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
      previousMembers?: Member[];
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
    const renamedMembers = getRenamedMembers(body.previousMembers, body.members);

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

    if (renamedMembers.length > 0) {
      const works = await listAdminWorks();

      for (const work of works) {
        const rename = renamedMembers.find((item) => item.before === work.author);

        if (!rename) {
          continue;
        }

        const markdown = buildMarkdown({
          kind: work.kind,
          title: work.title,
          author: rename.after,
          slug: work.slug,
          image: work.image,
          date: work.date,
          materials: work.materials,
          description: work.description
        });

        await updateGithubFile(
          work.contentPath,
          work.contentSha,
          Buffer.from(markdown, "utf8").toString("base64"),
          `Update work author: ${work.title}`,
          branch
        );
      }
    }

    return NextResponse.json({ message: "保存しました。新しいコミットからVercelが再デプロイします。" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "サイト情報を更新できませんでした。" },
      { status: error instanceof Error && error.message === "Invalid password." ? 401 : 400 }
    );
  }
}
