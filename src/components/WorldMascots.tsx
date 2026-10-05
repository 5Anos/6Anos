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
