import type { Metadata } from "next";
import { PostCard } from "@/components/PostCard";
import { getPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "活動記録"
};

export default function ActivitiesPage() {
  const items = getPosts("activities");

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="mb-7 grid items-center gap-4 border-b-4 border-ink pb-5 lg:grid-cols-2">
        <p className="w-fit rotate-[-1deg] border-4 border-ink bg-[#57d4c4] px-3 py-2 text-sm font-black text-ink shadow-quiet">Log / 01</p>
        <div className="lg:text-center">
          <h1 className="text-4xl font-black leading-none tracking-normal text-ink sm:text-6xl">活動記録</h1>
          <p className="mt-3 text-base font-bold leading-7 text-muted">
            描いた日、集まった日、なにか楽しかった日の写真と文章を置いておく場所です。
          </p>
        </div>
      </header>
      {items.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <PostCard key={item.slug} item={item} />
          ))}
        </div>
      ) : (
        <p className="border-4 border-ink bg-bone p-5 text-sm font-black text-muted shadow-quiet">活動記録はまだありません。</p>
      )}
    </div>
  );
}
