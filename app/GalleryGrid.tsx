"use client";

import ImageCard from "./ImageCard";

type Caption = { id: string; content: string };
type ImageRow = {
  id: string;
  url: string;
  captions?: Caption[];
};

export default function GalleryGrid({ images }: { images: ImageRow[] }) {
  return images && images.length > 0 ? (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image) => (
        <ImageCard key={image.id} image={image} />
      ))}
    </div>
  ) : (
    <p className="text-center text-slate-500">No public images available.</p>
  );
}
