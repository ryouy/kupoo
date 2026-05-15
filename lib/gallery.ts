export type GalleryKind = "paintings";

export type GalleryItem = {
  kind: GalleryKind;
  title: string;
  author: string;
  slug: string;
  image: string;
  date: string;
  description: string;
  materials?: string;
};

export type GalleryNeighbor = Pick<GalleryItem, "slug" | "title"> | null;

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(date));
}
