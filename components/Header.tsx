import Link from "next/link";

const navItems = [
  { href: "/paintings", label: "作品集" },
  { href: "/about", label: "KUPOOとは" },
  { href: "/members", label: "メンバー" },
  { href: "/contact", label: "連絡先" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b-4 border-ink bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:flex-nowrap sm:px-8">
        <Link
          href="/"
          className="flex rotate-[-2deg] items-center gap-2 border-4 border-ink bg-[#ffde59] px-3 py-1 text-lg font-black tracking-normal text-ink shadow-quiet transition hover:rotate-0"
          aria-label="KUPOO ホーム"
        >
          <img src="/favicon.svg" alt="" className="h-8 w-8" />
          KUPOO
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm font-bold text-muted">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-2 py-2 transition-colors hover:bg-[#57d4c4] hover:text-ink sm:px-3"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/admin" className="px-1.5 py-2 text-xs text-muted/70 transition-colors hover:text-ink sm:px-2">
            管理
          </Link>
          <a
            href="https://ryouyplayground.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="ml-1 border-2 border-ink bg-bone px-3 py-2 text-ink shadow-[3px_3px_0_#21180f] transition hover:-translate-y-0.5 sm:ml-2 sm:px-4"
          >
            プロフィール
          </a>
        </nav>
      </div>
    </header>
  );
}
