import { About } from "@/components/landing/About";
import { FinalCta } from "@/components/landing/FinalCta";
import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Testimonials } from "@/components/landing/Testimonials";
import { WeeklySchedule } from "@/components/landing/WeeklySchedule";
import { loadPublicOccurrences } from "@/lib/sessions/public-occurrences-load";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const occurrences = await loadPublicOccurrences(supabase);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <WeeklySchedule occurrences={occurrences} isLoggedIn={Boolean(user)} />
        <About />
        <Testimonials />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
