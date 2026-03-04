"use client";

import { Navigation } from "lucide-react";
import { EVENT } from "@/lib/constants";

export function GoogleMap() {
  return (
    <section className="max-w-3xl mx-auto px-4 pb-12 sm:pb-16">
      <div className="rounded-xl overflow-hidden ornamental-border">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${EVENT.googleMapsEmbedQuery}&zoom=15`}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Venue Location"
          />
        </div>
      </div>

      <div className="mt-6 text-center">
        <a
          href={EVENT.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gold-500 hover:bg-gold-400 text-navy-950 font-sans font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/30 hover:scale-105"
        >
          <Navigation className="w-5 h-5" />
          Get Directions
        </a>
      </div>
    </section>
  );
}
