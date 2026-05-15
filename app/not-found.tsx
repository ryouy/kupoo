import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-5 py-20 sm:px-8">
      <p className="mb-4 text-xs uppercase tracking-[0.22em] text-muted">404</p>
      <h1 className="text-4xl font-semibold uppercase leading-none tracking-normal text-ink sm:text-6xl">
        ページが見つかりません
      </h1>
      <p className="mt-6 max-w-xl text-sm uppercase leading-7 tracking-[0.12em] text-muted">
        作品が引っ越したか、URLがちょっと迷子になっているかもしれません。
      </p>
      <Link
        href="/"
        className="mt-8 w-fit border border-ink px-5 py-3 text-xs uppercase tracking-[0.16em] text-ink transition hover:bg-ink hover:text-bone"
      >
        ホームへ戻る
      </Link>
    </section>
  );
}
