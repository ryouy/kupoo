import type { Metadata } from "next";
import { AdminHistoryPageContent } from "@/components/AdminHistoryPageContent";

export const metadata: Metadata = {
  title: "編集履歴",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminHistoryPage() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const githubUrl = owner && repo ? `https://github.com/${owner}/${repo}` : "https://github.com";

  return <AdminHistoryPageContent githubUrl={githubUrl} />;
}
