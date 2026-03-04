import { HeroVideo } from "@/components/hero-video";
import { EventDetails } from "@/components/event-details";
import { GoogleMap } from "@/components/google-map";
import { OrnamentalDivider } from "@/components/ornamental-divider";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-navy-950">
      <HeroVideo />
      <OrnamentalDivider />
      <EventDetails />
      <OrnamentalDivider />
      <GoogleMap />
      <Footer />
    </main>
  );
}
