import React from 'react';

/**
 * Alex Avatar matching the 3D boy illustration in the reference mockup
 */
export const AlexAvatar: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 80,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      <defs>
        <linearGradient id="alexBg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="hoodieGrad" x1="20" y1="75" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="skinGrad" x1="45" y1="30" x2="75" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFEDD5" />
          <stop offset="100%" stopColor="#FDBA74" />
        </linearGradient>
        <linearGradient id="hairGrad" x1="30" y1="10" x2="90" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5D3A1A" />
          <stop offset="70%" stopColor="#3F2305" />
          <stop offset="100%" stopColor="#2A1604" />
        </linearGradient>
        <filter id="alexGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0284C7" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Circle Background */}
      <circle cx="60" cy="60" r="58" fill="url(#alexBg)" stroke="#FFFFFF" strokeWidth="4" filter="url(#alexGlow)" />

      {/* Subtle Inner Glow */}
      <circle cx="60" cy="60" r="54" stroke="#7DD3FC" strokeWidth="1.5" opacity="0.6" />

      {/* Shoulders / Blue Zip Hoodie */}
      <path
        d="M20 115 C20 90, 35 78, 60 78 C85 78, 100 90, 100 115 Z"
        fill="url(#hoodieGrad)"
      />
      {/* Inner Shirt (Dark Navy) */}
      <path d="M48 82 L60 98 L72 82 Z" fill="#0F172A" />
      {/* Hoodie Collar/Lining */}
      <path
        d="M36 82 C44 76, 56 76, 60 84 C64 76, 76 76, 84 82 C78 96, 68 100, 60 100 C52 100, 42 96, 36 82 Z"
        fill="#2563EB"
        opacity="0.9"
      />
      {/* Zipper */}
      <line x1="60" y1="98" x2="60" y2="115" stroke="#93C5FD" strokeWidth="2" strokeDasharray="2 1" />

      {/* Neck */}
      <rect x="52" y="65" width="16" height="18" rx="6" fill="url(#skinGrad)" />

      {/* Ears */}
      <circle cx="37" cy="52" r="7" fill="#FDBA74" />
      <circle cx="83" cy="52" r="7" fill="#FDBA74" />
      <circle cx="38" cy="52" r="4" fill="#FB923C" opacity="0.4" />
      <circle cx="82" cy="52" r="4" fill="#FB923C" opacity="0.4" />

      {/* Head / Face */}
      <path
        d="M40 45 C40 30, 80 30, 80 45 C80 65, 72 73, 60 73 C48 73, 40 65, 40 45 Z"
        fill="url(#skinGrad)"
      />

      {/* Cheeks Blush */}
      <circle cx="46" cy="56" r="4" fill="#F43F5E" opacity="0.25" />
      <circle cx="74" cy="56" r="4" fill="#F43F5E" opacity="0.25" />

      {/* Big Expressive Brown Eyes */}
      {/* Left Eye */}
      <ellipse cx="48" cy="48" rx="4.5" ry="6" fill="#FFFFFF" />
      <ellipse cx="48.5" cy="48" rx="3.2" ry="4.5" fill="#451A03" />
      <circle cx="47.5" cy="46" r="1.5" fill="#FFFFFF" />
      <circle cx="50" cy="50" r="0.8" fill="#FFFFFF" />

      {/* Right Eye */}
      <ellipse cx="72" cy="48" rx="4.5" ry="6" fill="#FFFFFF" />
      <ellipse cx="71.5" cy="48" rx="3.2" ry="4.5" fill="#451A03" />
      <circle cx="70.5" cy="46" r="1.5" fill="#FFFFFF" />
      <circle cx="73" cy="50" r="0.8" fill="#FFFFFF" />

      {/* Eyebrows */}
      <path d="M44 40 Q48 37 54 40" stroke="#3F2305" strokeWidth="2" strokeLinecap="round" />
      <path d="M66 40 Q72 37 76 40" stroke="#3F2305" strokeWidth="2" strokeLinecap="round" />

      {/* Cute Nose */}
      <path d="M60 51 Q61 54 59 55" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />

      {/* Warm Smile with teeth */}
      <path d="M52 58 Q60 66 68 58" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1" />
      <path d="M54 59 Q60 62 66 59" fill="#FFFFFF" />

      {/* Styled Tousled Brown Hair */}
      <path
        d="M37 42 C33 28, 48 18, 60 18 C72 18, 87 28, 83 42 C85 36, 88 45, 84 50 C80 38, 77 34, 68 34 C64 34, 58 37, 54 35 C48 32, 42 38, 38 48 C36 46, 35 43, 37 42 Z"
        fill="url(#hairGrad)"
      />
      {/* Front Hair Tuft Highlights */}
      <path d="M50 20 Q56 26 62 21" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
      <path d="M62 21 Q68 28 72 23" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

