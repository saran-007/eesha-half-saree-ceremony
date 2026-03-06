import { HeroVideo } from "@/components/hero-video";
import { EventDetails } from "@/components/event-details";
import { AddToCalendar } from "@/components/add-to-calendar";
import { GoogleMap } from "@/components/google-map";
import { OrnamentalDivider } from "@/components/ornamental-divider";
import { Footer } from "@/components/footer";
import { SelfRsvpClient } from "./client";
import { EVENT } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `RSVP | ${EVENT.title}`,
  description: `RSVP for ${EVENT.title} on ${EVENT.date}`,
};

export default function SelfRsvpPage() {
  return (
    <main className="min-h-screen bg-navy-950">
      <HeroVideo />
      <OrnamentalDivider />
      <EventDetails />

      <section className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-navy-900/60 backdrop-blur-sm rounded-xl ornamental-border p-6 sm:p-10">
          <SelfRsvpClient />
        </div>
      </section>

      <AddToCalendar />
      <OrnamentalDivider />
      <GoogleMap />
      <Footer />
    </main>
  );
}
