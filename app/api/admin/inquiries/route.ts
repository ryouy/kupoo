import { NextResponse } from "next/server";
import { deleteInquiry, listInquiries, readInquiry, summarizeInquiry, toPublicInquiry } from "@/lib/contact-inquiries";
import { validateAdminPassword } from "@/lib/github-admin";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const password = clean(url.searchParams.get("password"));
    const id = clean(url.searchParams.get("id"));

    validateAdminPassword(password);

    if (id) {
      const { inquiry } = await readInquiry(id);

      return NextResponse.json({ inquiry: toPublicInquiry(inquiry) });
    }

    const inquiries = await listInquiries();

    return NextResponse.json({ inquiries: inquiries.map(summarizeInquiry) });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "問い合わせを読み込めませんでした。" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { password?: string; id?: string };
    const password = clean(body.password);
    const id = clean(body.id);

    validateAdminPassword(password);

    if (!id) {
      return NextResponse.json({ message: "問い合わせを選んでください。" }, { status: 400 });
    }

    await deleteInquiry(id);

    return NextResponse.json({ message: "問い合わせチャットを削除しました。" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "問い合わせを削除できませんでした。" },
      { status: 500 }
    );
  }
}
