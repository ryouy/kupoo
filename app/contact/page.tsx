import type { Metadata } from "next";
import { ContactInquiryArea } from "@/components/ContactInquiryArea";
import { getSiteContent } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "連絡先"
};

export default function ContactPage() {
  const site = getSiteContent();

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-5 py-8 sm:px-8 sm:py-10">
      <p className="mb-4 inline-block rotate-[-2deg] border-4 border-ink bg-[#57d4c4] px-4 py-2 text-sm font-black shadow-quiet">
        {site.contact.eyebrow}
      </p>
      <section className="border-4 border-ink bg-bone p-5 shadow-quiet sm:p-6">
        <h1 className="max-w-3xl text-4xl font-black leading-none text-ink sm:text-6xl">
          {site.contact.headline}
        </h1>
        <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-muted">
          {site.contact.body}
        </p>
      </section>
      <ContactInquiryArea />
      <section className="border-4 border-ink bg-[#ffde59] p-5 shadow-quiet sm:p-6">
        <p className="text-sm font-black text-muted">Xでもどうぞ</p>
        <a
          href={site.contact.xUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block border-4 border-ink bg-bone px-5 py-3 text-lg font-black text-ink shadow-quiet transition hover:-translate-y-1"
        >
          X / Twitter: {site.contact.xHandle}
        </a>
      </section>
    </div>
  );
}
