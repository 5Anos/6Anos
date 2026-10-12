import React from 'react';

/**
 * MUNDO 1: GUARDIÃO DIGITAL MASCOT
 * Pixar 3D style cute boy/girl cyber guardian with a glowing green & gold cyber shield,
 * friendly smile, winking, futuristic hoodie/cape, floating key, padlock, and cyber sparkles!
 */
export const GuardianKidHero: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto max-w-[340px]',
}) => {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <svg viewBox="0 0 460 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-md">
        <defs>
          <linearGradient id="gShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="gGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="gCapeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
          <linearGradient id="gSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fee0cb" />
            <stop offset="100%" stopColor="#f8b894" />
          </linearGradient>
          <linearGradient id="gHairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Floating Clouds & Sparkles */}
        <ellipse cx="60" cy="80" rx="45" ry="24" fill="#ffffff" opacity="0.6" />
        <ellipse cx="400" cy="210" rx="55" ry="28" fill="#ffffff" opacity="0.6" />

        {/* Floating Golden Key (Left) */}
        <g transform="translate(90, 70) rotate(-20)">
          <circle cx="20" cy="20" r="16" fill="url(#gGoldGrad)" />
          <circle cx="20" cy="20" r="8" fill="#ffffff" />
          <rect x="28" y="16" width="38" height="8" rx="3" fill="url(#gGoldGrad)" />
          <rect x="52" y="24" width="8" height="10" rx="2" fill="url(#gGoldGrad)" />
          <rect x="60" y="24" width="6" height="7" rx="1.5" fill="url(#gGoldGrad)" />
        </g>

        {/* Floating Cyber Lock (Right) */}
        <g transform="translate(370, 70) rotate(15)">
          <path d="M 12 24 C 12 10, 36 10, 36 24" fill="none" stroke="url(#gGoldGrad)" strokeWidth="6" strokeLinecap="round" />
          <rect x="2" y="22" width="44" height="34" rx="10" fill="url(#gShieldGrad)" />
          <circle cx="24" cy="36" r="4" fill="#ffffff" />
          <line x1="24" y1="36" x2="24" y2="45" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* Superhero Cape */}
        <path d="M220 220 C180 280, 160 360, 150 380 L390 380 C380 340, 360 280, 320 220 Z" fill="url(#gCapeGrad)" />

        {/* Body & Cyber Suit */}
        <path d="M225 240 C220 215, 375 215, 370 240 L395 380 L205 380 Z" fill="#0f766e" />
        {/* Cyber Armor Plate */}
        <polygon points="275,230 325,230 335,290 300,320 265,290" fill="#14b8a6" stroke="url(#gGoldGrad)" strokeWidth="3" />
        <path d="M300 245 L300 295" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />

        {/* Head & Neck */}
        <rect x="280" y="190" width="40" height="32" rx="10" fill="#f8b894" />
        <ellipse cx="300" cy="165" rx="55" ry="60" fill="url(#gSkinGrad)" />
        <ellipse cx="245" cy="165" rx="10" ry="14" fill="url(#gSkinGrad)" />
        <ellipse cx="355" cy="165" rx="10" ry="14" fill="url(#gSkinGrad)" />

        {/* Cool Spiky Cyber Hair with Green Headband */}
        <path d="M245 135 C255 90, 345 90, 355 135 C345 125, 335 110, 320 120 C305 105, 290 120, 275 110 C260 125, 250 125, 245 135 Z" fill="url(#gHairGrad)" />
        {/* Headband */}
        <path d="M248 135 C270 125, 330 125, 352 135 L350 145 C330 135, 270 135, 248 145 Z" fill="url(#gShieldGrad)" />
        <circle cx="300" cy="138" r="5" fill="url(#gGoldGrad)" />

        {/* Face Features */}
        <path d="M268 134 Q280 126 292 132" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M308 132 Q320 126 332 134" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Right Eye (Sparkly Emerald) */}
        <ellipse cx="280" cy="152" rx="10" ry="13" fill="#ffffff" />
        <ellipse cx="280" cy="152" rx="7" ry="10" fill="#059669" />
        <circle cx="280" cy="152" r="4.5" fill="#0f172a" />
        <circle cx="278" cy="148" r="3" fill="#ffffff" />
        {/* Left Eye (Wink) */}
        <path d="M312 152 Q324 163 336 152" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* Rosy Cheeks */}
        <ellipse cx="266" cy="166" rx="8" ry="5" fill="#f43f5e" opacity="0.35" />
        <ellipse cx="334" cy="166" rx="8" ry="5" fill="#f43f5e" opacity="0.35" />
        {/* Grin Smile */}
        <path d="M285 174 Q300 193 315 174 Z" fill="#be123c" />
        <path d="M288 174 Q300 180 312 174 Z" fill="#ffffff" />

        {/* GIANT GLOWING CYBER SHIELD HELD IN FRONT */}
        <g transform="translate(195, 150)">
          <path d="M 50 15 L 90 25 C 90 85, 50 120, 50 120 C 50 120, 10 85, 10 25 Z" fill="url(#gShieldGrad)" stroke="url(#gGoldGrad)" strokeWidth="6" />
          <path d="M 50 30 L 80 38 C 80 80, 50 105, 50 105 C 50 105, 20 80, 20 38 Z" fill="#10b981" opacity="0.8" />
          {/* Big White Cyber Checkmark inside Shield */}
          <path d="M 32 60 L 45 74 L 70 48" fill="none" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
};

