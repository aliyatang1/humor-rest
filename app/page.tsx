import ImageCard from "./ImageCard";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  }
);

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GalleryPage() {
  const { data: images, error } = await supabase
    .from("images")
    .select(`
      id,
      url,
      captions (
        id,
        content
      )
    `)
    .eq("is_public", true)
    .order("created_datetime_utc", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <pre className="text-red-500">{error.message}</pre>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black tracking-tight text-slate-900">
            HUMOR FEED
          </h1>
          <p className="mt-3 text-base text-slate-500">
            The internet’s quiet thoughts, out loud.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="h-[2px] w-16 rounded-full bg-slate-200" />
          </div>
        </header>

        {images && images.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <ImageCard key={image.id} image={image as any} />
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500">No public images available.</p>
        )}
      </div>
    </main>
  );
}
