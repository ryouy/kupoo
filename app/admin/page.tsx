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
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const githubUrl = owner && repo ? `https://github.com/${owner}/${repo}` : "https://github.com";

  return <AdminPageContent authors={authorOptions} githubUrl={githubUrl} />;
}