/**
 * MUNDO 2: DETETIVE DIGITAL MASCOT (DETETIVE DA INFORMAÇÃO)
 * Pixar 3D style cute boy detective with fedora hat, camel trench coat, cute tie,
 * holding a giant gleaming high-gloss 3D magnifying glass, with floating newspaper
 * "NOTÍCIA FALSA?", floating question bubble, and verified checkmark badge!
 */
export const DetectiveKidHero: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto max-w-[350px]',
}) => {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <svg viewBox="0 0 460 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-md">
        <defs>
          <linearGradient id="dCoatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="40%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="dHatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a16207" />
            <stop offset="50%" stopColor="#854d0e" />
            <stop offset="100%" stopColor="#583101" />
          </linearGradient>
          <linearGradient id="dHatRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#451a03" />
            <stop offset="100%" stopColor="#290e02" />
          </linearGradient>
          <linearGradient id="dSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fee0cb" />
            <stop offset="100%" stopColor="#f8b894" />
          </linearGradient>
          <linearGradient id="dGlassRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="45%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="dGlassLens" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#bae6fd" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="dHandleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="dGoldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        {/* Ambient background clouds */}
        <ellipse cx="60" cy="80" rx="45" ry="24" fill="#ffffff" opacity="0.6" />
        <ellipse cx="400" cy="210" rx="55" ry="28" fill="#ffffff" opacity="0.6" />

        {/* Floating Newspaper "NOTÍCIA FALSA?" (Left Side) */}
        <g transform="translate(75, 45) rotate(-12)">
          <rect x="0" y="0" width="70" height="52" rx="7" fill="#ffffff" stroke="#93c5fd" strokeWidth="2" />
          <rect x="8" y="7" width="54" height="11" rx="2.5" fill="#e2e8f0" />
          <text x="35" y="15" textAnchor="middle" fill="#1e293b" fontSize="8" fontWeight="900" fontFamily="sans-serif">
            NOTÍCIA
          </text>
          {/* Red Stamp Badge "FALSA?" */}
          <g transform="translate(14, 21) rotate(4)">
            <rect x="0" y="0" width="44" height="15" rx="3" fill="#ef4444" />
            <text x="22" y="11" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="900" fontFamily="sans-serif">
              FALSA?
            </text>
          </g>
          <line x1="8" y1="41" x2="62" y2="41" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="46" x2="48" y2="46" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Floating Blue Question & Verified Badge (Right Side) */}
        <g transform="translate(370, 55) rotate(14)">
          <circle cx="25" cy="25" r="22" fill="#ffffff" stroke="#38bdf8" strokeWidth="2.5" />
          <circle cx="25" cy="25" r="16" fill="#0284c7" />
          <text x="25" y="32" textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="900" fontFamily="sans-serif">
            ?
          </text>
          {/* Little green verification badge */}
          <circle cx="40" cy="10" r="8" fill="#10b981" />
          <path d="M 37 10 L 39 12 L 43 8" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Detective Body & Trench Coat */}
        <path d="M225 240 C220 215, 375 215, 370 240 L395 380 L205 380 Z" fill="url(#dCoatGrad)" />
        {/* Shirt Collar */}
        <path d="M280 225 L300 265 L320 225 Z" fill="#ffffff" />
        {/* Dark Tie */}
        <path d="M295 230 L300 260 L305 230 Z" fill="#451a03" />
        <polygon points="297,260 303,260 304,285 300,290 296,285" fill="#381903" />
        {/* Lapels */}
        <path d="M245 230 L285 270 L275 315 L235 245 Z" fill="#b45309" />
        <path d="M355 230 L315 270 L325 315 L365 245 Z" fill="#b45309" />
        {/* Buttons */}
        <circle cx="308" cy="310" r="4" fill="#451a03" />
        <circle cx="308" cy="335" r="4" fill="#451a03" />

        {/* Head & Neck */}
        <rect x="280" y="190" width="40" height="32" rx="10" fill="#f8b894" />
        <ellipse cx="300" cy="165" rx="55" ry="60" fill="url(#dSkinGrad)" />
        <ellipse cx="245" cy="165" rx="10" ry="14" fill="url(#dSkinGrad)" />
        <ellipse cx="355" cy="165" rx="10" ry="14" fill="url(#dSkinGrad)" />

        {/* Cheerful Hair Peeking Under Hat */}
        <path d="M250 142 C260 120, 340 120, 350 142 C338 135, 325 145, 310 138 C295 145, 280 138, 265 145 Z" fill="#673510" />

        {/* Classic Fedora Hat with Ribbon */}
        <g transform="translate(0, -5)">
          {/* Hat Crown */}
          <path d="M255 125 C258 65, 342 65, 345 125 Z" fill="url(#dHatGrad)" />
          {/* Crown Crease Indentation */}
          <path d="M280 75 Q300 90 320 75" stroke="#451a03" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Ribbon Band */}
          <path d="M250 125 C265 105, 335 105, 350 125 L348 136 C335 126, 265 126, 252 136 Z" fill="url(#dHatRibbon)" />
          {/* Curved Brim */}
          <path d="M225 136 C240 115, 360 115, 375 136 C345 150, 255 150, 225 136 Z" fill="url(#dHatGrad)" stroke="#451a03" strokeWidth="1.5" />
        </g>

        {/* Face Features */}
        {/* Eyebrows */}
        <path d="M268 134 Q280 126 292 132" stroke="#451a03" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M308 132 Q320 126 332 134" stroke="#451a03" strokeWidth="3.5" strokeLinecap="round" fill="none" />

        {/* Right Eye (Sparkly Oceanic Blue with Highlights) */}
        <ellipse cx="280" cy="152" rx="10" ry="13" fill="#ffffff" />
        <ellipse cx="280" cy="152" rx="7.5" ry="10.5" fill="#0284c7" />
        <circle cx="280" cy="152" r="5" fill="#0f172a" />
        <circle cx="277" cy="148" r="3" fill="#ffffff" />
        <circle cx="282" cy="155" r="1.5" fill="#ffffff" />

        {/* Left Eye (Playful Wink 😉) */}
        <path d="M312 152 Q324 163 336 152" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M334 154 L339 151" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />

        {/* Rosy Cheeks */}
        <ellipse cx="266" cy="166" rx="8" ry="5" fill="#f43f5e" opacity="0.35" />
        <ellipse cx="334" cy="166" rx="8" ry="5" fill="#f43f5e" opacity="0.35" />

        {/* Cheerful Grin Smile with Top Teeth */}
        <path d="M285 174 Q300 193 315 174 Z" fill="#be123c" />
        <path d="M288 174 Q300 180 312 174 Z" fill="#ffffff" />

        {/* GIANT 3D HIGH-GLOSS MAGNIFYING GLASS HELD IN FRONT */}
        <g transform="translate(185, 145)">
          {/* Arm holding handle */}
          <path d="M110 90 C85 85, 60 70, 45 45" stroke="url(#dCoatGrad)" strokeWidth="22" strokeLinecap="round" fill="none" />
          {/* Hand */}
          <ellipse cx="45" cy="42" rx="13" ry="11" fill="url(#dSkinGrad)" />
          {/* Handle */}
          <g transform="translate(45, 42) rotate(-38)">
            <rect x="-6" y="0" width="12" height="48" rx="6" fill="url(#dHandleGrad)" stroke="#0f172a" strokeWidth="1.5" />
            <rect x="-3" y="4" width="6" height="40" rx="3" fill="#94a3b8" opacity="0.6" />
          </g>

          {/* Glistening Magnifying Glass Frame */}
          <g transform="translate(20, -15)">
            {/* Outer Blue Metallic Rim */}
            <circle cx="46" cy="46" r="44" fill="none" stroke="url(#dGlassRim)" strokeWidth="8" />
            <circle cx="46" cy="46" r="40" fill="none" stroke="url(#dGoldTrim)" strokeWidth="1.5" />
            {/* Translucent Glass Lens */}
            <circle cx="46" cy="46" r="39" fill="url(#dGlassLens)" />
            {/* Glare Reflection Arc */}
            <path d="M20 32 A 32 32 0 0 1 65 18 A 28 28 0 0 0 24 48 Z" fill="#ffffff" opacity="0.8" />
            <circle cx="68" cy="68" r="4.5" fill="#ffffff" opacity="0.65" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export const DetectiveBoyHero = DetectiveKidHero;

