"use client";

import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { RsvpForm } from "@/components/rsvp-form";

interface GuestData {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  mobile: string | null;
  invite_token: string;
  rsvp_status: string;
  guest_count: number;
  veg_count: number;
  non_veg_count: number;
}

export function SelfRsvpClient() {
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [token, setToken] = useState<string>("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) return;
    if (!form.email.trim() && !form.mobile.trim()) {
      setError("Please provide an email or mobile number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rsvp/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setGuest(data.guest);
      setToken(data.guest.invite_token);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (guest && token) {
    return <RsvpForm guest={guest} token={token} />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-gold-500/15 flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-7 h-7 text-gold-400" />
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl text-gold-400 mb-2">
          RSVP to the Ceremony
        </h3>
        <p className="text-cream-200/60 font-sans text-sm">
          Enter your details below to let us know you&apos;re coming
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4 max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="First Name *"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            required
            className="bg-navy-800 border border-gold-500/20 rounded-xl px-4 py-3 text-cream-50 font-sans placeholder:text-cream-200/30 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
          />
          <input
            placeholder="Last Name *"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            required
            className="bg-navy-800 border border-gold-500/20 rounded-xl px-4 py-3 text-cream-50 font-sans placeholder:text-cream-200/30 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
          />
        </div>
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-navy-800 border border-gold-500/20 rounded-xl px-4 py-3 text-cream-50 font-sans placeholder:text-cream-200/30 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
        />
        <input
          placeholder="Mobile Number"
          type="tel"
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          className="w-full bg-navy-800 border border-gold-500/20 rounded-xl px-4 py-3 text-cream-50 font-sans placeholder:text-cream-200/30 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors"
        />

        {error && (
          <p className="text-rose-400 text-sm font-sans text-center">{error}</p>
        )}

        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-10 py-3.5 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-navy-950 font-sans font-bold text-lg rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/30 hover:scale-105"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Continue to RSVP"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
