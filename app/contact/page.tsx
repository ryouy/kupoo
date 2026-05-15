import type { Metadata } from "next";
import { getSiteContent } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "連絡先"
};

export default function ContactPage() {
  const site = getSiteContent();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="mb-5 inline-block rotate-[-2deg] border-4 border-ink bg-[#57d4c4] px-4 py-2 text-sm font-black shadow-quiet">
        {site.contact.eyebrow}
      </p>
      <section className="border-4 border-ink bg-bone p-6 shadow-quiet sm:p-10">
        <h1 className="max-w-3xl text-5xl font-black leading-none text-ink sm:text-7xl">
          {site.contact.headline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg font-bold leading-9 text-muted">
          {site.contact.body}
        </p>
        <a
          href={site.contact.xUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-block border-4 border-ink bg-[#ffde59] px-6 py-4 text-xl font-black text-ink shadow-quiet transition hover:-translate-y-1"
        >
          X / Twitter: {site.contact.xHandle}
        </a>
      </section>
    </div>
  );
}
