import { NextResponse } from "next/server";
import { listAdminHistory, validateAdminPassword } from "@/lib/github-admin";

export const runtime = "nodejs";

function passwordFromRequest(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("password") ?? "";
}

export async function GET(request: Request) {
  try {
    validateAdminPassword(passwordFromRequest(request));
    return NextResponse.json({ history: await listAdminHistory() });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "編集履歴を読み込めませんでした。" },
      { status: error instanceof Error && error.message === "Invalid password." ? 401 : 400 }
    );
  }
}
