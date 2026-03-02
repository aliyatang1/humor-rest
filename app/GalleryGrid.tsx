"use client";

import React, { useMemo, useState } from "react";
import ImageCard from "./ImageCard";

type Caption = { id: string; content?: string | null; text?: string | null };
type ImageRow = {
  id: string;
  url: string;
  captions?: Caption[];
};

type CaptionItem = { id: string; text: string };

export default function GalleryGrid({ images }: { images: ImageRow[] }) {
  // Normalize captions and drop empties once per render
  const normalized = useMemo(() => {
    return (images ?? [])
      .map((img) => {
        const caps = Array.isArray(img.captions) ? img.captions : [];
        const cleaned: CaptionItem[] = caps
          .map((c) => {
            const text = (c.content ?? (c as any).text ?? "").toString().trim();
            return { id: c.id, text };
          })
          .filter((c) => c.text.length > 0);

        return { id: img.id, url: img.url, captions: cleaned };
      })
      .filter((img) => img.url && img.captions.length > 0);
  }, [images]);

  // For each image, which caption index is currently "on top"
  const [idxByImage, setIdxByImage] = useState<Record<string, number>>({});

  const advanceStack = (imageId: string) => {
    setIdxByImage((prev) => {
      const current = prev[imageId] ?? 0;
      return { ...prev, [imageId]: current + 1 };
    });
  };

  // Build the list of tiles that still have remaining captions
  const visibleTiles = useMemo(() => {
    return normalized
      .map((img) => {
        const idx = idxByImage[img.id] ?? 0;
        const caption = img.captions[idx];
        if (!caption) return null; // stack finished -> remove tile
        return { imageId: img.id, url: img.url, caption, idx, total: img.captions.length };
      })
      .filter(Boolean) as Array<{
      imageId: string;
      url: string;
      caption: CaptionItem;
      idx: number;
      total: number;
    }>;
  }, [normalized, idxByImage]);

  return visibleTiles.length > 0 ? (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {visibleTiles.map((tile) => (
        <ImageCard
          key={`${tile.imageId}:${tile.caption.id}`}
          item={{ imageId: tile.imageId, url: tile.url, caption: tile.caption }}
          onVoted={() => advanceStack(tile.imageId)}
          progress={{ current: tile.idx + 1, total: tile.total }}
        />
      ))}
    </div>
  ) : (
    <p className="text-center text-slate-500">No public images available.</p>
  );
}
