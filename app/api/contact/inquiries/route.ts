import { NextResponse } from "next/server";
import { createInquiry, findVisitorInquiry } from "@/lib/contact-inquiries";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { nickname?: string; password?: string; body?: string };
    const nickname = clean(body.nickname);
    const password = clean(body.password);
    const text = clean(body.body);

    if (!nickname || !password || !text) {
      return NextResponse.json({ message: "ニックネーム、パスワード、本文を入力してください。" }, { status: 400 });
    }

    const inquiry = await createInquiry({ nickname, password, body: text });

    return NextResponse.json({ inquiry });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "問い合わせを送信できませんでした。" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const nickname = clean(url.searchParams.get("nickname"));
    const password = clean(url.searchParams.get("password"));

    if (!nickname || !password) {
      return NextResponse.json({ message: "ニックネーム、パスワードを入力してください。" }, { status: 400 });
    }

    const inquiry = await findVisitorInquiry({ nickname, password });

    return NextResponse.json({ inquiry });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "問い合わせを読み込めませんでした。" },
      { status: 500 }
    );
  }
}
