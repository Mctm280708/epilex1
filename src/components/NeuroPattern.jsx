import React from "react";

/**
 * Decorative neuroscience-inspired SVG elements.
 * Thin-line brain, neural connections, EEG waves, and circuit patterns.
 * Use as subtle background decoration with low opacity.
 */
export function BrainCircuit({ className = "", opacity = 0.06 }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Brain outline - left hemisphere */}
      <path
        d="M100 30 C75 30 55 45 50 65 C40 68 32 78 32 92 C32 105 40 116 52 120 C55 132 65 140 78 140 C82 148 90 152 100 152"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Brain outline - right hemisphere */}
      <path
        d="M100 30 C125 30 145 45 150 65 C160 68 168 78 168 92 C168 105 160 116 148 120 C145 132 135 140 122 140 C118 148 110 152 100 152"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Central fissure */}
      <path d="M100 30 L100 152" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
      {/* Sulci - left */}
      <path d="M68 50 C72 58 70 66 74 74 C78 82 72 90 76 98 C80 106 74 114 78 122" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      <path d="M55 75 C62 78 60 86 64 92 C68 98 62 106 66 112" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      {/* Sulci - right */}
      <path d="M132 50 C128 58 130 66 126 74 C122 82 128 90 124 98 C120 106 126 114 122 122" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      <path d="M145 75 C138 78 140 86 136 92 C132 98 138 106 134 112" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      {/* Neural connection nodes */}
      <circle cx="70" cy="60" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="130" cy="60" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="60" cy="90" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="140" cy="90" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="75" cy="115" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="125" cy="115" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="100" cy="70" r="2" fill="currentColor" opacity="0.8" />
      <circle cx="100" cy="100" r="2" fill="currentColor" opacity="0.8" />
      <circle cx="100" cy="130" r="2" fill="currentColor" opacity="0.8" />
      {/* Neural connection lines */}
      <path d="M70 60 L100 70 L130 60" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      <path d="M60 90 L100 100 L140 90" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      <path d="M75 115 L100 130 L125 115" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      <path d="M100 70 L100 100 L100 130" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

/**
 * EEG / biomarker wave pattern — a thin line trace of neural signal.
 */
export function EEGWave({ className = "", color = "currentColor", strokeWidth = 1.2 }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 30 L40 30 L50 30 L55 18 L60 42 L65 12 L70 48 L75 30 L120 30 L130 30 L135 22 L140 38 L145 14 L150 46 L155 30 L200 30 L210 30 L215 20 L220 40 L225 16 L230 44 L235 30 L280 30 L290 30 L295 24 L300 36 L305 18 L310 42 L315 30 L360 30 L400 30"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="eeg-dash"
      />
    </svg>
  );
}

/**
 * Full background decoration — brain + neural lines + circuit grid.
 */
export function NeuroBackground({ className = "", variant = "light" }) {
  const color = variant === "dark" ? "#ffffff" : "#0a2540";
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="neural-pulse absolute -right-20 -top-20 h-64 w-64" style={{ color }}>
        <BrainCircuit className="h-full w-full" opacity={0.08} />
      </div>
      <div className="absolute -bottom-32 -left-16 h-72 w-72 opacity-[0.05]" style={{ color }}>
        <BrainCircuit className="h-full w-full" opacity={1} />
      </div>
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <pattern id="circuit-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 20 L40 20 M20 0 L20 40" stroke={color} strokeWidth="0.4" opacity="0.04" />
            <circle cx="20" cy="20" r="1" fill={color} opacity="0.06" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-grid)" />
      </svg>
    </div>
  );
}

export default NeuroBackground;