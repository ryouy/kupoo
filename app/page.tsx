import Link from "next/link";
import { getGalleryItems } from "@/lib/content";
import { getLatestNews } from "@/lib/posts";
import { getSiteContent } from "@/lib/site-data";

export const dynamic = "force-dynamic";

function pickRandomItems<T>(items: T[], limit: number) {
  return [...items]
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);
}

const randomFrameStyles = [
  "aspect-[4/5] sm:col-span-1",
  "aspect-[5/4] sm:col-span-1",
  "aspect-square sm:col-span-1",
  "aspect-[3/4] sm:col-span-1",
  "aspect-[6/5] sm:col-span-2",
  "aspect-[7/4] sm:col-span-2"
];

export default function Home() {
  const featuredCount = 4 + Math.floor(Math.random() * 4);
  const featuredItems = pickRandomItems(getGalleryItems("paintings"), featuredCount);
  const latestNews = getLatestNews(3);
  const site = getSiteContent();

  return (
    <div>
      <section className="mx-auto grid min-h-[calc(100vh-84px)] max-w-7xl items-start gap-10 px-5 pt-8 pb-10 sm:px-8 lg:grid-cols-[0.86fr_1.14fr] lg:pt-14 lg:pb-16">
        <div className="max-w-2xl pb-4">
          <p className="mb-5 inline-block rotate-[-1deg] border-4 border-ink bg-[#57d4c4] px-4 py-2 text-sm font-black text-ink shadow-quiet">
            {site.home.eyebrow}
          </p>
          <h1 className="max-w-xl text-6xl font-black leading-none tracking-normal text-ink sm:text-8xl lg:text-9xl">
            {site.home.title}
          </h1>
          <p className="mt-6 max-w-xl text-2xl font-black leading-tight text-ink sm:text-3xl">
            {site.home.tagline}
          </p>
          <p className="mt-5 max-w-lg text-base font-bold leading-8 text-muted">
            {site.home.description}
          </p>
          <div className="mt-9 w-fit max-w-full">
            <div className="flex flex-wrap gap-3 text-sm font-black">
              <Link
                href="/paintings"
                className="kupoo-wobble-button inline-block rotate-[-2deg] border-4 border-ink bg-[#ff5e8f] px-5 py-3 text-ink shadow-quiet transition hover:-translate-y-1"
              >
                {site.home.primaryCta}
              </Link>
              <Link
                href="/about"
                className="kupoo-wobble-button inline-block rotate-[2deg] border-4 border-ink bg-[#ffde59] px-5 py-3 text-ink shadow-quiet transition hover:-translate-y-1"
              >
                {site.home.secondaryCta}
              </Link>
            </div>
          </div>
          <section className="mt-8 max-w-xl border-4 border-ink bg-bone/85 p-4 shadow-quiet">
            <div className="mb-3 flex items-end justify-between gap-3 border-b-2 border-ink pb-3">
              <div>
                <p className="text-xs font-black text-muted">News</p>
                <h2 className="text-xl font-black text-ink">最新のお知らせ</h2>
              </div>
              <Link href="/news" className="shrink-0 text-xs font-black text-muted transition hover:text-ink">
                全部見る
              </Link>
            </div>
            {latestNews.length > 0 ? (
              <div className="grid gap-2">
                {latestNews.map((item) => (
                  <Link
                    key={`${item.kind}-${item.slug}`}
                    href={`/${item.kind}/${item.slug}`}
                    className="grid gap-1 border-2 border-ink bg-paper px-3 py-2 transition hover:-translate-y-0.5 hover:bg-[#ffde59]"
                  >
                    <span className="text-sm font-black leading-6 text-ink">{item.title}</span>
                    <span className="text-xs font-bold text-muted">{item.date}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm font-black text-muted">お知らせはまだありません。</p>
            )}
          </section>
        </div>

        <div className="grid grid-cols-2 auto-rows-auto gap-3 sm:gap-4">
          <div className="floating-art floating-art-logo group relative col-span-2 overflow-hidden border-4 border-ink bg-bone shadow-quiet">
            <img
              src="/kupoo-logo.svg"
              alt="Kupoo公式ロゴ"
              className="h-full min-h-48 w-full object-cover"
            />
          </div>
          {featuredItems.map((item, index) => (
            <Link
              key={item.slug}
              href={`/${item.kind}/${item.slug}`}
              className={`floating-art floating-art-${(index % 4) + 1} group relative overflow-hidden border-4 border-ink bg-bone shadow-quiet ${randomFrameStyles[Math.floor(Math.random() * randomFrameStyles.length)]}`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
