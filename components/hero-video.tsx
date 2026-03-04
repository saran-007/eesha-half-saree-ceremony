"use client";

import { EVENT } from "@/lib/constants";

export function HeroVideo() {
  return (
    <section className="relative w-full sparkle-bg">
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-10 pb-4 sm:pt-14 sm:pb-6">
        <h1 className="text-center font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-3 gold-shimmer animate-fade-in-up leading-tight">
          {EVENT.title}
        </h1>

        <div className="animate-fade-in-up-delay-2 mt-6">
          <div className="ornamental-border rounded-lg overflow-hidden shadow-2xl shadow-gold-500/10">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${EVENT.youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${EVENT.youtubeVideoId}&rel=0&modestbranding=1`}
                title="Eesha Half Saree Ceremony"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