/**
 * Leonor Avatar (Girl with brown ponytail)
 */
export const LeonorAvatar: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 36,
}) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" className={`rounded-full ${className}`}>
    <circle cx="30" cy="30" r="28" fill="#FCE7F3" stroke="#F472B6" strokeWidth="2" />
    {/* Ponytail behind */}
    <path d="M42 22 C52 24, 54 38, 46 44 C42 46, 42 36, 42 30 Z" fill="#78350F" />
    {/* Body */}
    <path d="M16 54 C16 42, 22 36, 30 36 C38 36, 44 42, 44 54 Z" fill="#EC4899" />
    {/* Head */}
    <circle cx="30" cy="26" r="11" fill="#FED7AA" />
    {/* Hair front */}
    <path d="M19 25 C19 16, 24 14, 30 14 C36 14, 41 16, 41 25 C37 20, 33 21, 30 20 C26 21, 22 20, 19 25 Z" fill="#78350F" />
    {/* Smile */}
    <circle cx="27" cy="26" r="1.5" fill="#451A03" />
    <circle cx="33" cy="26" r="1.5" fill="#451A03" />
    <path d="M28 30 Q30 32 32 30" stroke="#E11D48" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/**
 * Tiago Avatar (Boy with blue t-shirt)
 */
export const TiagoAvatar: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 36,
}) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" className={`rounded-full ${className}`}>
    <circle cx="30" cy="30" r="28" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2" />
    <path d="M16 54 C16 42, 22 36, 30 36 C38 36, 44 42, 44 54 Z" fill="#0284C7" />
    <circle cx="30" cy="26" r="11" fill="#FED7AA" />
    <path d="M18 24 C18 15, 23 13, 30 13 C37 13, 42 15, 42 24 C38 18, 34 19, 30 18 C26 19, 22 18, 18 24 Z" fill="#451A03" />
    <circle cx="27" cy="26" r="1.5" fill="#1E293B" />
    <circle cx="33" cy="26" r="1.5" fill="#1E293B" />
    <path d="M28 30 Q30 32 32 30" stroke="#B91C1C" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/**
 * Island 1 Artwork: Medieval stone castle towers with pointy red roofs, lush green hill,
 * and a prominent 3D blue & white heraldic knight shield in front!
 */
