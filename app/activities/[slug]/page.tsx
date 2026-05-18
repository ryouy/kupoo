import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/PostDetail";
import { getPost, getPostNeighbors, getPosts } from "@/lib/posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPosts("activities").map((item) => ({
    slug: item.slug
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getPost("activities", slug);

  return {
    title: item?.title ?? "活動記録"
  };
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getPost("activities", slug);

  if (!item) {
    notFound();
  }

  const { previous, next } = getPostNeighbors("activities", item.slug);

  return <PostDetail item={item} previous={previous} next={next} />;
}
