import React from "react";

interface AuditEmptyIconProps {
  size?: number; // default 256
  iconColor?: string; // monitor/stand color
  accentColor?: string; // magnifier color
}

const AuditEmptyIcon: React.FC<AuditEmptyIconProps> = ({
  size = 256,
  iconColor = "#0f172a",
  accentColor = "#94a3b8",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    width={size}
    height={size}
    fill="none"
    aria-labelledby="title"
    role="img"
  >
    <title id="title">Audit Empty State</title>

    {/* Monitor */}
    <rect
      x="24"
      y="40"
      width="208"
      height="136"
      rx="12"
      stroke={iconColor}
      strokeWidth="6"
    />
    {/* Stand */}
    <line
      x1="128"
      y1="176"
      x2="128"
      y2="204"
      stroke={iconColor}
      strokeWidth="6"
      strokeLinecap="round"
    />
    <rect
      x="76"
      y="204"
      width="104"
      height="12"
      rx="6"
      stroke={iconColor}
      strokeWidth="6"
    />

    {/* Magnifying glass */}
    <circle
      cx="140"
      cy="112"
      r="28"
      stroke={accentColor}
      strokeWidth="6"
    />
    <line
      x1="160"
      y1="132"
      x2="188"
      y2="160"
      stroke={accentColor}
      strokeWidth="6"
      strokeLinecap="round"
    />

    {/* Shine */}
    <path
      d="M126 102c4-6 12-10 20-10"
      stroke={accentColor}
      strokeWidth="6"
      strokeLinecap="round"
    />
  </svg>
);

export default AuditEmptyIcon;