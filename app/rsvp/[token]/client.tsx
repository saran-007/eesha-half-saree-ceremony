"use client";

import { useState } from "react";
import { RsvpForm } from "@/components/rsvp-form";
import { GuestLookupForm } from "@/components/guest-lookup-form";

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

interface Props {
  guest: GuestData;
  token: string;
}

export function RsvpPageClient({ guest: initialGuest, token: initialToken }: Props) {
  const [guest, setGuest] = useState<GuestData>(initialGuest);
  const [token, setToken] = useState(initialToken);
  const [showLookup, setShowLookup] = useState(false);

  function handleLookupFound(found: Record<string, unknown>, foundToken: string) {
    setGuest(found as unknown as GuestData);
    setToken(foundToken);
    setShowLookup(false);
  }

  return (
    <div className="space-y-8">
      <RsvpForm guest={guest} token={token} />

      {!showLookup && (
        <div className="text-center pt-4 border-t border-gold-500/10">
          <button
            onClick={() => setShowLookup(true)}
            className="text-sm text-cream-200/40 hover:text-cream-200/70 font-sans transition-colors"
          >
            Not {guest.first_name}? Look up a different invitation
          </button>
        </div>
      )}

      {showLookup && <GuestLookupForm onFound={handleLookupFound} />}
    </div>
  );
}
