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

type AdminSection = "works" | "posts" | "inquiries" | "site" | "members";

const adminSections = new Set<AdminSection>(["works", "posts", "inquiries", "site", "members"]);

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{ section?: string }>;
}) {
  const authorOptions = getMembers().map((member) => member.name);
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const githubUrl = owner && repo ? `https://github.com/${owner}/${repo}` : "https://github.com";
  const params = await searchParams;
  const section = params?.section;
  const initialSection = section && adminSections.has(section as AdminSection) ? section as AdminSection : undefined;

  return <AdminPageContent authors={authorOptions} githubUrl={githubUrl} initialSection={initialSection} />;
}
