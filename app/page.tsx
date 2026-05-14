import { About } from "@/components/landing/About";
import { FinalCta } from "@/components/landing/FinalCta";
import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Testimonials } from "@/components/landing/Testimonials";
import { WeeklySchedule } from "@/components/landing/WeeklySchedule";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <WeeklySchedule />
        <About />
        <Testimonials />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
