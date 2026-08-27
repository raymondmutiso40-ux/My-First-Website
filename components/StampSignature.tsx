"use client";

import { useState } from "react";

export default function StampSignature() {
  const [renewed, setRenewed] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={renewed}
      aria-label={
        renewed
          ? "Stamp showing RENEWED. Press to reset."
          : "Stamp showing OVERDUE. Press to mark as renewed, like replying RENEWED by SMS."
      }
      onClick={() => setRenewed((v) => !v)}
      onMouseEnter={() => setRenewed(true)}
      onMouseLeave={() => setRenewed(false)}
      className="group relative block h-40 w-40 shrink-0 select-none focus:outline-none sm:h-52 sm:w-52"
    >
      <span
        className={`stamp-mark absolute inset-0 flex rotate-[-9deg] items-center justify-center rounded-full border-[6px] font-display text-2xl font-semibold uppercase tracking-[0.14em] transition-all duration-300 ease-out sm:text-3xl ${
          renewed
            ? "scale-105 border-stamp-green text-stamp-green opacity-100"
            : "scale-100 border-stamp-red text-stamp-red opacity-100"
        } ${renewed ? "stamp-slam" : ""}`}
        style={{
          boxShadow: renewed
            ? "0 0 0 3px rgba(47,122,77,0.15) inset"
            : "0 0 0 3px rgba(178,58,46,0.15) inset",
        }}
      >
        <span className="px-2 text-center leading-none">
          {renewed ? "RENEWED" : "OVERDUE"}
        </span>
      </span>
      <span className="sr-only">
        Hover or tap: this mirrors replying RENEWED plus a reference number by
        SMS to clear a compliance item.
      </span>
    </button>
  );
}
