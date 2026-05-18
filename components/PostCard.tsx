import Link from "next/link";
import { formatPostDate, getPostLabel, type PostItem } from "@/lib/posts";

export function PostCard({ item }: { item: PostItem }) {
  return (
    <Link href={`/${item.kind}/${item.slug}`} className="group block">
      <article className="border-4 border-ink bg-bone p-3 shadow-quiet transition duration-300 hover:-translate-y-1 hover:rotate-[-1deg]">
        <div className="aspect-[5/4] overflow-hidden border-2 border-ink bg-paper">
          {item.images[0] ? (
            <img
              src={item.images[0]}
              alt={item.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />
          ) : null}
        </div>
        <div className="space-y-2 pt-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-base font-black leading-7 text-ink">{item.title}</h2>
            <span className="shrink-0 border-2 border-ink bg-[#57d4c4] px-2 py-1 text-xs font-black text-ink">
              {getPostLabel(item.kind)}
            </span>
          </div>
          <p className="text-sm font-bold leading-6 text-muted">{formatPostDate(item.date)}</p>
        </div>
      </article>
    </Link>
  );
}
