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
  return <AdminHistoryPageContent />;
}
