"use client";

import { Minus, Plus, Leaf, Drumstick } from "lucide-react";

interface DietarySelectorProps {
  totalGuests: number;
  vegCount: number;
  onChange: (vegCount: number) => void;
}

export function DietarySelector({
  totalGuests,
  vegCount,
  onChange,
}: DietarySelectorProps) {
  const nonVegCount = totalGuests - vegCount;

  function adjustVeg(delta: number) {
    const next = vegCount + delta;
    if (next >= 0 && next <= totalGuests) {
      onChange(next);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-cream-200 text-sm font-sans text-center">
        How many of your {totalGuests} guest{totalGuests > 1 ? "s" : ""} prefer
        each?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-navy-800/60 rounded-xl p-4 border border-green-600/30">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-sans font-medium text-sm uppercase tracking-wider">
              Vegetarian
            </span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => adjustVeg(-1)}
              disabled={vegCount <= 0}
              className="w-10 h-10 rounded-full bg-navy-700 hover:bg-navy-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-3xl font-serif font-bold text-green-300 w-10 text-center">
              {vegCount}
            </span>
            <button
              type="button"
              onClick={() => adjustVeg(1)}
              disabled={vegCount >= totalGuests}
              className="w-10 h-10 rounded-full bg-navy-700 hover:bg-navy-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-navy-800/60 rounded-xl p-4 border border-orange-600/30">
          <div className="flex items-center gap-2 mb-3">
            <Drumstick className="w-5 h-5 text-orange-400" />
            <span className="text-orange-300 font-sans font-medium text-sm uppercase tracking-wider">
              Non-Vegetarian
            </span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => adjustVeg(1)}
              disabled={nonVegCount <= 0}
              className="w-10 h-10 rounded-full bg-navy-700 hover:bg-navy-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-3xl font-serif font-bold text-orange-300 w-10 text-center">
              {nonVegCount}
            </span>
            <button
              type="button"
              onClick={() => adjustVeg(-1)}
              disabled={nonVegCount >= totalGuests}
              className="w-10 h-10 rounded-full bg-navy-700 hover:bg-navy-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="bg-navy-800/40 rounded-lg px-4 py-2 text-sm text-cream-200 font-sans">
          <span className="text-green-300">{vegCount} Veg</span>
          <span className="mx-2 text-gold-500/40">|</span>
          <span className="text-orange-300">{nonVegCount} Non-Veg</span>
          <span className="mx-2 text-gold-500/40">|</span>
          <span className="text-cream-50">{totalGuests} Total</span>
        </div>
      </div>
    </div>
  );
}
