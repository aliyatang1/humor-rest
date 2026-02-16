import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");

  if (!code) {
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // We'll set cookies onto this response
  const redirectUrl = new URL("/", req.url);
  const res = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // ✅ THIS is the key: use req.cookies.getAll()
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  // If exchange fails, go back to login
  if (error) {
    const back = new URL("/login", req.url);
    return NextResponse.redirect(back);
  }

  return res;
}