export const Island1Artwork: React.FC<{ className?: string }> = ({ className = 'w-full h-32' }) => {
  return (
    <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="grass1" x1="100" y1="70" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="50%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
        <linearGradient id="rock1" x1="100" y1="95" x2="100" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#78716C" />
          <stop offset="100%" stopColor="#44403C" />
        </linearGradient>
        <linearGradient id="shieldGrad" x1="50" y1="40" x2="110" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="30%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>

      {/* Floating Island Base Rocks */}
      <path
        d="M20 95 C35 125, 70 145, 100 140 C130 135, 165 120, 180 95 C150 102, 50 102, 20 95 Z"
        fill="url(#rock1)"
      />
      {/* Rock Strata Details */}
      <path d="M60 105 L80 135 L100 115 L120 130 L140 105" stroke="#57534E" strokeWidth="2" fill="none" />

      {/* Island Grassy Top */}
      <ellipse cx="100" cy="92" rx="80" ry="24" fill="url(#grass1)" />

      {/* Trees Behind Castle */}
      <circle cx="50" cy="72" r="14" fill="#166534" />
      <circle cx="42" cy="76" r="10" fill="#15803D" />
      <circle cx="150" cy="72" r="16" fill="#166534" />
      <circle cx="160" cy="76" r="12" fill="#15803D" />

      {/* Castle Stone Walls */}
      {/* Left Tower */}
      <rect x="65" y="48" width="22" height="40" rx="2" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
      {/* Left Tower Roof (Red Conical) */}
      <path d="M63 48 L76 22 L89 48 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
      <line x1="76" y1="22" x2="76" y2="16" stroke="#94A3B8" strokeWidth="1.5" />
      <polygon points="76,16 84,18 76,21" fill="#FBBF24" />

      {/* Center Castle Body */}
      <rect x="80" y="55" width="40" height="35" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
      {/* Crenellations (Ameias) */}
      <rect x="80" y="50" width="7" height="6" fill="#E2E8F0" />
      <rect x="91" y="50" width="7" height="6" fill="#E2E8F0" />
      <rect x="102" y="50" width="7" height="6" fill="#E2E8F0" />
      <rect x="113" y="50" width="7" height="6" fill="#E2E8F0" />

      {/* Right Tower */}
      <rect x="113" y="44" width="24" height="44" rx="2" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
      {/* Right Tower Roof */}
      <path d="M110 44 L125 18 L140 44 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
      <line x1="125" y1="18" x2="125" y2="12" stroke="#94A3B8" strokeWidth="1.5" />
      <polygon points="125,12 133,14 125,17" fill="#FBBF24" />

      {/* Castle Door & Windows */}
      <path d="M94 75 C94 69, 106 69, 106 75 L106 90 L94 90 Z" fill="#475569" />
      <rect x="73" y="60" width="5" height="8" rx="2" fill="#334155" />
      <rect x="123" y="56" width="5" height="8" rx="2" fill="#334155" />

      {/* Giant 3D Shield in Foreground */}
      <g transform="translate(30, 48) scale(0.95)">
        {/* Shield Shadow */}
        <path
          d="M20 20 L50 20 C50 50, 45 65, 20 80 C-5 65, -10 50, -10 20 Z"
          fill="#000000"
          opacity="0.2"
          transform="translate(4, 6)"
        />
        {/* Outer Shield Frame (Royal Blue) */}
        <path
          d="M20 18 L52 18 C52 50, 46 68, 20 84 C-6 68, -12 50, -12 18 Z"
          fill="url(#shieldGrad)"
          stroke="#FFFFFF"
          strokeWidth="3"
        />
        {/* Inner White/Silver Crest Shield */}
        <path
          d="M20 24 L44 24 C44 48, 38 60, 20 74 C2 60, -4 48, -4 24 Z"
          fill="#FFFFFF"
          opacity="0.95"
        />
        {/* Blue Inner Cross / Chevron */}
        <path
          d="M20 30 L38 30 C38 46, 32 54, 20 64 C8 54, 2 46, 2 30 Z"
          fill="#2563EB"
        />
        {/* Heraldic Star inside */}
        <polygon points="20,38 23,46 31,46 25,51 27,59 20,54 13,59 15,51 9,46 17,46" fill="#F8FAFC" />
      </g>
    </svg>
  );
};

/**
 * Island 2 Artwork: Island with observatory/stone houses and a prominent 3D Magnifying Glass
 */
