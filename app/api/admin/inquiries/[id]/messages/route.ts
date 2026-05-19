import { NextResponse } from "next/server";
import { appendInquiryMessage } from "@/lib/contact-inquiries";
import { validateAdminPassword } from "@/lib/github-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { password?: string; body?: string };
    const password = clean(body.password);
    const text = clean(body.body);

    validateAdminPassword(password);

    if (!id || !text) {
      return NextResponse.json({ message: "返信内容を入力してください。" }, { status: 400 });
    }

    const inquiry = await appendInquiryMessage({
      id,
      sender: "admin",
      body: text
    });

    return NextResponse.json({ inquiry });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "返信できませんでした。" },
      { status: 500 }
    );
  }
}
