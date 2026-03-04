"use client";

import { CalendarPlus } from "lucide-react";
import { EVENT } from "@/lib/constants";

export function AddToCalendar() {
  function generateIcsUrl() {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Eesha Half Saree Ceremony//EN",
      "BEGIN:VEVENT",
      "DTSTART:20260329T160000Z",
      "DTEND:20260329T190000Z",
      "SUMMARY:Eesha Half Saree Ceremony",
      "DESCRIPTION:You are invited to Eesha's Half Saree Ceremony",
      "LOCATION:Celebrations Event Center\\, 11840 Hero Way W Suite #204\\, Leander\\, TX 78641",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
  }

  return (
    <section className="max-w-3xl mx-auto px-4 pb-8 sm:pb-12">
      <div className="bg-navy-900/40 backdrop-blur-sm rounded-xl border border-gold-500/15 p-6 sm:p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <CalendarPlus className="w-5 h-5 text-gold-400" />
          <h3 className="font-serif text-xl sm:text-2xl text-gold-400">
            Save the Date
          </h3>
        </div>
        <p className="text-cream-200/60 text-sm font-sans mb-6">
          Add this event to your calendar so you don&apos;t miss it
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={EVENT.googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/40 text-gold-400 rounded-full font-sans text-sm font-medium transition-all hover:scale-105 w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 3h-3V1.5h-1.5V3h-6V1.5H7.5V3h-3C3.675 3 3 3.675 3 4.5v15c0 .825.675 1.5 1.5 1.5h15c.825 0 1.5-.675 1.5-1.5v-15c0-.825-.675-1.5-1.5-1.5zm0 16.5h-15V8h15v11.5zM7.5 9.5h4v4h-4z" />
            </svg>
            Google Calendar
          </a>
          <a
            href={EVENT.outlookCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-800/60 hover:bg-navy-800 border border-cream-200/15 text-cream-200 rounded-full font-sans text-sm font-medium transition-all hover:scale-105 w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H3V8h18v10zM7 10h5v5H7z" />
            </svg>
            Outlook
          </a>
          <a
            href={generateIcsUrl()}
            download="eesha-half-saree-ceremony.ics"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-800/60 hover:bg-navy-800 border border-cream-200/15 text-cream-200 rounded-full font-sans text-sm font-medium transition-all hover:scale-105 w-full sm:w-auto justify-center"
          >
            <CalendarPlus className="w-4 h-4" />
            Apple / Other
          </a>
        </div>
      </div>
    </section>
  );
}
