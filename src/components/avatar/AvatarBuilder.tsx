import React, { useState } from 'react';
import {
  Sparkles,
  Dices,
  RotateCcw,
  Check,
  Palette,
  Eye,
  Smile,
  Glasses,
  Crown,
  Shirt,
  Image as ImageIcon,
} from 'lucide-react';
import { CustomAvatarConfig } from '../../types/avatar';
import {
  AVATAR_CATEGORIES,
  DEFAULT_AVATAR_CONFIG,
  generateRandomAvatar,
  parseAvatarConfig,
} from '../../utils/avatarUtils';
import { AvatarRenderer } from './AvatarRenderer';

interface AvatarBuilderProps {
  value?: string | CustomAvatarConfig | null;
  onChange: (config: CustomAvatarConfig) => void;
  compact?: boolean;
}

export const AvatarBuilder: React.FC<AvatarBuilderProps> = ({
  value,
  onChange,
  compact = false,
}) => {
  const currentConfig = parseAvatarConfig(value);
  const [activeCategory, setActiveCategory] = useState<keyof CustomAvatarConfig>('skin');

  const handleOptionSelect = (catId: keyof CustomAvatarConfig, optId: string) => {
    const updated: CustomAvatarConfig = {
      ...currentConfig,
      [catId]: optId,
    };
    onChange(updated);
  };

  const handleRandomize = () => {
    const random = generateRandomAvatar();
    onChange(random);
  };

  const handleReset = () => {
    onChange({ ...DEFAULT_AVATAR_CONFIG });
  };

  const currentCategoryDef = AVATAR_CATEGORIES.find((c) => c.id === activeCategory) || AVATAR_CATEGORIES[0];

  const categoryIcons: Record<string, any> = {
    skin: '👤',
    hair: '💇',
    hairColor: '🎨',
    eyes: '🙂',
    expression: '✨',
    glasses: '👓',
    hat: '🎩',
    clothing: '👕',
    clothingColor: '🎨',
    background: '🌄',
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-5 select-none">
      {/* Top Banner / Title */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              Criador de Avatar • Constrói a Tua Identidade
            </h4>
            <p className="text-[11px] text-slate-400">
              Personaliza pele, cabelo, expressão, óculos, roupa e acessórios em tempo real.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRandomize}
            title="Gerar avatar aleatório"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-[11px] rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Avatar</span> Aleatório
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="Repor opções predefinidas"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Repor</span>
          </button>
        </div>
      </div>

      {/* Main Builder Grid: Preview + Customizer */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left / Center: Big Live Character Preview */}
        <div className="md:col-span-4 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center space-y-3 shadow-inner">
          <div className="relative group">
            {/* Ambient Radial Glow */}
            <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />

            {/* Character Renderer */}
            <div className="relative z-10 drop-shadow-2xl transition-transform duration-200 group-hover:scale-105">
              <AvatarRenderer
                avatar={currentConfig}
                size={compact ? 120 : 140}
                className="border-4 border-slate-700/80 shadow-2xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase text-blue-400 tracking-wider block">
              Pré-visualização em Tempo Real
            </span>
            <p className="text-[11px] text-slate-400">
              O avatar atualiza imediatamente ao clicar em cada opção.
            </p>
          </div>
        </div>

        {/* Right: Category Tabs & Options Picker */}
        <div className="md:col-span-8 space-y-4">
          {/* Category Tabs Scrollable / Grid */}
          <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
            {AVATAR_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <span className="text-sm">{categoryIcons[cat.id] || '✨'}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Category Option Grid */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span>{categoryIcons[currentCategoryDef.id] || '✨'}</span>
                <span>Escolhe: {currentCategoryDef.label}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-semibold">
                {currentCategoryDef.options.length} opções disponíveis
              </span>
            </div>

            {/* Options List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {currentCategoryDef.options.map((opt) => {
                const isSelected = currentConfig[currentCategoryDef.id] === opt.id;

                // Color swatch mode
                if (opt.color) {
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleOptionSelect(currentCategoryDef.id, opt.id)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white ring-2 ring-blue-500/30'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full border border-white/30 shrink-0 shadow-inner flex items-center justify-center"
                        style={{ backgroundColor: opt.color }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                      </div>
                      <span className="text-xs font-bold truncate">{opt.label}</span>
                    </button>
                  );
                }

                // Standard option card with mini visual preview
                const previewClone: CustomAvatarConfig = {
                  ...currentConfig,
                  [currentCategoryDef.id]: opt.id,
                };

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleOptionSelect(currentCategoryDef.id, opt.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white ring-2 ring-blue-500/30'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-800 flex items-center justify-center">
                      <AvatarRenderer avatar={previewClone} size={30} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold block truncate">{opt.label}</span>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
