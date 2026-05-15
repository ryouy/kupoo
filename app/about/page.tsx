import type { Metadata } from "next";
import Link from "next/link";
import { getSiteContent } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "KUPOOとは"
};

export default function AboutPage() {
  const site = getSiteContent();

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <section className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
        <div>
          <p className="mb-5 inline-block rotate-[-2deg] border-4 border-ink bg-[#ffde59] px-4 py-2 text-sm font-black shadow-quiet">
            {site.about.eyebrow}
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-none text-ink sm:text-7xl">
            {site.about.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-bold leading-9 text-muted">
            {site.about.body}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-black">
            <Link href="/paintings" className="border-4 border-ink bg-[#ff5e8f] px-5 py-3 text-ink shadow-quiet transition hover:-translate-y-1">
              作品を見る
            </Link>
            <Link href="/contact" className="border-4 border-ink bg-bone px-5 py-3 text-ink shadow-quiet transition hover:-translate-y-1">
              連絡する
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {site.about.facts.map((fact, index) => (
            <div
              key={fact.label}
              className={`border-4 border-ink bg-bone p-5 shadow-quiet ${index % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]"}`}
            >
              <p className="mb-2 text-xs font-black text-muted">{fact.label}</p>
              <p className="text-xl font-black leading-8 text-ink">{fact.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-5 md:grid-cols-3">
        <div className="border-4 border-ink bg-[#57d4c4] p-6 shadow-quiet md:col-span-2">
          <h2 className="text-3xl font-black text-ink">{site.about.vibeTitle}</h2>
          <p className="mt-4 text-base font-bold leading-8 text-ink">
            {site.about.vibeBody}
          </p>
        </div>
        <div className="border-4 border-ink bg-[#ff5e8f] p-6 shadow-quiet">
          <p className="text-sm font-black text-ink">{site.about.jokeLabel}</p>
          <p className="mt-4 text-2xl font-black leading-tight text-ink">
            {site.about.joke}
          </p>
        </div>
      </section>
    </div>
  );
}
