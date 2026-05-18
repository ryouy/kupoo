import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/PostDetail";
import { getPost, getPostNeighbors, getPosts } from "@/lib/posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPosts("news").map((item) => ({
    slug: item.slug
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getPost("news", slug);

  return {
    title: item?.title ?? "お知らせ"
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getPost("news", slug);

  if (!item) {
    notFound();
  }

  const { previous, next } = getPostNeighbors("news", item.slug);

  return <PostDetail item={item} previous={previous} next={next} />;
}
