import Link from "next/link";

const navItems = [
  { href: "/paintings", label: "作品集", tilt: "rotate-[-1deg]", hover: "hover:bg-[#57d4c4]" },
  { href: "/about", label: "KUPOOとは", tilt: "rotate-[1deg]", hover: "hover:bg-[#ffde59]" },
  { href: "/members", label: "メンバー", tilt: "rotate-[-2deg]", hover: "hover:bg-[#ff5e8f]" },
  { href: "/contact", label: "連絡先", tilt: "rotate-[2deg]", hover: "hover:bg-[#b8ff6a]" }
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
        <nav className="flex flex-wrap items-center gap-2 text-sm font-black text-ink">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`border-2 border-ink bg-bone px-3 py-2 shadow-[3px_3px_0_#21180f] transition hover:-translate-y-0.5 hover:rotate-0 ${item.tilt} ${item.hover}`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/admin" className="rotate-[-1deg] border-2 border-ink bg-bone px-3 py-2 text-xs text-muted shadow-[3px_3px_0_#21180f] transition hover:-translate-y-0.5 hover:rotate-0 hover:bg-[#d7c8ff] hover:text-ink">
            管理
          </Link>
        </nav>
      </div>
    </header>
  );
}