/**
 * MUNDO 3: CRIADOR COLABORATIVO MASCOT
 * Pixar 3D style cute creative artist kid with purple hoodie, artist beret,
 * holding a glowing magic digital stylus, with floating emojis, paint palette,
 * creative commons emblem and collaborative speech bubbles!
 */
export const CreativeKidHero: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto max-w-[340px]',
}) => {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <svg viewBox="0 0 460 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-md">
        <defs>
          <linearGradient id="cPurpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#6b21a8" />
          </linearGradient>
          <linearGradient id="cPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>
          <linearGradient id="cSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fee0cb" />
            <stop offset="100%" stopColor="#f8b894" />
          </linearGradient>
        </defs>

        {/* Ambient clouds */}
        <ellipse cx="60" cy="80" rx="45" ry="24" fill="#ffffff" opacity="0.6" />
        <ellipse cx="400" cy="210" rx="55" ry="28" fill="#ffffff" opacity="0.6" />

        {/* Floating Collaborative Chat Bubble (Left) */}
        <g transform="translate(80, 60) rotate(-10)">
          <rect x="0" y="0" width="60" height="42" rx="14" fill="#ffffff" stroke="#c084fc" strokeWidth="2.5" />
          <path d="M 15 42 L 15 52 L 28 42 Z" fill="#ffffff" />
          <circle cx="18" cy="21" r="4" fill="#9333ea" />
          <circle cx="30" cy="21" r="4" fill="#ec4899" />
          <circle cx="42" cy="21" r="4" fill="#3b82f6" />
        </g>

        {/* Floating Creative Commons / Artist Palette (Right) */}
        <g transform="translate(370, 65) rotate(15)">
          <ellipse cx="28" cy="26" rx="26" ry="22" fill="#ffffff" stroke="#f472b6" strokeWidth="2.5" />
          <circle cx="18" cy="18" r="4" fill="#ef4444" />
          <circle cx="28" cy="14" r="4" fill="#eab308" />
          <circle cx="38" cy="20" r="4" fill="#10b981" />
          <circle cx="34" cy="32" r="4" fill="#3b82f6" />
        </g>

        {/* Body / Creative Hoodie */}
        <path d="M225 240 C220 215, 375 215, 370 240 L395 380 L205 380 Z" fill="url(#cPurpGrad)" />
        <path d="M270 220 L300 270 L330 220 Z" fill="#ffffff" />
        <circle cx="300" cy="300" r="8" fill="#f472b6" />

        {/* Head & Neck */}
        <rect x="280" y="190" width="40" height="32" rx="10" fill="#f8b894" />
        <ellipse cx="300" cy="165" rx="55" ry="60" fill="url(#cSkinGrad)" />
        <ellipse cx="245" cy="165" rx="10" ry="14" fill="url(#cSkinGrad)" />
        <ellipse cx="355" cy="165" rx="10" ry="14" fill="url(#cSkinGrad)" />

        {/* Artist Beret in Hot Pink / Purple */}
        <ellipse cx="295" cy="115" rx="65" ry="28" fill="url(#cPinkGrad)" />
        <circle cx="295" cy="87" r="5" fill="#db2777" />
        <path d="M245 135 C260 110, 340 110, 355 135 C340 128, 260 128, 245 135 Z" fill="#78350f" />

        {/* Face */}
        <path d="M268 134 Q280 126 292 132" stroke="#451a03" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M308 132 Q320 126 332 134" stroke="#451a03" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Eye & Wink */}
        <ellipse cx="280" cy="152" rx="10" ry="13" fill="#ffffff" />
        <ellipse cx="280" cy="152" rx="7" ry="10" fill="#8b5cf6" />
        <circle cx="280" cy="152" r="4.5" fill="#0f172a" />
        <circle cx="278" cy="148" r="3" fill="#ffffff" />
        <path d="M312 152 Q324 163 336 152" stroke="#451a03" strokeWidth="4" strokeLinecap="round" fill="none" />
        <ellipse cx="266" cy="166" rx="8" ry="5" fill="#f43f5e" opacity="0.35" />
        <ellipse cx="334" cy="166" rx="8" ry="5" fill="#f43f5e" opacity="0.35" />
        <path d="M285 174 Q300 193 315 174 Z" fill="#be123c" />
        <path d="M288 174 Q300 180 312 174 Z" fill="#ffffff" />

        {/* Hand Holding Glowing Magic Digital Stylus */}
        <g transform="translate(190, 160)">
          <line x1="20" y1="90" x2="80" y2="10" stroke="#f472b6" strokeWidth="12" strokeLinecap="round" />
          <line x1="20" y1="90" x2="80" y2="10" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
          <polygon points="80,10 92,2 86,16" fill="#fbbf24" />
          {/* Glowing Magic Sparkles from Tip */}
          <circle cx="92" cy="2" r="6" fill="#facc15" />
          <path d="M 92 -10 L 92 14 M 80 2 L 104 2" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

/**
 * MUNDO 4: ENGENHEIRO DE ALGORITMOS MASCOT
 * Pixar 3D style cute young coder with glasses, friendly robotic companion pet,
 * puzzle pieces, code blocks (<>), looping arrows and cheerful thumbs up!
 */
export const EngineerKidHero: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto max-w-[340px]',
}) => {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <svg viewBox="0 0 460 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-md">
        <defs>
          <linearGradient id="eGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="eRobotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id="eSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fee0cb" />
            <stop offset="100%" stopColor="#f8b894" />
          </linearGradient>
        </defs>

        {/* Ambient clouds */}
        <ellipse cx="60" cy="80" rx="45" ry="24" fill="#ffffff" opacity="0.6" />
        <ellipse cx="400" cy="210" rx="55" ry="28" fill="#ffffff" opacity="0.6" />

        {/* Floating Code Block "< / >" (Left) */}
        <g transform="translate(80, 60) rotate(-12)">
          <rect x="0" y="0" width="58" height="42" rx="12" fill="#1e293b" stroke="#f59e0b" strokeWidth="2.5" />
          <text x="29" y="27" textAnchor="middle" fill="#38bdf8" fontSize="18" fontWeight="900" fontFamily="monospace">
            &lt;/&gt;
          </text>
        </g>

        {/* Floating Mini Robot Companion (Right Top) */}
        <g transform="translate(360, 45) rotate(8)">
          {/* Antenna */}
          <line x1="30" y1="12" x2="30" y2="4" stroke="#64748b" strokeWidth="3" />
          <circle cx="30" cy="3" r="4" fill="#38bdf8" />
          {/* Robot Head */}
          <rect x="6" y="12" width="48" height="38" rx="16" fill="url(#eRobotGrad)" stroke="#475569" strokeWidth="2" />
          {/* Screen Visor */}
          <rect x="14" y="20" width="32" height="18" rx="8" fill="#0f172a" />
          {/* Glowing Eyes */}
          <circle cx="23" cy="29" r="4" fill="#38bdf8" />
          <circle cx="37" cy="29" r="4" fill="#38bdf8" />
          {/* Floating Boost Jet */}
          <polygon points="26,50 34,50 30,60" fill="#f59e0b" />
        </g>

        {/* Engineer Body / Jacket */}
        <path d="M225 240 C220 215, 375 215, 370 240 L395 380 L205 380 Z" fill="#0284c7" />
        <path d="M270 230 L300 280 L330 230 Z" fill="#f8fafc" />
        <rect x="250" y="290" width="100" height="8" rx="4" fill="#f59e0b" />

        {/* Head & Neck */}
        <rect x="280" y="190" width="40" height="32" rx="10" fill="#f8b894" />
        <ellipse cx="300" cy="165" rx="55" ry="60" fill="url(#eSkinGrad)" />

        {/* Hair with Coder Headset */}
        <path d="M245 135 C255 95, 345 95, 355 135 C345 125, 255 125, 245 135 Z" fill="#b45309" />
        {/* Headset Arc */}
        <path d="M238 165 C235 90, 365 90, 362 165" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
        <rect x="230" y="150" width="14" height="26" rx="6" fill="#f59e0b" />
        <rect x="356" y="150" width="14" height="26" rx="6" fill="#f59e0b" />

        {/* Cool Round Glasses */}
        <circle cx="278" cy="154" r="15" fill="#e0f2fe" opacity="0.6" stroke="#1e293b" strokeWidth="3" />
        <circle cx="322" cy="154" r="15" fill="#e0f2fe" opacity="0.6" stroke="#1e293b" strokeWidth="3" />
        <line x1="293" y1="154" x2="307" y2="154" stroke="#1e293b" strokeWidth="3" />
        {/* Sparkly Eyes inside Glasses */}
        <circle cx="278" cy="154" r="5" fill="#0f172a" />
        <circle cx="276" cy="151" r="2.5" fill="#ffffff" />
        <circle cx="322" cy="154" r="5" fill="#0f172a" />
        <circle cx="320" cy="151" r="2.5" fill="#ffffff" />

        <path d="M285 178 Q300 196 315 178 Z" fill="#be123c" />
        <path d="M288 178 Q300 184 312 178 Z" fill="#ffffff" />

        {/* Giant Thumbs Up Hand */}
        <g transform="translate(190, 190)">
          <ellipse cx="25" cy="35" rx="18" ry="15" fill="url(#eSkinGrad)" />
          <rect x="18" y="5" width="14" height="30" rx="7" fill="url(#eSkinGrad)" />
        </g>
      </svg>
    </div>
  );
};

