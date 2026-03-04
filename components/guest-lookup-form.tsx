"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

interface GuestLookupFormProps {
  onFound: (guest: Record<string, unknown>, token: string) => void;
}

export function GuestLookupForm({ onFound }: GuestLookupFormProps) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError("");

    try {
      const res = await fetch(
        `/api/rsvp/lookup?q=${encodeURIComponent(query.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        onFound(data.guest, data.guest.invite_token);
      } else {
        setError(
          "We couldn't find your invitation. Please check your email or phone number and try again."
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="text-center space-y-6">
      <h3 className="font-serif text-2xl text-gold-400">
        Already received an invitation?
      </h3>
      <p className="text-cream-200 font-sans text-sm">
        Enter your email or mobile number to find your RSVP.
      </p>
      <form onSubmit={handleSearch} className="max-w-sm mx-auto space-y-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Email or mobile number"
          className="w-full bg-navy-800 border border-gold-500/30 rounded-xl px-5 py-3 text-cream-50 font-sans placeholder:text-cream-200/40 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
        />
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500 text-gold-400 rounded-full font-sans font-medium transition-all disabled:opacity-40"
        >
          {searching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Find my RSVP
        </button>
      </form>
      {error && <p className="text-rose-400 text-sm font-sans">{error}</p>}
    </div>
  );
}