export const Island2Artwork: React.FC<{ className?: string }> = ({ className = 'w-full h-32' }) => {
  return (
    <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="grass2" x1="100" y1="70" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="20%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>
        <linearGradient id="lensGrad" x1="50" y1="20" x2="90" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id="goldRim" x1="40" y1="10" x2="100" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>
      </defs>

      {/* Floating Island Rock */}
      <path
        d="M25 95 C40 128, 75 145, 105 140 C135 135, 165 120, 175 95 C145 102, 55 102, 25 95 Z"
        fill="#78716C"
      />
      <ellipse cx="100" cy="92" rx="76" ry="22" fill="url(#grass2)" />

      {/* Village Houses & Windmill / Observatory */}
      <rect x="55" y="65" width="22" height="24" fill="#F8FAFC" stroke="#94A3B8" />
      <polygon points="53,65 66,50 79,65" fill="#F97316" stroke="#C2410C" />
      <rect x="62" y="74" width="6" height="15" fill="#475569" />

      {/* Observatory Dome */}
      <rect x="120" y="60" width="34" height="28" fill="#E2E8F0" stroke="#94A3B8" />
      <path d="M120 60 C120 40, 154 40, 154 60 Z" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1.5" />
      <line x1="137" y1="38" x2="137" y2="60" stroke="#1D4ED8" strokeWidth="2" />

      {/* Trees */}
      <circle cx="95" cy="74" r="12" fill="#15803D" />
      <circle cx="106" cy="76" r="9" fill="#22C55E" />
      <circle cx="44" cy="78" r="10" fill="#15803D" />

      {/* Giant 3D Magnifying Glass in Foreground */}
      <g transform="translate(68, 12)">
        {/* Handle */}
        <line x1="48" y1="58" x2="78" y2="92" stroke="#78350F" strokeWidth="9" strokeLinecap="round" />
        <line x1="48" y1="58" x2="78" y2="92" stroke="#B45309" strokeWidth="7" strokeLinecap="round" />
        <line x1="46" y1="56" x2="52" y2="62" stroke="#FDE047" strokeWidth="8" strokeLinecap="round" />

        {/* Outer Gold Rim */}
        <circle cx="28" cy="36" r="26" fill="url(#lensGrad)" stroke="url(#goldRim)" strokeWidth="6" />
        {/* Inner Specular Highlight */}
        <path d="M12 28 C16 18, 30 16, 40 22" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        {/* Search spark */}
        <circle cx="36" cy="44" r="3" fill="#FFFFFF" opacity="0.8" />
      </g>
    </svg>
  );
};

/**
 * Island 3 Artwork: Grassy island with trees and three 3D purple speech balloons with "..."
 */
export const Island3Artwork: React.FC<{ className?: string }> = ({ className = 'w-full h-32' }) => {
  return (
    <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="grass3" x1="100" y1="70" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="50%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
        <linearGradient id="bubble1" x1="60" y1="20" x2="120" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>
        <linearGradient id="bubble2" x1="100" y1="40" x2="150" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E9D5FF" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>

      {/* Floating Island Rock */}
      <path
        d="M30 95 C45 125, 75 142, 105 138 C135 135, 160 120, 170 95 C140 102, 60 102, 30 95 Z"
        fill="#78716C"
      />
      <ellipse cx="100" cy="92" rx="72" ry="20" fill="url(#grass3)" />

      {/* Lush Trees */}
      <circle cx="50" cy="74" r="14" fill="#166534" />
      <circle cx="62" cy="78" r="10" fill="#22C55E" />
      <circle cx="150" cy="74" r="15" fill="#166534" />
      <circle cx="138" cy="78" r="11" fill="#22C55E" />

      {/* Three 3D Purple Chat Bubbles floating in center */}
      {/* Secondary Bubble Right */}
      <g transform="translate(110, 42)">
        <rect x="0" y="0" width="38" height="28" rx="14" fill="url(#bubble2)" stroke="#FFFFFF" strokeWidth="2" />
        <polygon points="12,26 8,34 20,26" fill="#A855F7" />
        <circle cx="12" cy="14" r="2.5" fill="#FFFFFF" />
        <circle cx="19" cy="14" r="2.5" fill="#FFFFFF" />
        <circle cx="26" cy="14" r="2.5" fill="#FFFFFF" />
      </g>

      {/* Main Big Purple Bubble Center/Left */}
      <g transform="translate(56, 24)">
        <rect x="0" y="0" width="58" height="42" rx="20" fill="url(#bubble1)" stroke="#FFFFFF" strokeWidth="2.5" />
        <polygon points="20,38 14,50 32,38" fill="#7E22CE" />
        {/* 3 Dots */}
        <circle cx="18" cy="21" r="4" fill="#FFFFFF" />
        <circle cx="29" cy="21" r="4" fill="#FFFFFF" />
        <circle cx="40" cy="21" r="4" fill="#FFFFFF" />
        {/* Specular curved shine */}
        <path d="M12 10 Q28 6 46 10" stroke="#F3E8FF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </g>

      {/* Small tertiary bubble top left */}
      <circle cx="54" cy="28" r="7" fill="#C084FC" stroke="#FFFFFF" strokeWidth="1.5" />
    </svg>
  );
};

