import React from 'react';

/**
 * 3D Cartoon Detective Boy Mascot Illustration
 * Matches the character from the user's mockup:
 * - Cute boy detective with trench coat, brown fedora hat
 * - Holding a big magnifying glass, winking cheerfully
 * - Floating newspaper "NOTÍCIA FALSA?", question mark bubbles, globe, and green checkmark
 */
export const DetectiveBoyHero: React.FC<{ className?: string }> = ({ className = 'w-full h-auto max-w-[360px]' }) => {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 460 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-lg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="hatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a16207" />
            <stop offset="50%" stopColor="#854d0e" />
            <stop offset="100%" stopColor="#713f12" />
          </linearGradient>

          <linearGradient id="hatBandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#451a03" />
            <stop offset="100%" stopColor="#290e02" />
          </linearGradient>

          <linearGradient id="coatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="40%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>

          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <linearGradient id="paperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>

          <linearGradient id="globeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Soft Clouds */}
        <g opacity="0.6">
          <ellipse cx="80" cy="90" rx="45" ry="25" fill="url(#cloudGrad)" />
          <ellipse cx="110" cy="80" rx="35" ry="20" fill="url(#cloudGrad)" />
          <ellipse cx="380" cy="220" rx="50" ry="25" fill="url(#cloudGrad)" />
        </g>

        {/* Floating Question Bubble Left */}
        <g transform="translate(60, 110)">
          <circle cx="20" cy="20" r="18" fill="#e0f2fe" opacity="0.8" />
          <circle cx="20" cy="20" r="14" fill="#38bdf8" />
          <text
            x="20"
            y="26"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="18"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
          >
            ?
          </text>
        </g>

        {/* Floating Question Bubble Right Top */}
        <g transform="translate(380, 75)">
          <circle cx="16" cy="16" r="15" fill="#e0f2fe" opacity="0.8" />
          <circle cx="16" cy="16" r="12" fill="#0284c7" />
          <text
            x="16"
            y="21"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="15"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
          >
            ?
          </text>
        </g>

        {/* Floating Newspaper "NOTÍCIA FALSA?" */}
        <g transform="translate(180, 25) rotate(-12)">
          {/* Shadow */}
          <rect x="2" y="4" width="94" height="68" rx="8" fill="#0f172a" opacity="0.15" />
          {/* Page */}
          <rect x="0" y="0" width="94" height="68" rx="8" fill="url(#paperGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Header Bar */}
          <rect x="10" y="8" width="74" height="14" rx="3" fill="#e2e8f0" />
          <text
            x="47"
            y="18"
            textAnchor="middle"
            fill="#334155"
            fontSize="8"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
          >
            NOTÍCIA
          </text>
          {/* Red Stamp: FALSA? */}
          <g transform="translate(20, 24) rotate(4)">
            <rect x="0" y="0" width="56" height="18" rx="4" fill="#ef4444" />
            <text
              x="28"
              y="13"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="10"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              letterSpacing="0.5"
            >
              FALSA?
            </text>
          </g>
          {/* News Lines */}
          <line x1="12" y1="48" x2="82" y2="48" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="12" y1="56" x2="68" y2="56" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Floating Globe Icon (Top Right) */}
        <g transform="translate(390, 50)">
          <rect x="0" y="0" width="52" height="52" rx="14" fill="#ffffff" stroke="#bae6fd" strokeWidth="2" />
          <circle cx="26" cy="26" r="18" fill="url(#globeGrad)" />
          {/* Lat/Long Lines */}
          <ellipse cx="26" cy="26" rx="9" ry="18" fill="none" stroke="#e0f2fe" strokeWidth="1.5" />
          <line x1="8" y1="26" x2="44" y2="26" stroke="#e0f2fe" strokeWidth="1.5" />
          <line x1="11" y1="18" x2="41" y2="18" stroke="#e0f2fe" strokeWidth="1.2" strokeOpacity="0.8" />
          <line x1="11" y1="34" x2="41" y2="34" stroke="#e0f2fe" strokeWidth="1.2" strokeOpacity="0.8" />
        </g>

        {/* Floating Green Checkmark Card */}
        <g transform="translate(385, 125)">
          <rect x="0" y="0" width="46" height="46" rx="12" fill="url(#checkGrad)" />
          <path
            d="M14 23 L22 31 L34 16"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Yellow Notebook Pinned Left Bottom */}
        <g transform="translate(200, 105) rotate(15)">
          <rect x="0" y="0" width="36" height="42" rx="6" fill="#fef08a" stroke="#facc15" strokeWidth="1.5" />
          <line x1="8" y1="12" x2="28" y2="12" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="20" x2="24" y2="20" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="28" x2="28" y2="28" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* ======================================================== */}
        {/* DETECTIVE BOY CHARACTER                                  */}
        {/* ======================================================== */}

        {/* Coat Body / Shoulders */}
        <path
          d="M245 235 C240 210, 370 210, 365 235 L395 380 L220 380 Z"
          fill="url(#coatGrad)"
        />
        {/* Collar Lapels */}
        <path d="M285 220 L305 285 L325 220 Z" fill="#ffffff" />
        <path d="M300 220 L305 270 L310 220 Z" fill="#991b1b" /> {/* Red Tie */}
        <path d="M260 220 L290 270 L280 320 L245 240 Z" fill="#78350f" />
        <path d="M350 220 L320 270 L330 320 L365 240 Z" fill="#78350f" />

        {/* Head / Neck */}
        <rect x="285" y="190" width="40" height="35" rx="10" fill="url(#skinGrad)" />
        <ellipse cx="305" cy="165" rx="55" ry="60" fill="url(#skinGrad)" />

        {/* Cute Ears */}
        <ellipse cx="250" cy="165" rx="10" ry="14" fill="url(#skinGrad)" />
        <ellipse cx="360" cy="165" rx="10" ry="14" fill="url(#skinGrad)" />

        {/* Hair Bangs */}
        <path
          d="M255 140 C265 110, 345 110, 355 140 C340 135, 330 145, 315 138 C300 148, 285 138, 270 148 C262 142, 258 140, 255 140 Z"
          fill="url(#hairGrad)"
        />

        {/* Face Features */}
        {/* Cheerful Eyebrows */}
        <path d="M272 138 Q285 130 295 136" stroke="#451a03" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M320 136 Q330 130 342 138" stroke="#451a03" strokeWidth="3.5" strokeLinecap="round" fill="none" />

        {/* Left Eye: Open & Sparkly */}
        <ellipse cx="282" cy="155" rx="9" ry="12" fill="#1e293b" />
        <ellipse cx="282" cy="155" rx="7" ry="10" fill="#0284c7" />
        <circle cx="280" cy="151" r="3.5" fill="#ffffff" />
        <circle cx="284" cy="158" r="1.5" fill="#ffffff" />

        {/* Right Eye: Cute Wink 😉 */}
        <path
          d="M322 156 Q332 165 342 156"
          stroke="#1e293b"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Rosy Cheeks */}
        <ellipse cx="268" cy="168" rx="8" ry="5" fill="#f43f5e" opacity="0.35" />
        <ellipse cx="342" cy="168" rx="8" ry="5" fill="#f43f5e" opacity="0.35" />

        {/* Nose */}
        <path d="M305 158 Q308 165 303 167" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Cheerful Mouth / Grin */}
        <path
          d="M292 178 Q305 195 320 178"
          stroke="#991b1b"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="#be123c"
        />
        <path d="M296 179 Q305 184 316 179" fill="#ffffff" />

        {/* Detective Fedora Hat */}
        {/* Hat Brim */}
        <path
          d="M225 130 C240 105, 370 105, 385 130 C350 145, 260 145, 225 130 Z"
          fill="url(#hatGrad)"
          stroke="#451a03"
          strokeWidth="1.5"
        />
        {/* Hat Ribbon */}
        <path
          d="M250 115 C265 95, 345 95, 360 115 L358 128 C345 118, 265 118, 252 128 Z"
          fill="url(#hatBandGrad)"
        />
        {/* Hat Crown / Top */}
        <path
          d="M256 115 C260 50, 350 50, 354 115 Z"
          fill="url(#hatGrad)"
        />
        {/* Hat Crease indentation */}
        <path
          d="M285 62 Q305 78 325 62"
          stroke="#5c2e0b"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Detective Hand & Arm holding the Magnifying Glass */}
        <path
          d="M330 260 C310 240, 280 230, 270 200"
          stroke="url(#coatGrad)"
          strokeWidth="28"
          strokeLinecap="round"
          fill="none"
        />
        {/* Hand */}
        <ellipse cx="270" cy="190" rx="16" ry="14" fill="url(#skinGrad)" />
        <circle cx="262" cy="182" r="6" fill="url(#skinGrad)" />
        <circle cx="270" cy="178" r="6" fill="url(#skinGrad)" />
        <circle cx="278" cy="180" r="6" fill="url(#skinGrad)" />

        {/* MAGNIFYING GLASS (Prominent, High-Gloss 3D) */}
        {/* Handle */}
        <g transform="translate(270, 190) rotate(-35)">
          <rect x="-8" y="0" width="16" height="55" rx="8" fill="url(#goldRim)" stroke="#78350f" strokeWidth="1.5" />
          <rect x="-5" y="4" width="10" height="47" rx="5" fill="#fef08a" opacity="0.6" />
        </g>

        {/* Magnifying Glass Lens Frame */}
        <g transform="translate(245, 125)">
          {/* Golden Outer Rim */}
          <circle cx="50" cy="50" r="48" fill="none" stroke="url(#goldRim)" strokeWidth="8" />
          <circle cx="50" cy="50" r="44" fill="none" stroke="#78350f" strokeWidth="1" />

          {/* Glass Lens with Translucent Fill */}
          <circle cx="50" cy="50" r="43" fill="url(#lensGrad)" />

          {/* Magnified Question Mark Inside the Lens! */}
          <text
            x="50"
            y="65"
            textAnchor="middle"
            fill="#0369a1"
            fontSize="46"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
            opacity="0.85"
          >
            ?
          </text>

          {/* Glossy Curved Lens Reflection */}
          <path
            d="M20 35 A 36 36 0 0 1 70 20 A 32 32 0 0 0 25 55 Z"
            fill="#ffffff"
            opacity="0.75"
          />
          <circle cx="72" cy="72" r="5" fill="#ffffff" opacity="0.6" />
        </g>

        {/* Sparkle Stars */}
        <g transform="translate(160, 190)">
          <path
            d="M 10 0 Q 10 10 20 10 Q 10 10 10 20 Q 10 10 0 10 Q 10 10 10 0 Z"
            fill="#fef08a"
          />
        </g>
        <g transform="translate(370, 195)">
          <path
            d="M 8 0 Q 8 8 16 8 Q 8 8 8 16 Q 8 8 0 8 Q 8 8 8 0 Z"
            fill="#fef08a"
          />
        </g>
      </svg>
    </div>
  );
};

