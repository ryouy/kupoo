import type { Metadata } from "next";
import { GalleryGrid } from "@/components/GalleryGrid";
import { getGalleryItems } from "@/lib/content";
import { getMembers } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "作品集"
};

export default function PaintingsPage() {
  const items = getGalleryItems("paintings");
  const authors = getMembers().map((member) => member.name);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="mb-10 grid gap-6 border-b-4 border-ink pb-8 lg:grid-cols-[0.7fr_1fr]">
        <p className="w-fit rotate-[-1deg] border-4 border-ink bg-[#57d4c4] px-3 py-2 text-sm font-black text-ink shadow-quiet">Archive / 01</p>
        <div>
        <h1 className="text-5xl font-black leading-none tracking-normal text-ink sm:text-7xl">
          作品集
        </h1>
        <p className="mt-4 max-w-2xl text-base font-bold leading-8 text-muted">
          Kupooメンバーの絵がずらっと並ぶ場所。公開順でもランダムでも、気分でどうぞ。
        </p>
        </div>
      </header>
      <GalleryGrid items={items} kind="paintings" authors={authors} />
    </div>
  );
}