/**
 * Island 4 Artwork: Floating island with open laptop displaying "</>" coding symbol on blue screen
 */
export const Island4Artwork: React.FC<{ className?: string }> = ({ className = 'w-full h-32' }) => {
  return (
    <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="grass4" x1="100" y1="70" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
        <linearGradient id="screenGrad" x1="70" y1="30" x2="130" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      {/* Floating Island Rock */}
      <path
        d="M25 95 C40 125, 75 142, 105 138 C135 135, 165 120, 175 95 C145 102, 55 102, 25 95 Z"
        fill="#78716C"
      />
      <ellipse cx="100" cy="92" rx="76" ry="22" fill="url(#grass4)" />

      {/* Pine Trees */}
      <polygon points="45,85 55,60 65,85" fill="#14532D" />
      <polygon points="48,72 55,50 62,72" fill="#166534" />
      <polygon points="140,85 150,60 160,85" fill="#14532D" />
      <polygon points="143,72 150,50 157,72" fill="#166534" />

      {/* Open Laptop */}
      <g transform="translate(62, 34)">
        {/* Laptop Base/Keyboard */}
        <polygon points="0,50 76,50 86,58 -10,58" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
        <rect x="24" y="52" width="28" height="4" rx="1" fill="#CBD5E1" />

        {/* Laptop Screen Lid */}
        <rect x="4" y="0" width="68" height="50" rx="3" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
        {/* Screen Display */}
        <rect x="8" y="4" width="60" height="42" rx="2" fill="url(#screenGrad)" />

        {/* </> Code Symbol on Screen */}
        <text
          x="38"
          y="29"
          textAnchor="middle"
          fill="#38BDF8"
          fontSize="18"
          fontWeight="900"
          fontFamily="monospace"
        >
          &lt;/&gt;
        </text>

        {/* Webcam */}
        <circle cx="38" cy="2" r="1" fill="#94A3B8" />
      </g>
    </svg>
  );
};

/**
 * Island 5 Artwork: Futuristic white science dome with floating glowing purple neural network / AI brain
 */
export const Island5Artwork: React.FC<{ className?: string }> = ({ className = 'w-full h-32' }) => {
  return (
    <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="grass5" x1="100" y1="70" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="50%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#0F766E" />
        </linearGradient>
        <linearGradient id="domeGrad" x1="80" y1="45" x2="120" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
        <linearGradient id="brainGrad" x1="80" y1="15" x2="120" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E879F9" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <filter id="brainGlow" x="0" y="0" width="200" height="150" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Floating Island Rock with high-tech cyan streaks */}
      <path
        d="M25 95 C40 125, 75 142, 105 138 C135 135, 165 120, 175 95 C145 102, 55 102, 25 95 Z"
        fill="#475569"
      />
      <path d="M60 110 L100 135 L140 110" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 3" />
      <ellipse cx="100" cy="92" rx="76" ry="22" fill="url(#grass5)" />

      {/* Science Dome Base */}
      <rect x="74" y="68" width="52" height="22" rx="3" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
      <path d="M74 68 C74 42, 126 42, 126 68 Z" fill="url(#domeGrad)" stroke="#64748B" strokeWidth="2" />
      {/* Sci-fi Blue Ring */}
      <ellipse cx="100" cy="68" rx="26" ry="6" fill="#0284C7" opacity="0.3" stroke="#38BDF8" strokeWidth="1.5" />

      {/* Floating Glowing Brain / Neural Network */}
      <g filter="url(#brainGlow)">
        {/* Glow Halo */}
        <circle cx="100" cy="35" r="22" fill="#C084FC" opacity="0.25" />

        {/* Brain Left Hemisphere */}
        <path
          d="M100 24 C90 24, 82 28, 82 35 C82 42, 90 46, 100 46 Z"
          fill="url(#brainGrad)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
        {/* Brain Right Hemisphere */}
        <path
          d="M100 24 C110 24, 118 28, 118 35 C118 42, 110 46, 100 46 Z"
          fill="url(#brainGrad)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />

        {/* Neural Network Nodes & Links */}
        <circle cx="92" cy="32" r="2" fill="#FFFFFF" />
        <circle cx="108" cy="32" r="2" fill="#FFFFFF" />
        <circle cx="100" cy="38" r="2" fill="#FFFFFF" />
        <line x1="92" y1="32" x2="100" y2="38" stroke="#FDF4FF" strokeWidth="1" />
        <line x1="108" y1="32" x2="100" y2="38" stroke="#FDF4FF" strokeWidth="1" />
      </g>

      {/* Light Sparks */}
      <circle cx="76" cy="25" r="1.5" fill="#E879F9" />
      <circle cx="124" cy="22" r="1.5" fill="#38BDF8" />
    </svg>
  );
};

