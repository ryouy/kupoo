import type { Metadata } from "next";
import { getMembers, getSiteContent } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "メンバー"
};

export default function MembersPage() {
  const site = getSiteContent();
  const members = getMembers();

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="mb-7 border-b-4 border-ink pb-5">
        <p className="mb-4 inline-block rotate-[-2deg] border-4 border-ink bg-[#ff5e8f] px-4 py-2 text-sm font-black text-ink shadow-quiet">
          {site.members.eyebrow}
        </p>
        <h1 className="text-4xl font-black leading-none text-ink sm:text-6xl">
          {site.members.headline}
        </h1>
        <p className="mt-3 max-w-2xl text-base font-bold leading-7 text-muted">
          {site.members.body}
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {members.map((member, index) => (
          <article
            key={member.name}
            className={`border-4 border-ink bg-bone p-5 shadow-quiet ${index % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]"}`}
          >
            <div className="grid gap-5 sm:grid-cols-[128px_1fr]">
              <img
                src={member.image}
                alt={`${member.name}の仮アイコン`}
                className="aspect-square w-32 border-4 border-ink bg-paper object-cover"
              />
              <div>
                <p className="text-3xl font-black text-ink">{member.name}</p>
                <p className="mt-2 text-sm font-black leading-7 text-muted">{member.role}</p>
                <p className="mt-4 text-base font-bold leading-8 text-ink">{member.comment}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
