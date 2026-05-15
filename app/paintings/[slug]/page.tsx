import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArtworkDetail } from "@/components/ArtworkDetail";
import { getGalleryItem, getGalleryItems, getNeighbors } from "@/lib/content";
import { getMembers } from "@/lib/site-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getGalleryItems("paintings").map((item) => ({
    slug: item.slug
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getGalleryItem("paintings", slug);

  return {
    title: item?.title ?? "作品集"
  };
}

export default async function PaintingDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getGalleryItem("paintings", slug);

  if (!item) {
    notFound();
  }

  const { previous, next } = getNeighbors("paintings", item.slug);
  const authors = getMembers().map((member) => member.name);

  return <ArtworkDetail item={item} previous={previous} next={next} authors={authors} />;
}
