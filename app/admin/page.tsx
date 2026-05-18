import type { Metadata } from "next";
import { AdminPageContent } from "@/components/AdminPageContent";
import { getMembers } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "管理",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  const authorOptions = getMembers().map((member) => member.name);

  return <AdminPageContent authors={authorOptions} />;
}
