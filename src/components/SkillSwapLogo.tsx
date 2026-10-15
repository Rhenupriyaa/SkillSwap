import React from 'react';

interface SkillSwapLogoProps {
  className?: string;
  size?: number;
}

export const SkillSwapLogo: React.FC<SkillSwapLogoProps> = ({
  className = 'w-6 h-6',
  size = 24,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ss-grad-primary" x1="2" y1="4" x2="30" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
        <linearGradient id="ss-grad-accent" x1="10" y1="10" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Path 1: Upper Exchange Arc / Ribbon (giving knowledge) */}
      <path
        d="M6 14C6 9.58172 9.58172 6 14 6H20C23.3137 6 26 8.68629 26 12C26 13.5 25 15.5 23.5 16.5L25 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Path 2: Lower Exchange Arc / Ribbon (receiving knowledge) */}
      <path
        d="M26 18C26 22.4183 22.4183 26 18 26H12C8.68629 26 6 23.3137 6 20C6 18.5 7 16.5 8.5 15.5L7 14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Path 3: The Center Voice & Knowledge Exchange Spark (Matches Selector) */}
      <path
        d="M16 10L17.5 14.5L22 16L17.5 17.5L16 22L14.5 17.5L10 16L14.5 14.5L16 10Z"
        fill="url(#ss-grad-accent)"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinejoin="round"
        className="filter drop-shadow-xs transition-transform hover:scale-110"
      />
    </svg>
  );
};
