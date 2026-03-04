"use client";

import { Calendar, Clock, MapPin } from "lucide-react";
import { EVENT } from "@/lib/constants";

export function EventDetails() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-8 sm:py-12 animate-fade-in-up-delay-3">
      <div className="bg-navy-900/60 backdrop-blur-sm rounded-xl ornamental-border p-6 sm:p-10">
        <h2 className="font-serif text-3xl sm:text-4xl text-center text-gold-400 mb-8">
          Event Details
        </h2>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-gold-500/15 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <p className="text-cream-200 text-sm font-sans uppercase tracking-wider mb-1">
                Date
              </p>
              <p className="text-cream-50 text-lg sm:text-xl font-serif font-medium">
                {EVENT.date}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-gold-500/15 flex items-center justify-center">
              <Clock className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <p className="text-cream-200 text-sm font-sans uppercase tracking-wider mb-1">
                Time
              </p>
              <p className="text-cream-50 text-lg sm:text-xl font-serif font-medium">
                {EVENT.time}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-gold-500/15 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <p className="text-cream-200 text-sm font-sans uppercase tracking-wider mb-1">
                Venue
              </p>
              <p className="text-cream-50 text-lg sm:text-xl font-serif font-medium">
                {EVENT.venue}
              </p>
              <p className="text-cream-200 text-base mt-1">
                {EVENT.address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
