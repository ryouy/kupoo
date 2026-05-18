import Link from "next/link";

const navItems = [
  { href: "/about", label: "Kupooとは", tilt: "rotate-[1deg]", bg: "bg-[#ffde59]", hover: "hover:bg-[#ffd22e]" },
  { href: "/paintings", label: "作品集", tilt: "rotate-[-1deg]", bg: "bg-[#57d4c4]", hover: "hover:bg-[#35c7b4]" },
  { href: "/news", label: "お知らせ", tilt: "rotate-[-1deg]", bg: "bg-[#b8ff6a]", hover: "hover:bg-[#9df33d]" },
  { href: "/members", label: "メンバー", tilt: "rotate-[-2deg]", bg: "bg-[#ff8fbc]", hover: "hover:bg-[#ff5e8f]" },
  { href: "/contact", label: "連絡先", tilt: "rotate-[2deg]", bg: "bg-[#d7c8ff]", hover: "hover:bg-[#c5adff]" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b-4 border-ink bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:flex-nowrap sm:px-8">
        <Link
          href="/"
          className="flex rotate-[-2deg] items-center gap-2 border-4 border-ink bg-[#ffde59] px-3 py-1 text-lg font-black tracking-normal text-ink shadow-quiet transition hover:rotate-0"
          aria-label="Kupoo ホーム"
        >
          <img src="/favicon.svg" alt="" className="h-8 w-8" />
          Kupoo
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm font-black text-ink">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`border-2 border-ink px-3 py-2 shadow-[3px_3px_0_#21180f] transition hover:-translate-y-1 hover:rotate-0 hover:shadow-[5px_5px_0_#21180f] ${item.tilt} ${item.bg} ${item.hover}`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/admin" className="rotate-[-1deg] border-2 border-ink bg-bone px-3 py-2 text-xs text-muted shadow-[3px_3px_0_#21180f] transition hover:-translate-y-1 hover:rotate-0 hover:bg-[#d7c8ff] hover:text-ink hover:shadow-[5px_5px_0_#21180f]">
            管理
          </Link>
        </nav>
      </div>
    </header>
  );
}