/**
 * 3D Educational Books + Notepad Checklist Illustration
 * Matches the bottom summary card of the mockup:
 * - Stack of 3 colorful textbooks (blue, orange, turquoise)
 * - Pinned notebook checklist with green checkmarks
 * - Yellow wooden pencil with red eraser
 */
export const StudyStackIllustration: React.FC<{ className?: string }> = ({
  className = 'w-24 h-24 sm:w-28 sm:h-28',
}) => {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Bottom Orange Book */}
        <g transform="translate(15, 95)">
          <rect x="0" y="8" width="95" height="22" rx="4" fill="#ea580c" />
          <rect x="6" y="10" width="85" height="18" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
          <rect x="0" y="0" width="95" height="10" rx="3" fill="#f97316" />
          {/* Spine Ribbon */}
          <rect x="75" y="10" width="8" height="18" fill="#3b82f6" />
        </g>

        {/* Middle Cyan Book */}
        <g transform="translate(20, 75) rotate(-3)">
          <rect x="0" y="8" width="88" height="20" rx="4" fill="#0284c7" />
          <rect x="6" y="10" width="78" height="16" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
          <rect x="0" y="0" width="88" height="10" rx="3" fill="#38bdf8" />
        </g>

        {/* Top Teal Book */}
        <g transform="translate(22, 55) rotate(4)">
          <rect x="0" y="8" width="82" height="20" rx="4" fill="#0d9488" />
          <rect x="6" y="10" width="72" height="16" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
          <rect x="0" y="0" width="82" height="10" rx="3" fill="#14b8a6" />
          {/* Bookmark ribbon hanging out */}
          <path d="M45 10 L45 28 L49 24 L53 28 L53 10 Z" fill="#ef4444" />
        </g>
      </svg>
    </div>
  );
};
