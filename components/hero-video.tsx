"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { EVENT } from "@/lib/constants";

export function HeroVideo() {
  const [playing, setPlaying] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${EVENT.youtubeVideoId}/maxresdefault.jpg`;

  return (
    <section className="relative w-full">
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-10 pb-4 sm:pt-14 sm:pb-6">
        <h1
          className="text-center font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-3 leading-tight"
          style={{
            background:
              "linear-gradient(90deg, #c9973f 0%, #e0be6a 25%, #d4a843 50%, #e0be6a 75%, #c9973f 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 4s linear infinite",
          }}
        >
          {EVENT.title}
        </h1>

        <div className="mt-6">
          <div className="ornamental-border rounded-lg overflow-hidden shadow-2xl shadow-gold-500/10">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              {playing ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${EVENT.youtubeVideoId}?autoplay=1&loop=1&playlist=${EVENT.youtubeVideoId}&rel=0&modestbranding=1`}
                  title="Eesha Half Saree Ceremony"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button
                  onClick={() => setPlaying(true)}
                  className="absolute inset-0 w-full h-full group cursor-pointer"
                  aria-label="Play ceremony video"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailUrl}
                    alt="Eesha Half Saree Ceremony"
                    className="absolute inset-0 w-full h-full object-cover"
                    fetchPriority="high"
                  />
                  <div className="absolute inset-0 bg-navy-950/30 group-hover:bg-navy-950/10 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gold-500/90 group-hover:bg-gold-400 flex items-center justify-center transition-all group-hover:scale-110 shadow-lg shadow-gold-500/30">
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 text-navy-950 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
