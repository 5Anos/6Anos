import React from 'react';

/**
 * High-Fidelity 3D Cartoon Detective Boy Mascot
 * Pixel-accurate vector art matching the user's reference mockup (image.png):
 * - Cute 3D Pixar-style boy detective with brown fedora hat and camel trench coat
 * - Cheerful wink on left eye, large bright blue right eye with double gleam
 * - Holding a large high-gloss blue-rimmed magnifying glass in front
 * - Floating elements:
 *   1. Tilted newspaper with "NOTÍCIA" in black and red box "FALSA?"
 *   2. Blue question mark bubbles ("?")
 *   3. Yellow book/folder with bookmark
 *   4. Floating white diamond with blue globe
 *   5. Floating white square with green checkmark
 *   6. Soft clouds and sparkle stars
 */
export const DetectiveBoyHero: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto max-w-[380px]',
}) => {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 460 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-md"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.3" />
          </linearGradient>

          {/* Fedora Hat Gradients */}
          <linearGradient id="hatBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a76829" />
            <stop offset="45%" stopColor="#8d4e16" />
            <stop offset="100%" stopColor="#67340b" />
          </linearGradient>

          <linearGradient id="hatBrimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b97834" />
            <stop offset="60%" stopColor="#874712" />
            <stop offset="100%" stopColor="#5d2c08" />
          </linearGradient>

          <linearGradient id="hatRibbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3d1d05" />
            <stop offset="50%" stopColor="#251002" />
            <stop offset="100%" stopColor="#451e06" />
          </linearGradient>

          {/* Coat Gradients */}
          <linearGradient id="coatBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c88339" />
            <stop offset="40%" stopColor="#aa621c" />
            <stop offset="100%" stopColor="#88460c" />
          </linearGradient>

          <linearGradient id="coatLapelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d59349" />
            <stop offset="100%" stopColor="#9a5214" />
          </linearGradient>

          {/* Skin Gradients */}
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fee0cb" />
            <stop offset="45%" stopColor="#fcd2b5" />
            <stop offset="100%" stopColor="#f8b894" />
          </linearGradient>

          <linearGradient id="skinShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f9b996" />
            <stop offset="100%" stopColor="#e39166" />
          </linearGradient>

          {/* Hair Gradients */}
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#673510" />
            <stop offset="60%" stopColor="#482106" />
            <stop offset="100%" stopColor="#301402" />
          </linearGradient>

          {/* Blue Magnifying Glass Frame */}
          <linearGradient id="magRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="40%" stopColor="#0284c7" />
            <stop offset="80%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>

          {/* Glass Lens Gradient */}
          <linearGradient id="magLensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#bae6fd" stopOpacity="0.55" />
            <stop offset="85%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.25" />
          </linearGradient>

          {/* Handle Gradient */}
          <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Globe Gradient */}
          <linearGradient id="globeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Checkmark Gradient */}
          <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Newspaper Paper Gradient */}
          <linearGradient id="paperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>

          {/* Shadow Filter */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.18" floodColor="#0f172a" />
          </filter>
        </defs>

        {/* ======================================================== */}
        {/* 1. BACKGROUND FLOATING ELEMENTS & CLOUDS                 */}
        {/* ======================================================== */}

        {/* Ambient Soft Cloud Puffs */}
        <g opacity="0.65">
          <ellipse cx="60" cy="80" rx="45" ry="24" fill="url(#cloudGrad)" />
          <ellipse cx="90" cy="72" rx="35" ry="20" fill="url(#cloudGrad)" />
          <ellipse cx="395" cy="210" rx="55" ry="28" fill="url(#cloudGrad)" />
          <ellipse cx="420" cy="225" rx="35" ry="20" fill="url(#cloudGrad)" />
        </g>

        {/* Floating Question Bubble (Top Left) */}
        <g transform="translate(60, 95)" filter="url(#softShadow)">
          <circle cx="20" cy="20" r="18" fill="#dbeafe" opacity="0.85" />
          <circle cx="20" cy="20" r="14" fill="#38bdf8" />
          <text
            x="20"
            y="26"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="18"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            ?
          </text>
        </g>

        {/* Floating Question Bubble (Right Above Hat) */}
        <g transform="translate(370, 70)" filter="url(#softShadow)">
          <circle cx="16" cy="16" r="15" fill="#bae6fd" opacity="0.85" />
          <circle cx="16" cy="16" r="12" fill="#0284c7" />
          <text
            x="16"
            y="21"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="15"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            ?
          </text>
        </g>

        {/* Floating Newspaper "NOTÍCIA FALSA?" (Left Side, Angled) */}
        <g transform="translate(170, 20) rotate(-14)" filter="url(#softShadow)">
          {/* Main Paper Sheet */}
          <rect x="0" y="0" width="98" height="74" rx="8" fill="url(#paperGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Fold Corner Effect */}
          <path d="M 86 0 L 98 12 L 86 12 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
          {/* Newspaper Header Bar */}
          <rect x="10" y="8" width="76" height="15" rx="3" fill="#e2e8f0" />
          <text
            x="48"
            y="19"
            textAnchor="middle"
            fill="#1e293b"
            fontSize="9"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="0.8"
          >
            NOTÍCIA
          </text>
          {/* Red Stamped Badge "FALSA?" */}
          <g transform="translate(18, 25) rotate(4)">
            <rect x="0" y="0" width="60" height="20" rx="4" fill="#dc2626" />
            <text
              x="30"
              y="14"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="11"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.5"
            >
              FALSA?
            </text>
          </g>
          {/* News Article Placeholder Lines */}
          <line x1="12" y1="52" x2="86" y2="52" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="12" y1="60" x2="72" y2="60" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Floating Yellow Folder / Notebook (Middle Left) */}
        <g transform="translate(175, 115) rotate(16)" filter="url(#softShadow)">
          <rect x="0" y="0" width="40" height="46" rx="6" fill="#fef08a" stroke="#facc15" strokeWidth="1.5" />
          {/* Book Spine */}
          <rect x="0" y="0" width="7" height="46" rx="3" fill="#eab308" />
          <line x1="12" y1="14" x2="34" y2="14" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="22" x2="30" y2="22" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="30" x2="34" y2="30" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Floating White Card with Blue Globe (Right Side) */}
        <g transform="translate(390, 50) rotate(10)" filter="url(#softShadow)">
          <rect x="0" y="0" width="54" height="54" rx="14" fill="#ffffff" stroke="#bae6fd" strokeWidth="2" />
          <circle cx="27" cy="27" r="18" fill="url(#globeGrad)" />
          {/* Globe Lines */}
          <ellipse cx="27" cy="27" rx="9" ry="18" fill="none" stroke="#e0f2fe" strokeWidth="1.5" />
          <line x1="9" y1="27" x2="45" y2="27" stroke="#e0f2fe" strokeWidth="1.5" />
          <line x1="12" y1="19" x2="42" y2="19" stroke="#e0f2fe" strokeWidth="1.2" strokeOpacity="0.85" />
          <line x1="12" y1="35" x2="42" y2="35" stroke="#e0f2fe" strokeWidth="1.2" strokeOpacity="0.85" />
        </g>

        {/* Floating White Card with Green Checkmark (Lower Right) */}
        <g transform="translate(385, 130) rotate(-6)" filter="url(#softShadow)">
          <rect x="0" y="0" width="48" height="48" rx="14" fill="url(#checkGrad)" stroke="#a7f3d0" strokeWidth="1.5" />
          <path
            d="M14 24 L22 32 L34 16"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* ======================================================== */}
        {/* 2. THE DETECTIVE BOY CHARACTER (PIXAR 3D STYLE)          */}
        {/* ======================================================== */}

        {/* Detective Body & Coat */}
        <g id="detectiveBody">
          {/* Shoulders / Coat */}
          <path
            d="M235 240 C230 215, 385 215, 380 240 L410 380 L210 380 Z"
            fill="url(#coatBodyGrad)"
          />
          {/* Coat Center Fold */}
          <line x1="310" y1="260" x2="310" y2="380" stroke="#713f12" strokeWidth="2.5" />
          {/* Coat Buttons */}
          <circle cx="320" cy="290" r="4.5" fill="#451a03" />
          <circle cx="320" cy="325" r="4.5" fill="#451a03" />
          <circle cx="320" cy="360" r="4.5" fill="#451a03" />

          {/* White Shirt Collar */}
          <path d="M288 222 L310 270 L332 222 Z" fill="#ffffff" />
          {/* Dark Brown Necktie */}
          <path d="M304 228 L310 265 L316 228 Z" fill="#451a03" />
          <polygon points="307,265 313,265 315,295 310,302 305,295" fill="#381903" />

          {/* Coat Lapels (Wide Classic Detective Lapels) */}
          <path d="M255 224 L295 275 L282 325 L242 248 Z" fill="url(#coatLapelGrad)" />
          <path d="M365 224 L325 275 L338 325 L378 248 Z" fill="url(#coatLapelGrad)" />
        </g>

        {/* Head & Neck */}
        <g id="detectiveHead">
          {/* Neck */}
          <rect x="290" y="195" width="40" height="32" rx="10" fill="url(#skinShadow)" />

          {/* Head Shape (Chubby Cute Face) */}
          <ellipse cx="310" cy="168" rx="56" ry="62" fill="url(#skinGrad)" />

          {/* Cute Round Ears */}
          <ellipse cx="254" cy="168" rx="10" ry="14" fill="url(#skinGrad)" />
          <ellipse cx="254" cy="168" rx="6" ry="9" fill="url(#skinShadow)" />
          <ellipse cx="366" cy="168" rx="10" ry="14" fill="url(#skinGrad)" />
          <ellipse cx="366" cy="168" rx="6" ry="9" fill="url(#skinShadow)" />

          {/* Cheerful Hair Bangs Peeking Under Hat */}
          <path
            d="M258 142 C268 115, 352 115, 362 142 C348 136, 335 146, 318 139 C302 148, 288 139, 274 148 C266 142, 262 142, 258 142 Z"
            fill="url(#hairGrad)"
          />

          {/* ====================================================== */}
          {/* FACIAL FEATURES                                        */}
          {/* ====================================================== */}

          {/* Left Eyebrow (Cheerful arch) */}
          <path
            d="M272 136 Q286 128 298 134"
            stroke="#451a03"
            strokeWidth="3.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right Eyebrow (Raised in playful wink) */}
          <path
            d="M322 133 Q334 126 348 135"
            stroke="#451a03"
            strokeWidth="3.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* RIGHT EYE: Open, Expressive, Sparkly Blue (Pixar Style) */}
          <g id="rightEye">
            {/* Sclera (White) */}
            <ellipse cx="284" cy="154" rx="11" ry="14" fill="#ffffff" />
            {/* Dark Eyeliner Upper */}
            <path d="M273 148 Q284 140 295 148" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Iris Outer */}
            <ellipse cx="285" cy="154" rx="8" ry="11" fill="#0284c7" />
            {/* Iris Inner Glow */}
            <ellipse cx="285" cy="154" rx="6" ry="8" fill="#38bdf8" />
            {/* Pupil */}
            <circle cx="285" cy="154" r="5" fill="#0f172a" />
            {/* Big Glossy Highlight */}
            <circle cx="282" cy="149" r="3.5" fill="#ffffff" />
            {/* Small Secondary Highlight */}
            <circle cx="288" cy="158" r="1.5" fill="#ffffff" />
          </g>

          {/* LEFT EYE: Cute Wink 😉 (Curved Arc with Eyelashes) */}
          <g id="leftEyeWink">
            <path
              d="M324 154 Q336 165 348 154"
              stroke="#0f172a"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Cute Eyelashes on Wink */}
            <path d="M346 156 L352 153" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M344 159 L350 159" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Rosy Cheeks */}
          <ellipse cx="270" cy="168" rx="9" ry="6" fill="#f43f5e" opacity="0.35" />
          <ellipse cx="348" cy="168" rx="9" ry="6" fill="#f43f5e" opacity="0.35" />

          {/* Cute Button Nose */}
          <path
            d="M308 158 Q311 166 306 167"
            stroke="#c2410c"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cheerful Open Grin Smile */}
          <g id="mouth">
            <path
              d="M294 176 Q310 197 326 176 Z"
              fill="#be123c"
              stroke="#881337"
              strokeWidth="2"
            />
            {/* Top Teeth */}
            <path d="M297 176 Q310 183 323 176 Z" fill="#ffffff" />
            {/* Tongue */}
            <ellipse cx="310" cy="189" rx="8" ry="5" fill="#fb7185" />
          </g>
        </g>

        {/* ======================================================== */}
        {/* 3. DETECTIVE FEDORA HAT                                  */}
        {/* ======================================================== */}
        <g id="fedoraHat" filter="url(#softShadow)">
          {/* Hat Crown / Top Dome */}
          <path
            d="M256 118 C260 52, 354 52, 358 118 Z"
            fill="url(#hatBodyGrad)"
          />
          {/* Crease Indentation at Top */}
          <path
            d="M288 64 Q307 80 326 64"
            stroke="#451a03"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Dark Brown Ribbon Band */}
          <path
            d="M251 118 C266 98, 348 98, 363 118 L360 131 C346 120, 267 120, 254 131 Z"
            fill="url(#hatRibbonGrad)"
          />
          {/* Hat Wide Curved Brim */}
          <path
            d="M224 132 C240 108, 374 108, 390 132 C354 148, 260 148, 224 132 Z"
            fill="url(#hatBrimGrad)"
            stroke="#451a03"
            strokeWidth="1.5"
          />
        </g>

        {/* ======================================================== */}
        {/* 4. ARM, HAND & GIANT MAGNIFYING GLASS                    */}
        {/* ======================================================== */}
        <g id="magnifyingGlassGroup">
          {/* Arm coming from side holding the handle */}
          <path
            d="M340 265 C320 245, 290 235, 276 205"
            stroke="url(#coatBodyGrad)"
            strokeWidth="30"
            strokeLinecap="round"
            fill="none"
          />

          {/* Boy's Hand Gripping the Handle */}
          <g id="hand">
            <ellipse cx="274" cy="196" rx="16" ry="14" fill="url(#skinGrad)" />
            {/* Fingers curved */}
            <circle cx="266" cy="188" r="6.5" fill="url(#skinGrad)" />
            <circle cx="274" cy="184" r="6.5" fill="url(#skinGrad)" />
            <circle cx="282" cy="186" r="6.5" fill="url(#skinGrad)" />
          </g>

          {/* Magnifying Glass Handle (Angled Metallic Grey) */}
          <g transform="translate(276, 196) rotate(-34)">
            <rect x="-8" y="0" width="16" height="58" rx="8" fill="url(#handleGrad)" stroke="#0f172a" strokeWidth="1.5" />
            <rect x="-5" y="4" width="10" height="50" rx="5" fill="#94a3b8" opacity="0.65" />
          </g>

          {/* GIANT HIGH-GLOSS BLUE LENS FRAME */}
          <g transform="translate(250, 126)" filter="url(#softShadow)">
            {/* Outer Blue Metallic Rim */}
            <circle cx="50" cy="50" r="50" fill="none" stroke="url(#magRimGrad)" strokeWidth="9" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="#0c4a6e" strokeWidth="1" />

            {/* Glass Lens (Translucent Sky Blue) */}
            <circle cx="50" cy="50" r="44.5" fill="url(#magLensGrad)" />

            {/* Glossy White Reflection Glare (Upper Left Arc) */}
            <path
              d="M18 36 A 38 38 0 0 1 72 18 A 34 34 0 0 0 24 56 Z"
              fill="#ffffff"
              opacity="0.8"
            />
            {/* Secondary Gloss Dot (Lower Right) */}
            <circle cx="74" cy="74" r="5" fill="#ffffff" opacity="0.65" />
          </g>
        </g>

        {/* Small Golden Sparkles */}
        <g transform="translate(155, 185)">
          <path
            d="M 10 0 Q 10 10 20 10 Q 10 10 10 20 Q 10 10 0 10 Q 10 10 10 0 Z"
            fill="#facc15"
          />
        </g>
        <g transform="translate(415, 115) scale(0.7)">
          <path
            d="M 10 0 Q 10 10 20 10 Q 10 10 10 20 Q 10 10 0 10 Q 10 10 10 0 Z"
            fill="#facc15"
          />
        </g>
      </svg>
    </div>
  );
};

