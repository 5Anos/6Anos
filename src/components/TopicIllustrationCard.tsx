import React from 'react';
import {
  Key,
  ShieldAlert,
  Lock,
  AlertTriangle,
  ExternalLink,
  Gift,
  EyeOff,
  UserCheck,
  Camera,
  History,
  Sparkles,
  MessageCircle,
  Clock,
  Moon,
  Activity,
  Search,
  FileText,
  Filter,
  Building,
  HelpCircle,
  Calendar,
  RefreshCw,
  Layers,
  AlertCircle,
  Compass,
  CheckCircle2,
  Flame,
  Share2,
  Smile,
  VolumeX,
  CheckSquare,
  Heart,
  Shield,
  Users,
  GitBranch,
  Edit3,
  Bookmark,
  Image as ImageIcon,
  Award,
  Quote,
  BookOpen,
  List,
  Check,
  DollarSign,
  Shuffle,
  Scissors,
  CheckCircle,
  ArrowRight,
  Target,
  Code,
  GitMerge,
  X,
  Repeat,
  Infinity as InfinityIcon,
  Zap,
  BarChart2,
  PieChart,
  TrendingUp,
  Cpu,
  Database,
  Wand2,
  AlertOctagon,
  Link2,
  Settings,
  Brain,
  Info,
  Lightbulb,
} from 'lucide-react';
import { TOPIC_VISUALS_DATA } from '../data/topicIllustrationsData';

interface TopicIllustrationCardProps {
  topicId: string;
  className?: string;
}

// Icon mapping helper
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Key,
  ShieldAlert,
  Lock,
  AlertTriangle,
  ExternalLink,
  Gift,
  EyeOff,
  UserCheck,
  Camera,
  History,
  Sparkles,
  MessageCircle,
  Clock,
  Moon,
  Activity,
  Search,
  FileText,
  Filter,
  Building,
  HelpCircle,
  Calendar,
  RefreshCw,
  Layers,
  AlertCircle,
  Compass,
  CheckCircle2,
  Flame,
  Share2,
  Smile,
  VolumeX,
  CheckSquare,
  Heart,
  Shield,
  Users,
  GitBranch,
  Edit3,
  Bookmark,
  Image: ImageIcon,
  Award,
  Quote,
  BookOpen,
  List,
  Check,
  DollarSign,
  Shuffle,
  Scissors,
  CheckCircle,
  ArrowRight,
  Target,
  Code,
  GitMerge,
  X,
  Repeat,
  Infinity: InfinityIcon,
  Zap,
  BarChart2,
  PieChart,
  TrendingUp,
  Cpu,
  Database,
  Wand2,
  AlertOctagon,
  Link2,
  Settings,
  Brain,
  Info,
};

export const TopicIllustrationCard: React.FC<TopicIllustrationCardProps> = ({
  topicId,
  className = '',
}) => {
  const data = TOPIC_VISUALS_DATA[topicId];

  if (!data) {
    return null;
  }

  // Theme styling configurations
  const themeStyles = {
    blue: {
      border: 'border-blue-300',
      badgeBg: 'bg-blue-600 text-white',
      cardBg: 'bg-white',
      iconBox: 'bg-blue-50 text-blue-600 border border-blue-200/60',
      tipBox: 'bg-blue-50/40 border-blue-300 text-slate-800',
      tipIcon: 'text-blue-600',
      heading: 'text-blue-900',
    },
    amber: {
      border: 'border-amber-300',
      badgeBg: 'bg-amber-500 text-white',
      cardBg: 'bg-white',
      iconBox: 'bg-amber-50 text-amber-600 border border-amber-200/60',
      tipBox: 'bg-amber-50/40 border-amber-300 text-slate-800',
      tipIcon: 'text-amber-500',
      heading: 'text-amber-900',
    },
    purple: {
      border: 'border-purple-300',
      badgeBg: 'bg-purple-600 text-white',
      cardBg: 'bg-white',
      iconBox: 'bg-purple-50 text-purple-600 border border-purple-200/60',
      tipBox: 'bg-purple-50/40 border-purple-300 text-slate-800',
      tipIcon: 'text-purple-600',
      heading: 'text-purple-900',
    },
    emerald: {
      border: 'border-emerald-300',
      badgeBg: 'bg-emerald-600 text-white',
      cardBg: 'bg-white',
      iconBox: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
      tipBox: 'bg-emerald-50/40 border-emerald-300 text-slate-800',
      tipIcon: 'text-emerald-600',
      heading: 'text-emerald-900',
    },
    indigo: {
      border: 'border-indigo-300',
      badgeBg: 'bg-indigo-600 text-white',
      cardBg: 'bg-white',
      iconBox: 'bg-indigo-50 text-indigo-600 border border-indigo-200/60',
      tipBox: 'bg-indigo-50/40 border-indigo-300 text-slate-800',
      tipIcon: 'text-indigo-600',
      heading: 'text-indigo-900',
    },
  }[data.colorTheme];

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start w-full ${className}`}>
      {/* 🖼️ Coluna Esquerda: Cartão da Imagem com moldura temática e legenda */}
      <div
        className={`rounded-2xl border ${themeStyles.border} ${themeStyles.cardBg} p-4 sm:p-5 shadow-xs flex flex-col space-y-3.5`}
      >
        <div className="relative rounded-xl overflow-hidden shadow-xs border border-slate-200/80 aspect-video group">
          <img
            src={data.imageUrl}
            alt={data.imageAlt}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/20 to-transparent pointer-events-none" />

          {/* Floating Category Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${themeStyles.badgeBg}`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{data.badge}</span>
            </span>
          </div>

          {/* Image Overlay Title */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <p className="text-xs sm:text-sm font-black drop-shadow-sm leading-snug">
              {data.title}
            </p>
          </div>
        </div>

        {/* Conceptual Caption */}
        <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
          {data.caption}
        </p>
      </div>

      {/* 📌 Coluna Direita: Pontos Visuais Para Fixar + Caixa de Dica Prática */}
      <div className="space-y-3.5 flex flex-col justify-between">
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
            PONTOS VISUAIS PARA FIXAR:
          </span>
          <div className="grid grid-cols-1 gap-2.5">
            {data.visualHighlights.map((vh, idx) => {
              const IconComp = ICON_MAP[vh.iconName] || Info;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/90 rounded-xl p-3 sm:p-3.5 flex items-start gap-3 shadow-2xs"
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${themeStyles.iconBox} flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="text-xs leading-snug">
                    <span className="font-bold text-slate-900 block text-xs sm:text-[13px]">
                      {vh.label}
                    </span>
                    <span className="text-slate-600 text-[11px] sm:text-xs leading-relaxed block mt-0.5">
                      {vh.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pro-Tip Box */}
        <div
          className={`p-3.5 rounded-xl border ${themeStyles.tipBox} flex items-start gap-2.5 text-xs font-normal mt-1`}
        >
          <Lightbulb className={`w-4 h-4 shrink-0 mt-0.5 ${themeStyles.tipIcon}`} />
          <p className="leading-relaxed text-[11px] sm:text-xs text-slate-800">{data.proTip}</p>
        </div>
      </div>
    </div>
  );
};
