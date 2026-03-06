"use client";

import { useState } from "react";
import {
  Check,
  X,
  Users,
  ChevronDown,
  Loader2,
  PartyPopper,
  Heart,
} from "lucide-react";
import { DietarySelector } from "./dietary-selector";

interface GuestData {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  mobile: string | null;
  rsvp_status: string;
  guest_count: number;
  veg_count: number;
  non_veg_count: number;
}

interface RsvpFormProps {
  guest: GuestData;
  token: string;
}

export function RsvpForm({ guest, token }: RsvpFormProps) {
  const alreadyResponded = guest.rsvp_status !== "pending";
  const [step, setStep] = useState<"choice" | "details" | "done">(
    alreadyResponded ? "done" : "choice"
  );
  const [attending, setAttending] = useState<boolean | null>(
    guest.rsvp_status === "yes" ? true : guest.rsvp_status === "no" ? false : null
  );
  const [guestCount, setGuestCount] = useState(guest.guest_count || 1);
  const [vegCount, setVegCount] = useState(
    guest.veg_count > 0 ? guest.veg_count : guest.guest_count || 1
  );
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          rsvp_status: attending ? "yes" : "no",
          guest_count: attending ? guestCount : 0,
          veg_count: attending ? vegCount : 0,
          non_veg_count: attending ? guestCount - vegCount : 0,
        }),
      });
      if (res.ok) {
        setStep("done");
        setIsEditing(false);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit() {
    setIsEditing(true);
    setStep("choice");
  }

  if (step === "done" && !isEditing) {
    return (
      <div className="text-center space-y-6">
        {attending ? (
          <>
            <PartyPopper className="w-16 h-16 text-gold-400 mx-auto" />
            <h3 className="font-serif text-3xl text-gold-400">
              We can&apos;t wait to see you!
            </h3>
            <div className="bg-navy-800/60 rounded-xl p-6 space-y-2 text-left max-w-sm mx-auto">
              <p className="text-cream-200">
                <span className="text-cream-50 font-medium">Guests:</span>{" "}
                {guest.rsvp_status === "yes" ? guest.guest_count : guestCount}
              </p>
              <p className="text-cream-200">
                <span className="text-green-300">Vegetarian:</span>{" "}
                {guest.rsvp_status === "yes" ? guest.veg_count : vegCount}
              </p>
              <p className="text-cream-200">
                <span className="text-orange-300">Non-Vegetarian:</span>{" "}
                {guest.rsvp_status === "yes"
                  ? guest.non_veg_count
                  : guestCount - vegCount}
              </p>
            </div>
          </>
        ) : (
          <>
            <Heart className="w-16 h-16 text-gold-400 mx-auto" />
            <h3 className="font-serif text-3xl text-gold-400">
              We&apos;ll miss you!
            </h3>
            <p className="text-cream-200">
              Thank you for letting us know. We hope to see you another time.
            </p>
          </>
        )}
        <button
          onClick={startEdit}
          className="text-sm text-gold-400/60 hover:text-gold-400 underline underline-offset-4 transition-colors font-sans"
        >
          Update my response
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="font-serif text-2xl sm:text-3xl text-gold-400 mb-2">
          Dear {guest.first_name},
        </h3>
        <p className="text-cream-200 font-sans">
          Will you be joining us for the celebration?
        </p>
      </div>

      {step === "choice" && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
          <button
            onClick={() => {
              setAttending(true);
              setVegCount(guestCount);
              setStep("details");
            }}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-green-600/15 hover:bg-green-600/25 border-2 border-green-500 text-green-400 rounded-xl font-sans font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-500/20"
          >
            <Check className="w-6 h-6" />
            Joyfully Accept
          </button>
          <button
            onClick={() => {
              setAttending(false);
              handleSubmit();
            }}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-rose-600/15 hover:bg-rose-600/25 border-2 border-rose-500 text-rose-400 rounded-xl font-sans font-medium text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-rose-500/20"
          >
            <X className="w-6 h-6" />
            Regretfully Decline
          </button>
        </div>
      )}

      {step === "details" && attending && (
        <div className="space-y-8 animate-fade-in-up">
          <div>
            <label className="block text-cream-200 text-sm font-sans uppercase tracking-wider mb-3 text-center">
              <Users className="w-4 h-4 inline mr-2" />
              Total number of guests (including yourself)
            </label>
            <div className="relative max-w-xs mx-auto">
              <select
                value={guestCount}
                onChange={(e) => {
                  const count = Number(e.target.value);
                  setGuestCount(count);
                  setVegCount(count);
                }}
                className="w-full appearance-none bg-navy-800 border border-gold-500/30 rounded-xl px-5 py-4 text-cream-50 font-sans text-lg text-center focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Guest (just me)" : `Guests (me + ${n - 1})`}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-400 pointer-events-none" />
            </div>
          </div>

          <DietarySelector
            totalGuests={guestCount}
            vegCount={vegCount}
            onChange={setVegCount}
          />

          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-10 py-4 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-navy-950 font-sans font-bold text-lg rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/30 hover:scale-105"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              Confirm RSVP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
