import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { fetchAppRole } from "@/lib/auth/role";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next") ?? "/dashboard";
  const next = nextRaw.startsWith("/") ? nextRaw : "/dashboard";

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Missing auth code")}`,
    );
  }

  const supabase = await createSupabaseRouteHandlerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = user ? await fetchAppRole(supabase, user.id) : null;
  const destination = role === "admin" ? "/admin" : next;
  return NextResponse.redirect(`${origin}${destination}`);
}