/**
 * 3D Educational Study Stack of Books & Checklist Illustration
 * Matches the exact bottom takeaway card from image.png:
 * - Stack of 3 colorful textbooks with blue, cyan and orange/gold covers
 * - Smooth lighting and 3D shadows
 */
export const StudyStackIllustration: React.FC<{ className?: string }> = ({
  className = 'w-24 h-24 sm:w-28 sm:h-28',
}) => {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 160 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-md"
      >
        <defs>
          <linearGradient id="bookBottomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="bookMidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="bookTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="pageGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>

        {/* Bottom Orange Book */}
        <g transform="translate(15, 75)">
          <path d="M10 22 L115 22 L125 38 L20 38 Z" fill="url(#bookBottomGrad)" />
          <path d="M15 12 L110 12 L115 22 L20 22 Z" fill="url(#pageGrad)" />
          <path d="M5 10 L100 10 L110 26 L15 26 Z" fill="url(#bookBottomGrad)" />
          <rect x="5" y="10" width="12" height="28" rx="4" fill="#92400e" />
        </g>

        {/* Middle Cyan/Blue Book */}
        <g transform="translate(22, 48)">
          <path d="M10 20 L108 20 L118 35 L20 35 Z" fill="url(#bookMidGrad)" />
          <path d="M15 10 L103 10 L108 20 L20 20 Z" fill="url(#pageGrad)" />
          <path d="M5 8 L95 8 L105 24 L15 24 Z" fill="url(#bookMidGrad)" />
          <rect x="5" y="8" width="12" height="27" rx="4" fill="#075985" />
        </g>

        {/* Top Green Book */}
        <g transform="translate(28, 22)">
          <path d="M10 18 L100 18 L110 32 L20 32 Z" fill="url(#bookTopGrad)" />
          <path d="M15 8 L95 8 L100 18 L20 18 Z" fill="url(#pageGrad)" />
          <path d="M5 6 L88 6 L98 22 L15 22 Z" fill="url(#bookTopGrad)" />
          <rect x="5" y="6" width="12" height="26" rx="4" fill="#14532d" />
        </g>
      </svg>
    </div>
  );
};
