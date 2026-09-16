import React, { useId } from 'react';
import { CustomAvatarConfig } from '../../types/avatar';
import { parseAvatarConfig } from '../../utils/avatarUtils';

interface AvatarRendererProps {
  avatar?: string | CustomAvatarConfig | null;
  size?: number;
  className?: string;
}

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  avatar,
  size = 80,
  className = '',
}) => {
  const config = parseAvatarConfig(avatar);
  const uid = useId().replace(/:/g, '_');

  // Skin tone color map
  const skinColors: Record<string, { base: string; dark: string; light: string }> = {
    'skin-1': { base: '#FED7AA', dark: '#FDBA74', light: '#FFEDD5' },
    'skin-2': { base: '#FDBA74', dark: '#FB923C', light: '#FED7AA' },
    'skin-3': { base: '#EA580C', dark: '#C2410C', light: '#FB923C' },
    'skin-4': { base: '#9A3412', dark: '#7C2D12', light: '#C2410C' },
    'skin-5': { base: '#78350F', dark: '#451A03', light: '#9A3412' },
  };
  const skin = skinColors[config.skin] || skinColors['skin-1'];

  // Background gradient map
  const bgGradients: Record<string, [string, string, string]> = {
    'blue-tech': ['#38BDF8', '#0EA5E9', '#1D4ED8'],
    'purple-sunset': ['#C084FC', '#9333EA', '#4F46E5'],
    'emerald-cyber': ['#34D399', '#059669', '#065F46'],
    'cosmic-dark': ['#818CF8', '#312E81', '#0F172A'],
    'gold-glory': ['#FDE047', '#D97706', '#92400E'],
    'sky-clean': ['#7DD3FC', '#0284C7', '#0369A1'],
  };
  const bg = bgGradients[config.background] || bgGradients['blue-tech'];

  const hairColor = config.hairColor || '#3F2305';
  const clothingColor = config.clothingColor || '#2563EB';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none rounded-full shrink-0 ${className}`}
    >
      <defs>
        {/* Background Gradient */}
        <linearGradient id={`bg_${uid}`} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={bg[0]} />
          <stop offset="50%" stopColor={bg[1]} />
          <stop offset="100%" stopColor={bg[2]} />
        </linearGradient>

        {/* Skin Gradient */}
        <linearGradient id={`skin_${uid}`} x1="45" y1="30" x2="75" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={skin.light} />
          <stop offset="100%" stopColor={skin.dark} />
        </linearGradient>

        {/* Hair Gradient */}
        <linearGradient id={`hair_${uid}`} x1="30" y1="10" x2="90" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={hairColor} />
          <stop offset="100%" stopColor={hairColor} stopOpacity="0.85" />
        </linearGradient>

        {/* Clothing Gradient */}
        <linearGradient id={`cloth_${uid}`} x1="20" y1="75" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={clothingColor} />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0.85" />
        </linearGradient>

        {/* Soft Drop Shadow Filter */}
        <filter id={`shadow_${uid}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* 1. Circle Background */}
      <circle cx="60" cy="60" r="58" fill={`url(#bg_${uid})`} stroke="#FFFFFF" strokeWidth="3.5" />
      <circle cx="60" cy="60" r="55" stroke="#FFFFFF" strokeWidth="1" opacity="0.3" />

      {/* 2. Back Hair (if Ponytail, Long Wavy, or Afro) */}
      {config.hair === 'ponytail' && (
        <g>
          {/* Ponytail tie and hair swoosh on right */}
          <ellipse cx="88" cy="46" rx="14" ry="20" fill={hairColor} transform="rotate(20 88 46)" />
          <circle cx="80" cy="40" r="4" fill={clothingColor} />
        </g>
      )}

      {config.hair === 'long-wavy' && (
        <g>
          <path
            d="M32 45 C24 60, 26 95, 36 108 C40 108, 42 85, 40 70 Z"
            fill={hairColor}
          />
          <path
            d="M88 45 C96 60, 94 95, 84 108 C80 108, 78 85, 80 70 Z"
            fill={hairColor}
          />
        </g>
      )}

      {config.hair === 'afro-puff' && (
        <circle cx="60" cy="46" r="32" fill={hairColor} />
      )}

      {/* 3. Clothing / Shoulders */}
      {config.clothing === 'hoodie' && (
        <g>
          <path d="M20 115 C20 88, 35 76, 60 76 C85 76, 100 88, 100 115 Z" fill={`url(#cloth_${uid})`} />
          <path d="M48 80 L60 96 L72 80 Z" fill="#0F172A" />
          <path d="M36 80 C44 74, 56 74, 60 82 C64 74, 76 74, 84 80 C78 94, 68 98, 60 98 C52 98, 42 94, 36 80 Z" fill={clothingColor} opacity="0.9" />
          <line x1="60" y1="96" x2="60" y2="115" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="2 1" />
        </g>
      )}

      {config.clothing === 'tech-tee' && (
        <g>
          <path d="M22 115 C22 88, 36 78, 60 78 C84 78, 98 88, 98 115 Z" fill={`url(#cloth_${uid})`} />
          <path d="M46 78 Q60 88 74 78 Z" fill={skin.base} />
          {/* Tech Logo Pattern */}
          <circle cx="60" cy="98" r="7" stroke="#38BDF8" strokeWidth="1.5" fill="none" />
          <path d="M57 98 L63 98 M60 95 L60 101" stroke="#38BDF8" strokeWidth="1.5" />
          <line x1="48" y1="98" x2="52" y2="98" stroke="#38BDF8" strokeWidth="1" />
          <line x1="68" y1="98" x2="72" y2="98" stroke="#38BDF8" strokeWidth="1" />
        </g>
      )}

      {config.clothing === 'explorer-jacket' && (
        <g>
          <path d="M20 115 C20 88, 35 76, 60 76 C85 76, 100 88, 100 115 Z" fill={`url(#cloth_${uid})`} />
          <path d="M46 76 L60 92 L74 76 Z" fill="#FEF08A" />
          {/* Collar & pocket */}
          <path d="M38 76 L52 94 L42 96 Z" fill="#78350F" opacity="0.8" />
          <path d="M82 76 L68 94 L78 96 Z" fill="#78350F" opacity="0.8" />
          <rect x="36" y="98" width="14" height="12" rx="2" fill="#78350F" opacity="0.7" />
          <line x1="60" y1="92" x2="60" y2="115" stroke="#FEF08A" strokeWidth="2.5" />
        </g>
      )}

      {config.clothing === 'cyber-suit' && (
        <g>
          <path d="M20 115 C20 88, 35 76, 60 76 C85 76, 100 88, 100 115 Z" fill="#0F172A" />
          <path d="M35 84 L60 76 L85 84 L78 115 L42 115 Z" fill={clothingColor} opacity="0.85" />
          {/* Neon Arc Reactor Core */}
          <circle cx="60" cy="98" r="8" fill="#06B6D4" />
          <circle cx="60" cy="98" r="5" fill="#E0F2FE" />
          <line x1="38" y1="92" x2="50" y2="96" stroke="#22D3EE" strokeWidth="1.5" />
          <line x1="82" y1="92" x2="70" y2="96" stroke="#22D3EE" strokeWidth="1.5" />
        </g>
      )}

      {config.clothing === 'collar-shirt' && (
        <g>
          <path d="M22 115 C22 88, 36 78, 60 78 C84 78, 98 88, 98 115 Z" fill={`url(#cloth_${uid})`} />
          {/* White fold collars */}
          <polygon points="46,78 60,94 54,80" fill="#FFFFFF" />
          <polygon points="74,78 60,94 66,80" fill="#FFFFFF" />
          {/* Tie or button row */}
          <polygon points="57,94 63,94 62,115 58,115" fill="#EF4444" />
        </g>
      )}

      {/* 4. Neck */}
      <rect x="52" y="65" width="16" height="18" rx="6" fill={`url(#skin_${uid})`} />

      {/* 5. Ears */}
      <circle cx="37" cy="52" r="7" fill={skin.base} />
      <circle cx="83" cy="52" r="7" fill={skin.base} />
      <circle cx="38" cy="52" r="4" fill={skin.dark} opacity="0.4" />
      <circle cx="82" cy="52" r="4" fill={skin.dark} opacity="0.4" />

      {/* 6. Head / Face */}
      <path
        d="M40 45 C40 30, 80 30, 80 45 C80 66, 72 74, 60 74 C48 74, 40 66, 40 45 Z"
        fill={`url(#skin_${uid})`}
      />

      {/* Cheeks Blush */}
      <circle cx="46" cy="58" r="4" fill="#F43F5E" opacity="0.22" />
      <circle cx="74" cy="58" r="4" fill="#F43F5E" opacity="0.22" />

      {/* 7. Eyes & Eyebrows */}
      {config.eyes === 'happy' && (
        <g>
          {/* Left Eye */}
          <ellipse cx="48" cy="49" rx="4.5" ry="6" fill="#FFFFFF" />
          <ellipse cx="48.5" cy="49" rx="3.2" ry="4.5" fill="#3F2305" />
          <circle cx="47" cy="47" r="1.5" fill="#FFFFFF" />
          <circle cx="50" cy="51" r="0.8" fill="#FFFFFF" />
          {/* Right Eye */}
          <ellipse cx="72" cy="49" rx="4.5" ry="6" fill="#FFFFFF" />
          <ellipse cx="71.5" cy="49" rx="3.2" ry="4.5" fill="#3F2305" />
          <circle cx="70" cy="47" r="1.5" fill="#FFFFFF" />
          <circle cx="73" cy="51" r="0.8" fill="#FFFFFF" />
          {/* Eyebrows */}
          <path d="M44 41 Q48 38 53 41" stroke="#3F2305" strokeWidth="2" strokeLinecap="round" />
          <path d="M67 41 Q72 38 76 41" stroke="#3F2305" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {config.eyes === 'confident' && (
        <g>
          <ellipse cx="48" cy="49" rx="4.5" ry="5.5" fill="#FFFFFF" />
          <ellipse cx="49" cy="49" rx="3.2" ry="4" fill="#1E293B" />
          <circle cx="48" cy="47.5" r="1.3" fill="#FFFFFF" />
          <ellipse cx="72" cy="49" rx="4.5" ry="5.5" fill="#FFFFFF" />
          <ellipse cx="71" cy="49" rx="3.2" ry="4" fill="#1E293B" />
          <circle cx="70" cy="47.5" r="1.3" fill="#FFFFFF" />
          {/* Confident sharp brows */}
          <path d="M43 41 L53 42" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M67 42 L77 41" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {config.eyes === 'wink' && (
        <g>
          {/* Left Eye Open */}
          <ellipse cx="48" cy="49" rx="4.5" ry="6" fill="#FFFFFF" />
          <ellipse cx="48.5" cy="49" rx="3.2" ry="4.5" fill="#3F2305" />
          <circle cx="47" cy="47" r="1.5" fill="#FFFFFF" />
          <path d="M44 41 Q48 38 53 41" stroke="#3F2305" strokeWidth="2" strokeLinecap="round" />
          {/* Right Eye Wink */}
          <path d="M67 50 Q72 44 77 50" stroke="#3F2305" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M67 40 Q72 37 76 40" stroke="#3F2305" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {config.eyes === 'sparkle' && (
        <g>
          <ellipse cx="48" cy="49" rx="5" ry="6" fill="#1E1B4B" />
          <ellipse cx="72" cy="49" rx="5" ry="6" fill="#1E1B4B" />
          {/* Yellow 4-point star in left eye */}
          <polygon points="48,44 49.5,47.5 53,49 49.5,50.5 48,54 46.5,50.5 43,49 46.5,47.5" fill="#FDE047" />
          {/* Yellow 4-point star in right eye */}
          <polygon points="72,44 73.5,47.5 77,49 73.5,50.5 72,54 70.5,50.5 67,49 70.5,47.5" fill="#FDE047" />
          <path d="M43 40 Q48 37 53 40" stroke="#3F2305" strokeWidth="2" strokeLinecap="round" />
          <path d="M67 40 Q72 37 77 40" stroke="#3F2305" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {config.eyes === 'focused' && (
        <g>
          <rect x="44" y="47" width="9" height="7" rx="3" fill="#FFFFFF" />
          <circle cx="48.5" cy="50.5" r="3" fill="#0369A1" />
          <circle cx="47.5" cy="49.5" r="1.2" fill="#FFFFFF" />
          <rect x="67" y="47" width="9" height="7" rx="3" fill="#FFFFFF" />
          <circle cx="71.5" cy="50.5" r="3" fill="#0369A1" />
          <circle cx="70.5" cy="49.5" r="1.2" fill="#FFFFFF" />
          <path d="M43 43 L53 41" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M67 41 L77 43" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* 8. Nose */}
      <path d="M60 52 Q61 55 59 56" stroke={skin.dark} strokeWidth="1.8" strokeLinecap="round" />

      {/* 9. Mouth / Expression */}
      {config.expression === 'smile' && (
        <g>
          <path d="M52 60 Q60 68 68 60" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1" />
          <path d="M54 61 Q60 64 66 61" fill="#FFFFFF" />
        </g>
      )}

      {config.expression === 'grin' && (
        <g>
          <path d="M50 59 Q60 70 70 59 Z" fill="#991B1B" stroke="#7F1D1D" strokeWidth="1.2" />
          <rect x="52" y="59" width="16" height="4" rx="1" fill="#FFFFFF" />
        </g>
      )}

      {config.expression === 'cool' && (
        <path d="M53 62 Q61 62 67 59" stroke="#991B1B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      )}

      {config.expression === 'laugh' && (
        <g>
          <ellipse cx="60" cy="62" rx="9" ry="6" fill="#881337" />
          <ellipse cx="60" cy="60" rx="7" ry="3" fill="#FFFFFF" />
          <path d="M55 64 Q60 67 65 64" fill="#F43F5E" />
        </g>
      )}

      {/* 10. Front Hair Styles */}
      {config.hair === 'short-tousled' && (
        <g>
          <path
            d="M37 42 C33 26, 48 16, 60 16 C72 16, 87 26, 83 42 C85 36, 88 45, 84 50 C80 38, 77 34, 68 34 C64 34, 58 37, 54 35 C48 32, 42 38, 38 48 C36 46, 35 43, 37 42 Z"
            fill={`url(#hair_${uid})`}
          />
          <path d="M50 18 Q56 24 62 19" stroke={hairColor} strokeWidth="2" strokeLinecap="round" />
          <path d="M62 19 Q68 26 72 21" stroke={hairColor} strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {config.hair === 'ponytail' && (
        <g>
          <path
            d="M37 42 C33 26, 48 18, 60 18 C72 18, 87 26, 83 42 C79 32, 73 30, 60 30 C47 30, 41 32, 37 42 Z"
            fill={`url(#hair_${uid})`}
          />
          <path d="M43 32 Q52 38 60 32" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {config.hair === 'curly' && (
        <g fill={`url(#hair_${uid})`}>
          <circle cx="42" cy="30" r="10" />
          <circle cx="54" cy="22" r="11" />
          <circle cx="66" cy="22" r="11" />
          <circle cx="78" cy="30" r="10" />
          <circle cx="36" cy="40" r="8" />
          <circle cx="84" cy="40" r="8" />
          <circle cx="48" cy="32" r="8" />
          <circle cx="72" cy="32" r="8" />
          <circle cx="60" cy="28" r="9" />
        </g>
      )}

      {config.hair === 'bob-cut' && (
        <g>
          <path
            d="M36 48 C34 32, 42 18, 60 18 C78 18, 86 32, 84 48 C86 58, 82 64, 78 64 C76 56, 76 38, 60 38 C44 38, 44 56, 42 64 C38 64, 34 58, 36 48 Z"
            fill={`url(#hair_${uid})`}
          />
          {/* Bangs */}
          <path d="M42 36 Q60 40 78 36" stroke={hairColor} strokeWidth="4" strokeLinecap="round" />
        </g>
      )}

      {config.hair === 'short-spiky' && (
        <g>
          <polygon points="36,36 38,20 46,28 52,14 60,26 68,14 74,28 82,20 84,36 60,32" fill={`url(#hair_${uid})`} />
          <path d="M38 42 C36 30, 48 30, 60 30 C72 30, 84 30, 82 42 Z" fill={`url(#hair_${uid})`} />
        </g>
      )}

      {config.hair === 'long-wavy' && (
        <g>
          <path
            d="M36 44 C34 26, 46 18, 60 18 C74 18, 86 26, 84 44 C78 34, 72 32, 60 32 C48 32, 42 34, 36 44 Z"
            fill={`url(#hair_${uid})`}
          />
          <path d="M40 34 Q50 40 60 34" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M60 34 Q70 40 80 34" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {config.hair === 'afro-puff' && (
        <g>
          <circle cx="44" cy="34" r="14" fill={`url(#hair_${uid})`} />
          <circle cx="60" cy="24" r="16" fill={`url(#hair_${uid})`} />
          <circle cx="76" cy="34" r="14" fill={`url(#hair_${uid})`} />
          <path d="M42 38 Q60 34 78 38" stroke={hairColor} strokeWidth="6" strokeLinecap="round" />
        </g>
      )}

      {config.hair === 'buzz-cut' && (
        <path
          d="M38 38 C37 28, 48 24, 60 24 C72 24, 83 28, 82 38 C78 33, 70 32, 60 32 C50 32, 42 33, 38 38 Z"
          fill={`url(#hair_${uid})`}
          opacity="0.9"
        />
      )}

      {/* 11. Glasses Layer */}
      {config.glasses === 'round' && (
        <g>
          {/* Left Lens */}
          <circle cx="48" cy="49" r="8.5" stroke="#1E293B" strokeWidth="2" fill="#E0F2FE" fillOpacity="0.25" />
          {/* Right Lens */}
          <circle cx="72" cy="49" r="8.5" stroke="#1E293B" strokeWidth="2" fill="#E0F2FE" fillOpacity="0.25" />
          {/* Bridge & Temples */}
          <line x1="56.5" y1="49" x2="63.5" y2="49" stroke="#1E293B" strokeWidth="2" />
          <line x1="39.5" y1="49" x2="35" y2="50" stroke="#1E293B" strokeWidth="2" />
          <line x1="80.5" y1="49" x2="85" y2="50" stroke="#1E293B" strokeWidth="2" />
          {/* Glass Glare */}
          <line x1="45" y1="44" x2="51" y2="50" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <line x1="69" y1="44" x2="75" y2="50" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </g>
      )}

      {config.glasses === 'square' && (
        <g>
          <rect x="40" y="42" width="16" height="13" rx="2.5" stroke="#0F172A" strokeWidth="2.5" fill="#E0F2FE" fillOpacity="0.2" />
          <rect x="64" y="42" width="16" height="13" rx="2.5" stroke="#0F172A" strokeWidth="2.5" fill="#E0F2FE" fillOpacity="0.2" />
          <line x1="56" y1="47" x2="64" y2="47" stroke="#0F172A" strokeWidth="2.5" />
          <line x1="40" y1="46" x2="35" y2="48" stroke="#0F172A" strokeWidth="2" />
          <line x1="80" y1="46" x2="85" y2="48" stroke="#0F172A" strokeWidth="2" />
        </g>
      )}

      {config.glasses === 'vr-visor' && (
        <g>
          <rect x="36" y="42" width="48" height="15" rx="5" fill="#0F172A" stroke="#06B6D4" strokeWidth="2" />
          {/* Visor Screen Line */}
          <line x1="40" y1="49.5" x2="80" y2="49.5" stroke="#22D3EE" strokeWidth="3" strokeLinecap="round" />
          <line x1="42" y1="46" x2="48" y2="46" stroke="#A5F3FC" strokeWidth="1.5" />
          {/* Side strap */}
          <line x1="36" y1="49.5" x2="33" y2="50" stroke="#06B6D4" strokeWidth="3" />
          <line x1="84" y1="49.5" x2="87" y2="50" stroke="#06B6D4" strokeWidth="3" />
        </g>
      )}

      {config.glasses === 'sunglasses' && (
        <g>
          <polygon points="38,43 57,43 55,56 42,56" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
          <polygon points="63,43 82,43 78,56 65,56" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
          <line x1="57" y1="45" x2="63" y2="45" stroke="#0F172A" strokeWidth="2.5" />
          {/* Dark sheen */}
          <line x1="42" y1="46" x2="48" y2="53" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <line x1="67" y1="46" x2="73" y2="53" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        </g>
      )}

      {/* 12. Hats & Accessories */}
      {config.hat === 'headset' && (
        <g>
          {/* Top arch band */}
          <path d="M33 50 C30 20, 90 20, 87 50" stroke="#1E293B" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M36 40 C34 26, 86 26, 84 40" stroke="#38BDF8" strokeWidth="1.5" fill="none" />
          {/* Left Earcup */}
          <rect x="30" y="44" width="8" height="18" rx="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
          <circle cx="34" cy="53" r="2.5" fill="#38BDF8" />
          {/* Right Earcup */}
          <rect x="82" y="44" width="8" height="18" rx="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
          <circle cx="86" cy="53" r="2.5" fill="#38BDF8" />
          {/* Microphone rod */}
          <path d="M34 58 Q34 68 46 68" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="46" cy="68" r="2.5" fill="#22D3EE" />
        </g>
      )}

      {config.hat === 'cap-back' && (
        <g>
          <path d="M35 34 C35 18, 85 18, 85 34 Z" fill={clothingColor} stroke="#0F172A" strokeWidth="1.5" />
          {/* Cap strap / snapback opening */}
          <path d="M48 32 Q60 27 72 32" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="60" cy="18" r="3" fill="#FBBF24" />
        </g>
      )}

      {config.hat === 'grad-cap' && (
        <g>
          {/* Diamond Top Cap */}
          <polygon points="60,12 94,22 60,32 26,22" fill="#0F172A" stroke="#FBBF24" strokeWidth="1.5" />
          {/* Skull base */}
          <path d="M38 27 L38 36 C38 42, 82 42, 82 36 L82 27 Z" fill="#1E293B" />
          {/* Golden Tassel */}
          <circle cx="60" cy="22" r="2.5" fill="#FBBF24" />
          <path d="M60 22 Q76 26 80 38" stroke="#F59E0B" strokeWidth="2" fill="none" />
          <rect x="78" y="37" width="5" height="7" rx="1.5" fill="#D97706" />
        </g>
      )}

      {config.hat === 'cyber-band' && (
        <g>
          <path d="M36 36 Q60 30 84 36" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="60" cy="33" r="4.5" fill="#22D3EE" stroke="#FFFFFF" strokeWidth="1.5" />
        </g>
      )}

      {config.hat === 'crown' && (
        <g>
          <polygon points="38,32 42,16 52,26 60,12 68,26 78,16 82,32" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
          <circle cx="42" cy="16" r="2" fill="#EF4444" />
          <circle cx="60" cy="12" r="2.5" fill="#3B82F6" />
          <circle cx="78" cy="16" r="2" fill="#10B981" />
          <rect x="38" y="30" width="44" height="4" rx="1" fill="#D97706" />
        </g>
      )}
    </svg>
  );
};
