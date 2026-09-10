import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showHandles?: boolean;
}

/**
 * The Bézier Loupe - Official SVG Lens Brand Mark
 * Combines an optical magnifying inspection loupe with authentic vector Bézier curve
 * anchor points and tangent control handles.
 */
export const Logo: React.FC<LogoProps> = ({
  size = 24,
  className = '',
  showHandles = true,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="SVG Lens Logo"
    >
      {/* Tangent Handle Lines & Control Points (Vector Construction) */}
      {showHandles && (
        <g opacity="0.85">
          {/* Top Horizontal Tangent */}
          <line
            x1="24"
            y1="16"
            x2="64"
            y2="16"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <circle cx="24" cy="16" r="3" fill="currentColor" />
          <circle cx="64" cy="16" r="3" fill="currentColor" />

          {/* Left Vertical Tangent */}
          <line
            x1="20"
            y1="20"
            x2="20"
            y2="60"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <circle cx="20" cy="20" r="3" fill="currentColor" />
          <circle cx="20" cy="60" r="3" fill="currentColor" />

          {/* Right Upper Tangent */}
          <line
            x1="68"
            y1="20"
            x2="68"
            y2="40"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <circle cx="68" cy="20" r="3" fill="currentColor" />

          {/* Bottom Left Tangent */}
          <line
            x1="28"
            y1="64"
            x2="44"
            y2="64"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <circle cx="28" cy="64" r="3" fill="currentColor" />
        </g>
      )}

      {/* Loupe Stem (Handle) */}
      <line
        x1="60"
        y1="56"
        x2="82"
        y2="78"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Main Lens Rim (Bézier Circle) */}
      <circle
        cx="44"
        cy="40"
        r="24"
        stroke="currentColor"
        strokeWidth="5"
      />

      {/* Optical Reflection Glint Arc */}
      <path
        d="M 32 28 A 16 16 0 0 1 56 28"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Cardinal Anchor Nodes (Vector Squares) */}
      {/* Top Node */}
      <rect
        x="41"
        y="13"
        width="6"
        height="6"
        fill="currentColor"
        stroke="var(--bg-primary, #09090b)"
        strokeWidth="1"
      />

      {/* Left Node */}
      <rect
        x="17"
        y="37"
        width="6"
        height="6"
        fill="currentColor"
        stroke="var(--bg-primary, #09090b)"
        strokeWidth="1"
      />

      {/* Right Node */}
      <rect
        x="65"
        y="37"
        width="6"
        height="6"
        fill="currentColor"
        stroke="var(--bg-primary, #09090b)"
        strokeWidth="1"
      />

      {/* Bottom Node */}
      <rect
        x="41"
        y="61"
        width="6"
        height="6"
        fill="currentColor"
        stroke="var(--bg-primary, #09090b)"
        strokeWidth="1"
      />
    </svg>
  );
};
