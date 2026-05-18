import Link from "next/link";
import { getGalleryItems } from "@/lib/content";
import { formatPostDate, getPostLabel, type PostItem, type PostNeighbor } from "@/lib/posts";

export function PostDetail({
  item,
  previous,
  next
}: {
  item: PostItem;
  previous: PostNeighbor;
  next: PostNeighbor;
}) {
  const label = getPostLabel(item.kind);
  const backHref = `/${item.kind}`;
  const workByImage = new Map(getGalleryItems("paintings").map((work) => [work.image, work]));

  return (
    <article className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="mb-8">
        <Link href={backHref} className="border-2 border-ink bg-[#57d4c4] px-3 py-2 text-sm font-black text-ink shadow-[3px_3px_0_#21180f] transition hover:-translate-y-0.5">
          {label}へ戻る
        </Link>
      </div>

      <header className="mb-6 border-b-4 border-ink pb-5">
        <p className="mb-3 w-fit border-2 border-ink bg-[#ffde59] px-3 py-1 text-sm font-black text-ink">
          {label}
        </p>
        <h1 className="max-w-4xl text-3xl font-black leading-tight text-ink sm:text-5xl">{item.title}</h1>
        <p className="mt-3 text-sm font-black text-muted">{formatPostDate(item.date)}</p>
      </header>

      {item.images.length > 0 ? (
        <div className="mx-auto mb-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {item.images.map((image, index) => {
            const work = workByImage.get(image);
            const className = "overflow-hidden border-4 border-ink bg-bone p-2 shadow-quiet";
            const imageElement = <img src={image} alt={work?.title ?? ""} className="aspect-[4/3] w-full object-cover" />;

            return (
              <figure key={`${image}-${index}`} className={className}>
                {work ? (
                  <Link href={`/paintings/${work.slug}`} className="block transition hover:scale-[1.01]">
                    {imageElement}
                  </Link>
                ) : (
                  imageElement
                )}
              </figure>
            );
          })}
        </div>
      ) : null}

      <div className="prose-gallery mx-auto max-w-4xl whitespace-pre-line border-4 border-ink bg-bone p-5 text-base font-bold leading-8 text-ink shadow-quiet">
        {item.description}
      </div>

      <nav className="mx-auto mt-8 grid max-w-4xl gap-3 border-t-4 border-ink pt-6 text-sm font-black sm:grid-cols-2">
        {previous ? (
          <Link href={`${backHref}/${previous.slug}`} className="text-muted transition hover:text-ink">
            前の記事: {previous.title}
          </Link>
        ) : (
          <span className="text-muted/60">前の記事はありません</span>
        )}
        {next ? (
          <Link href={`${backHref}/${next.slug}`} className="text-muted transition hover:text-ink sm:text-right">
            次の記事: {next.title}
          </Link>
        ) : (
          <span className="text-muted/60 sm:text-right">次の記事はありません</span>
        )}
      </nav>
    </article>
  );
}
