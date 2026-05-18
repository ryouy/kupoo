import Link from "next/link";
import { formatDate, type GalleryItem } from "@/lib/gallery";

export function GalleryCard({ item }: { item: GalleryItem }) {
  const href = `/${item.kind}/${item.slug}`;

  return (
    <Link href={href} className="group block">
      <article className="border-4 border-ink bg-bone p-3 shadow-quiet transition duration-300 hover:-translate-y-1 hover:rotate-[-1deg]">
        <div className="aspect-[4/5] overflow-hidden border-2 border-ink bg-paper sm:aspect-[5/6]">
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        </div>
        <div className="space-y-2 pt-4">
          <h2 className="text-base font-black leading-7 text-ink">
            {item.title}
          </h2>
          <p className="text-sm font-black leading-6 text-ink">作者: {item.author}</p>
          <p className="text-sm font-bold leading-6 text-muted">{formatDate(item.date)}</p>
        </div>
      </article>
    </Link>
  );
}
