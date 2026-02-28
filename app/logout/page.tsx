"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LogoutPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function doSignOut() {
      try {
        const { error } = await supabase.auth.signOut();
        if (!mounted) return;
        if (error) {
          setError(error.message);
          return;
        }
        // Redirect to login after signing out
        window.location.assign("/login");
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : String(err));
      }
    }

    doSignOut();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Signing out...</h1>
        <p className="mt-4 text-slate-600">If you are not redirected, click the link below.</p>
        {error ? (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        ) : null}
        <div className="mt-6">
          <Link href="/login" className="text-slate-900 underline">Go to sign in</Link>
        </div>
      </div>
    </main>
  );
}
