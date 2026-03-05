"use client";

import { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { EVENT } from "@/lib/constants";

const VIDEO_URL = process.env.NEXT_PUBLIC_VIDEO_URL;

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [showUnmuteHint, setShowUnmuteHint] = useState(true);

  useEffect(() => {
    if (!showUnmuteHint) return;
    const timer = setTimeout(() => setShowUnmuteHint(false), 10000);
    return () => clearTimeout(timer);
  }, [showUnmuteHint]);

  function toggleMute() {
    if (videoRef.current) {
      const next = !muted;
      videoRef.current.muted = next;
      setMuted(next);
      if (!next) setShowUnmuteHint(false);
    }
  }

  if (!VIDEO_URL) {
    return <YouTubeFallback />;
  }

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
          <div className="ornamental-border rounded-lg overflow-hidden shadow-2xl shadow-gold-500/10 relative">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                preload="auto"
              >
                <source src={VIDEO_URL} type="video/mp4" />
              </video>

              {/* Unmute prompt - centered and prominent when muted */}
              {muted ? (
                <button
                  onClick={toggleMute}
                  className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer"
                  aria-label="Tap to hear the music"
                >
                  <div className="absolute inset-0 bg-navy-950/20" />
                  <div
                    className="relative flex flex-col items-center gap-3 px-8 py-5 sm:px-10 sm:py-6 bg-navy-950/70 backdrop-blur-md rounded-2xl border border-gold-500/40 shadow-2xl shadow-gold-500/20 transition-all hover:scale-105 hover:bg-navy-950/80"
                    style={{
                      animation: "float 3s ease-in-out infinite",
                    }}
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gold-500 flex items-center justify-center shadow-lg shadow-gold-500/40">
                      <Volume2 className="w-7 h-7 sm:w-8 sm:h-8 text-navy-950" />
                    </div>
                    <span className="text-gold-400 font-serif text-lg sm:text-xl font-semibold tracking-wide">
                      Tap to hear the music
                    </span>
                    <span className="text-cream-200/50 font-sans text-xs">
                      Classical flute instrumental
                    </span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={toggleMute}
                  className="absolute bottom-4 right-4 z-20 cursor-pointer"
                  aria-label="Mute video"
                >
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-navy-950/60 hover:bg-navy-950/80 text-cream-50 rounded-full font-sans text-sm transition-all backdrop-blur-sm">
                    <Volume2 className="w-4 h-4" />
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

function YouTubeFallback() {
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [started, setStarted] = useState(false);
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
              {started ? (
                <iframe
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${EVENT.youtubeVideoId}?autoplay=1&loop=1&playlist=${EVENT.youtubeVideoId}&rel=0&modestbranding=1`}
                  title="Eesha Half Saree Ceremony"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button
                  onClick={() => setStarted(true)}
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
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-navy-950 ml-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
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
