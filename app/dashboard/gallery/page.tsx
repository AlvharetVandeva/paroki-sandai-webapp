import { getAllGalleries } from "@/services/gallery.service";
import { GalleryClient } from "./gallery-client";

export default async function GalleryPage() {
  const galleries = await getAllGalleries();
  return <GalleryClient galleries={galleries} />;
}
