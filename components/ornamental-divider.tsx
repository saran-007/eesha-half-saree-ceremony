"use client";

export function OrnamentalDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-4 ${className}`}>
      <div className="gold-divider w-16 sm:w-24" />
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="text-gold-500 shrink-0"
      >
        <path
          d="M12 2C12 2 14 6 14 8C14 10 12 12 12 12C12 12 10 10 10 8C10 6 12 2 12 2Z"
          fill="currentColor"
          opacity="0.8"
        />
        <path
          d="M12 12C12 12 16 14 18 14C20 14 22 12 22 12C22 12 20 16 18 18C16 20 12 22 12 22C12 22 8 20 6 18C4 16 2 12 2 12C2 12 4 14 6 14C8 14 12 12 12 12Z"
          fill="currentColor"
          opacity="0.6"
        />
      </svg>
      <div className="gold-divider w-16 sm:w-24" />
    </div>
  );
}