/**
 * Mountain Summit Artwork: Rugged snowy peak with clouds, pine trees, and a Golden Trophy Cup
 */
export const SummitMountainArtwork: React.FC<{ className?: string }> = ({ className = 'w-full h-32' }) => {
  return (
    <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="mtnGrad" x1="100" y1="40" x2="100" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="goldCup" x1="80" y1="10" x2="120" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>
      </defs>

      {/* Background Cloud */}
      <ellipse cx="60" cy="70" rx="35" ry="15" fill="#F1F5F9" opacity="0.8" />
      <ellipse cx="145" cy="80" rx="40" ry="18" fill="#F1F5F9" opacity="0.8" />

      {/* Mountain Body */}
      <polygon points="100,35 170,140 30,140" fill="url(#mtnGrad)" />
      {/* Snow Cap */}
      <polygon points="100,35 125,72 110,65 100,72 90,65 75,72" fill="#F8FAFC" />

      {/* Pine Trees at base */}
      <polygon points="50,135 60,110 70,135" fill="#14532D" />
      <polygon points="130,135 140,110 150,135" fill="#14532D" />

      {/* Golden Trophy Cup on Peak */}
      <g transform="translate(82, 6)">
        {/* Cup Pedestal */}
        <rect x="12" y="32" width="12" height="4" rx="1" fill="#CA8A04" />
        <rect x="14" y="28" width="8" height="4" fill="#EAB308" />

        {/* Cup Body */}
        <path d="M8 8 L28 8 L24 28 L12 28 Z" fill="url(#goldCup)" stroke="#CA8A04" strokeWidth="1" />

        {/* Handles */}
        <path d="M8 12 C2 12, 2 22, 10 22" fill="none" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M28 12 C34 12, 34 22, 26 22" fill="none" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" />

        {/* Star */}
        <polygon points="18,14 19.5,18 24,18 20.5,20.5 22,25 18,22 14,25 15.5,20.5 12,18 16.5,18" fill="#FFFFFF" />
      </g>
    </svg>
  );
};

/**
 * 3D Golden Trophy Cup for Desafio da Semana
 */
export const GoldTrophyIllustration: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="trophyGold" x1="10" y1="8" x2="54" y2="52" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="40%" stopColor="#FACC15" />
        <stop offset="80%" stopColor="#EAB308" />
        <stop offset="100%" stopColor="#A16207" />
      </linearGradient>
    </defs>
    {/* Base */}
    <rect x="20" y="52" width="24" height="6" rx="2" fill="#78350F" />
    <rect x="24" y="46" width="16" height="6" rx="1" fill="#A16207" />
    <rect x="28" y="38" width="8" height="8" fill="#EAB308" />
    {/* Cup Bowl */}
    <path
      d="M16 12 H48 C48 26, 40 38, 32 38 C24 38, 16 26, 16 12 Z"
      fill="url(#trophyGold)"
      stroke="#A16207"
      strokeWidth="1.5"
    />
    {/* Rim */}
    <ellipse cx="32" cy="12" rx="16" ry="3" fill="#FEF08A" />
    {/* Handles */}
    <path
      d="M16 16 C6 16, 6 30, 18 30"
      fill="none"
      stroke="url(#trophyGold)"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M48 16 C58 16, 58 30, 46 30"
      fill="none"
      stroke="url(#trophyGold)"
      strokeWidth="4"
      strokeLinecap="round"
    />
    {/* Star inside cup */}
    <polygon points="32,18 34,23 39,23 35,26 37,31 32,28 27,31 29,26 25,23 30,23" fill="#FFFFFF" />
  </svg>
);

