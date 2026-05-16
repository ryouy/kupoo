import Link from "next/link";
import { GalleryCard } from "@/components/GalleryCard";
import { getLatestItems } from "@/lib/content";
import { getSiteContent } from "@/lib/site-data";

export default function Home() {
  const latestItems = getLatestItems(4);
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
          <div className="mt-9 flex flex-wrap gap-3 text-sm font-black">
            <Link
              href="/paintings"
              className="border-4 border-ink bg-[#ff5e8f] px-5 py-3 text-ink shadow-quiet transition hover:-translate-y-1"
            >
              {site.home.primaryCta}
            </Link>
            <Link
              href="/about"
              className="border-4 border-ink bg-bone px-5 py-3 text-ink shadow-quiet transition hover:-translate-y-1"
            >
              {site.home.secondaryCta}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="group relative col-span-2 overflow-hidden border-4 border-ink bg-bone shadow-quiet">
            <img
              src="/kupoo-logo.svg"
              alt="Kupoo公式ロゴ"
              className="h-full min-h-48 w-full object-cover"
            />
          </div>
          {latestItems.slice(0, 4).map((item, index) => (
            <Link
              key={item.slug}
              href={`/${item.kind}/${item.slug}`}
              className={`group relative overflow-hidden border-4 border-ink bg-bone shadow-quiet ${
                index === 0 || index === 3 ? "aspect-[4/5]" : "aspect-[5/4]"
              } ${index === 1 ? "rotate-2" : index === 2 ? "rotate-[-2deg]" : ""}`}
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

      <section className="border-y-4 border-ink bg-bone/80">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="mb-8 flex items-end justify-between gap-4 border-b-4 border-ink pb-5">
            <div>
              <p className="mb-3 text-sm font-black text-muted">{site.home.latestEyebrow}</p>
              <h2 className="text-3xl font-black tracking-normal text-ink sm:text-4xl">
                {site.home.latestTitle}
              </h2>
            </div>
            <Link href="/paintings" className="hidden text-sm font-black text-muted transition hover:text-ink sm:block">
              全部見る
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {latestItems.map((item) => (
              <GalleryCard key={`${item.kind}-${item.slug}`} item={item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
