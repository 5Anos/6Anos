import React, { useState } from 'react';
import { Shield, Search, Palette, Bot, Sparkles } from 'lucide-react';
import world1Img from '../assets/images/world1_guardiao_digital_1795551244105.jpg';
import world2Img from '../assets/images/world2_detetive_digital_1795551242741.jpg';
import world3Img from '../assets/images/world3_criador_digital_1795551243412.jpg';
import world4Img from '../assets/images/world4_engenheiro_digital_1795551243614.jpg';
import world5Img from '../assets/images/world5_explorador_ia_1795551243497.jpg';

interface IllustratedHeroProps {
  src: string;
  alt: string;
  title: string;
  gradientClass: string;
  borderClass: string;
  icon: React.ReactNode;
  className?: string;
}

const IllustratedWorldHero: React.FC<IllustratedHeroProps> = ({
  src,
  alt,
  title,
  gradientClass,
  borderClass,
  icon,
  className = 'w-full h-auto max-w-[360px]',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className={`relative select-none ${className}`}>
      <div
        className={`relative rounded-3xl overflow-hidden border-2 ${borderClass} shadow-lg bg-white/15 backdrop-blur-xs aspect-video`}
      >
        {!imgFailed ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-white ${gradientClass}`}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              {icon}
            </div>
            <span className="text-sm font-black tracking-tight text-center">{title}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const GuardianKidHero: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto max-w-[360px]',
}) => (
  <IllustratedWorldHero
    src={world1Img}
    alt="Ilustração do Guardião Digital com escudo verde, chave dourada e cadeado seguro"
    title="Guardião Digital"
    gradientClass="bg-gradient-to-br from-emerald-500 to-teal-700"
    borderClass="border-emerald-200/70"
    icon={<Shield className="w-8 h-8 text-white" />}
    className={className}
  />
);

export const DetectiveKidHero: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto max-w-[360px]',
}) => (
  <IllustratedWorldHero
    src={world2Img}
    alt="Ilustração do Detetive Digital com lupa a investigar livros, calendário e globo na biblioteca"
    title="Detetive Digital"
    gradientClass="bg-gradient-to-br from-blue-500 to-sky-700"
    borderClass="border-sky-200/70"
    icon={<Search className="w-8 h-8 text-white" />}
    className={className}
  />
);

export const CreativeKidHero: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto max-w-[360px]',
}) => (
  <IllustratedWorldHero
    src={world3Img}
    alt="Ilustração de dois colegas Criadores Digitais a desenhar num tablet com cores e música"
    title="Criador Digital"
    gradientClass="bg-gradient-to-br from-purple-500 to-fuchsia-700"
    borderClass="border-purple-200/70"
    icon={<Palette className="w-8 h-8 text-white" />}
    className={className}
  />
);

export const EngineerKidHero: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto max-w-[360px]',
}) => (
  <IllustratedWorldHero
    src={world4Img}
    alt="Ilustração do Engenheiro Digital a montar blocos de código para guiar um robô simpático"
    title="Engenheiro Digital"
    gradientClass="bg-gradient-to-br from-amber-500 to-orange-700"
    borderClass="border-amber-200/70"
    icon={<Bot className="w-8 h-8 text-white" />}
    className={className}
  />
);

export const AIPioneerHero: React.FC<{ className?: string }> = ({
  className = 'w-full h-auto max-w-[360px]',
}) => (
  <IllustratedWorldHero
    src={world5Img}
    alt="Ilustração da Exploradora da IA com o seu pequeno robô ajudante rodeados de livros e planetas"
    title="Explorador da IA"
    gradientClass="bg-gradient-to-br from-indigo-500 to-violet-700"
    borderClass="border-indigo-200/70"
    icon={<Sparkles className="w-8 h-8 text-white" />}
    className={className}
  />
);