/**
 * Mail Envelope with Exclamation Badge for Phishing Challenge
 */
export const PhishingMailAlertIllustration: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Envelope Body */}
    <rect x="6" y="16" width="46" height="34" rx="4" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="2" />
    {/* Letter paper sliding out */}
    <rect x="12" y="8" width="34" height="24" rx="2" fill="#EBF3FE" stroke="#60A5FA" strokeWidth="1.5" />
    <line x1="18" y1="14" x2="34" y2="14" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
    <line x1="18" y1="19" x2="30" y2="19" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
    {/* Envelope Flap Lines */}
    <path d="M6 18 L29 34 L52 18" stroke="#93C5FD" strokeWidth="2" strokeLinejoin="round" />
    {/* Red Alert Exclamation Badge */}
    <g transform="translate(38, 26)">
      <circle cx="12" cy="12" r="11" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2.5" />
      <line x1="12" y1="7" x2="12" y2="13" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.3" fill="#FFFFFF" />
    </g>
  </svg>
);

/**
 * 3D Green Bulb for Dica Rápida
 */
export const GreenBulbIllustration: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="26" fill="#DCFCE7" />
    {/* Light Bulb */}
    <path
      d="M32 12 C24 12, 20 18, 20 26 C20 31, 24 35, 25 39 H39 C40 35, 44 31, 44 26 C44 18, 40 12, 32 12 Z"
      fill="#22C55E"
    />
    <rect x="26" y="41" width="12" height="3" rx="1.5" fill="#15803D" />
    <rect x="27" y="46" width="10" height="3" rx="1.5" fill="#15803D" />
    {/* Rays */}
    <line x1="32" y1="6" x2="32" y2="9" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="16" y1="16" x2="19" y2="19" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="48" y1="16" x2="45" y2="19" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/**
 * 3D Purple Quote Bubble for Frase do Dia
 */
export const QuoteBubbleIllustration: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="26" fill="#F3E8FF" />
    {/* Large quotation marks */}
    <text x="32" y="44" textAnchor="middle" fill="#7E22CE" fontSize="36" fontWeight="900" fontFamily="serif">
      “
    </text>
  </svg>
);

/**
 * Hand-drawn yellow lightbulb sketch with doodle rays and handwritten script
 * "Grandes ideias começam aqui!"
 */
export const DoodleLightbulbWithText: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Lightbulb SVG */}
      <svg width="44" height="44" viewBox="0 0 50 50" fill="none">
        {/* Rays */}
        <line x1="25" y1="2" x2="25" y2="8" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
        <line x1="7" y1="10" x2="12" y2="14" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
        <line x1="43" y1="10" x2="38" y2="14" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
        <line x1="2" y1="25" x2="7" y2="25" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="25" x2="43" y2="25" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />

        {/* Bulb Outline */}
        <path
          d="M25 10 C18 10, 14 16, 14 23 C14 28, 18 31, 19 35 H31 C32 31, 36 28, 36 23 C36 16, 32 10, 25 10 Z"
          fill="#FDE047"
          stroke="#0F172A"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Filament */}
        <path d="M21 24 Q25 20 29 24" stroke="#CA8A04" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Base threads */}
        <path d="M20 37 H30 M21 41 H29 M23 45 H27" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      {/* Script Text */}
      <div className="text-[13px] leading-tight font-black text-slate-800 italic" style={{ transform: 'rotate(-2deg)' }}>
        <span className="block">„Grandes</span>
        <span className="block">ideias</span>
        <span className="block">começam</span>
        <span className="block text-blue-600">aqui!”</span>
      </div>
    </div>
  );
};

/**
 * Hand-drawn blue underline doodle for the quote
 */
export const DoodleUnderline: React.FC<{ className?: string }> = ({ className = 'w-32 h-3' }) => (
  <svg viewBox="0 0 120 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M2 7 C30 2, 70 3, 118 6"
      stroke="#0284C7"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
  </svg>
);