/**
 * MUNDO 5: PIONEIRO DA IA MASCOT
 * Pixar 3D style young space pioneer with astronaut helmet / visor,
 * holding an interactive holographic crystal AI orb, rocket, and smiling confident expression!
 */
export const AIPioneerHero: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto max-w-[340px]',
}) => {
  return (
    <div className={`relative select-none pointer-events-none ${className}`}>
      <svg viewBox="0 0 460 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-md">
        <defs>
          <linearGradient id="aiSuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#3730a3" />
          </linearGradient>
          <linearGradient id="aiOrbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="aiSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fee0cb" />
            <stop offset="100%" stopColor="#f8b894" />
          </linearGradient>
        </defs>

        {/* Ambient clouds */}
        <ellipse cx="60" cy="80" rx="45" ry="24" fill="#ffffff" opacity="0.6" />
        <ellipse cx="400" cy="210" rx="55" ry="28" fill="#ffffff" opacity="0.6" />

        {/* Floating Rocket (Left) */}
        <g transform="translate(80, 50) rotate(25)">
          <path d="M 25 5 C 40 20, 40 45, 25 55 C 10 45, 10 20, 25 5 Z" fill="#ffffff" stroke="#6366f1" strokeWidth="2.5" />
          <circle cx="25" cy="26" r="6" fill="#38bdf8" />
          <polygon points="12,38 2,52 16,48" fill="#ef4444" />
          <polygon points="38,38 48,52 34,48" fill="#ef4444" />
          <polygon points="20,55 30,55 25,68" fill="#f59e0b" />
        </g>

        {/* Floating AI Neural Brain Icon (Right) */}
        <g transform="translate(370, 60)">
          <circle cx="26" cy="26" r="24" fill="#ffffff" stroke="#818cf8" strokeWidth="2.5" />
          <circle cx="18" cy="20" r="4" fill="#6366f1" />
          <circle cx="34" cy="20" r="4" fill="#6366f1" />
          <circle cx="26" cy="34" r="4" fill="#06b6d4" />
          <line x1="18" y1="20" x2="34" y2="20" stroke="#818cf8" strokeWidth="2" />
          <line x1="18" y1="20" x2="26" y2="34" stroke="#818cf8" strokeWidth="2" />
          <line x1="34" y1="20" x2="26" y2="34" stroke="#818cf8" strokeWidth="2" />
        </g>

        {/* Space Suit Body */}
        <path d="M225 240 C220 215, 375 215, 370 240 L395 380 L205 380 Z" fill="url(#aiSuitGrad)" />
        <rect x="260" y="240" width="80" height="40" rx="12" fill="#ffffff" />
        <circle cx="280" cy="260" r="6" fill="#06b6d4" />
        <circle cx="300" cy="260" r="6" fill="#10b981" />
        <circle cx="320" cy="260" r="6" fill="#f59e0b" />

        {/* Head & Futuristic Helmet Visor */}
        <rect x="280" y="190" width="40" height="32" rx="10" fill="#f8b894" />
        <ellipse cx="300" cy="165" rx="55" ry="60" fill="url(#aiSkinGrad)" />

        {/* Futuristic Space Visor on Forehead */}
        <path d="M245 130 C270 115, 330 115, 355 130 L350 148 C330 135, 270 135, 250 148 Z" fill="#06b6d4" opacity="0.9" />

        {/* Eyes & Grin */}
        <ellipse cx="280" cy="154" rx="10" ry="13" fill="#ffffff" />
        <ellipse cx="280" cy="154" rx="7" ry="10" fill="#4f46e5" />
        <circle cx="280" cy="154" r="4.5" fill="#0f172a" />
        <circle cx="278" cy="150" r="3" fill="#ffffff" />
        <path d="M312 154 Q324 165 336 154" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" fill="none" />
        <ellipse cx="266" cy="168" rx="8" ry="5" fill="#f43f5e" opacity="0.35" />
        <ellipse cx="334" cy="168" rx="8" ry="5" fill="#f43f5e" opacity="0.35" />
        <path d="M285 178 Q300 196 315 178 Z" fill="#be123c" />
        <path d="M288 178 Q300 184 312 178 Z" fill="#ffffff" />

        {/* GLOWING HOLOGRAPHIC AI ORB HELD IN FRONT */}
        <g transform="translate(195, 140)">
          <circle cx="50" cy="50" r="42" fill="url(#aiOrbGrad)" opacity="0.9" />
          <circle cx="50" cy="50" r="34" fill="#ffffff" opacity="0.4" />
          <path d="M 50 15 A 35 35 0 0 1 85 50" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          {/* Sparkle Star Inside AI Orb */}
          <path d="M 50 30 Q 50 50 70 50 Q 50 50 50 70 Q 50 50 30 50 Q 50 50 50 30 Z" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
};
