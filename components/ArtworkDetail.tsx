import Link from "next/link";
import { DetailWorkAdmin } from "@/components/DetailWorkAdmin";
import { formatDate, type GalleryItem, type GalleryNeighbor } from "@/lib/gallery";

type DetailProps = {
  item: GalleryItem;
  previous: GalleryNeighbor;
  next: GalleryNeighbor;
  authors?: string[];
};

export function ArtworkDetail({ item, previous, next, authors = [] }: DetailProps) {
  return (
    <DetailFrame
      item={item}
      previous={previous}
      next={next}
      backHref="/paintings"
      backLabel="作品集へ戻る"
      dateLabel="制作日"
      authors={authors}
    />
  );
}

export function DetailFrame({
  item,
  previous,
  next,
  authors = [],
  backHref,
  backLabel,
  dateLabel
}: DetailProps & { backHref: string; backLabel: string; dateLabel: string }) {
  return (
    <article className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="mb-8">
        <Link href={backHref} className="border-2 border-ink bg-[#57d4c4] px-3 py-2 text-sm font-black text-ink shadow-[3px_3px_0_#21180f] transition hover:-translate-y-0.5">
          {backLabel}
        </Link>
      </div>

      <div className="mx-auto flex min-h-[58vh] items-center justify-center border-4 border-ink bg-bone p-3 shadow-quiet sm:p-6">
        <img
          src={item.image}
          alt={item.title}
          className="max-h-[78vh] w-auto max-w-full object-contain"
        />
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 py-10 sm:py-12 lg:grid-cols-[0.78fr_1fr]">
        <div>
        <p className="mb-3 w-fit border-2 border-ink bg-[#ffde59] px-3 py-1 text-sm font-black text-ink">
          作品
        </p>
        <h1 className="text-4xl font-black leading-tight tracking-normal text-ink sm:text-6xl">
          {item.title}
        </h1>
        </div>
        <div>
        <dl className="grid gap-4 border-y-4 border-ink bg-bone/70 px-4 py-5 text-sm font-bold leading-6 text-muted sm:grid-cols-2">
          <div>
            <dt className="mb-1 text-ink">製作者</dt>
            <dd>{item.author}</dd>
          </div>
          <div>
            <dt className="mb-1 text-ink">{dateLabel}</dt>
            <dd>{formatDate(item.date)}</dd>
          </div>
          {item.materials ? (
            <div>
              <dt className="mb-1 text-ink">画材</dt>
              <dd>{item.materials}</dd>
            </div>
          ) : null}
        </dl>
        <div className="prose-gallery mt-8 whitespace-pre-line border-4 border-ink bg-bone p-5 text-base font-bold leading-8 text-ink shadow-quiet">
          {item.description}
        </div>
        </div>
      </div>

      <DetailWorkAdmin item={item} backHref={backHref} authors={authors} />

      <nav className="mx-auto mt-6 grid max-w-5xl gap-3 border-t-4 border-ink pt-6 text-sm font-black sm:grid-cols-2">
        {previous ? (
          <Link href={`${backHref}/${previous.slug}`} className="text-muted transition hover:text-ink">
            前の作品: {previous.title}
          </Link>
        ) : (
          <span className="text-muted/60">前の作品はありません</span>
        )}
        {next ? (
          <Link
            href={`${backHref}/${next.slug}`}
            className="text-muted transition hover:text-ink sm:text-right"
          >
            次の作品: {next.title}
          </Link>
        ) : (
          <span className="text-muted/60 sm:text-right">次の作品はありません</span>
        )}
      </nav>
    </article>
  );
}
