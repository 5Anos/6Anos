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
      border: 'border-blue-200',
      badgeBg: 'bg-blue-600 text-white',
      cardBg: 'bg-blue-50/40',
      iconBox: 'bg-blue-100 text-blue-700',
      tipBox: 'bg-blue-50/80 border-blue-200 text-blue-950',
      tipIcon: 'text-blue-600',
      heading: 'text-blue-900',
    },
    amber: {
      border: 'border-amber-200',
      badgeBg: 'bg-amber-600 text-white',
      cardBg: 'bg-amber-50/40',
      iconBox: 'bg-amber-100 text-amber-700',
      tipBox: 'bg-amber-50/80 border-amber-200 text-amber-950',
      tipIcon: 'text-amber-600',
      heading: 'text-amber-900',
    },
    purple: {
      border: 'border-purple-200',
      badgeBg: 'bg-purple-600 text-white',
      cardBg: 'bg-purple-50/40',
      iconBox: 'bg-purple-100 text-purple-700',
      tipBox: 'bg-purple-50/80 border-purple-200 text-purple-950',
      tipIcon: 'text-purple-600',
      heading: 'text-purple-900',
    },
    emerald: {
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-600 text-white',
      cardBg: 'bg-emerald-50/40',
      iconBox: 'bg-emerald-100 text-emerald-700',
      tipBox: 'bg-emerald-50/80 border-emerald-200 text-emerald-950',
      tipIcon: 'text-emerald-600',
      heading: 'text-emerald-900',
    },
    indigo: {
      border: 'border-indigo-200',
      badgeBg: 'bg-indigo-600 text-white',
      cardBg: 'bg-indigo-50/40',
      iconBox: 'bg-indigo-100 text-indigo-700',
      tipBox: 'bg-indigo-50/80 border-indigo-200 text-indigo-950',
      tipIcon: 'text-indigo-600',
      heading: 'text-indigo-900',
    },
  }[data.colorTheme];

  return (
    <div
      className={`rounded-2xl border ${themeStyles.border} ${themeStyles.cardBg} p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4 ${className}`}
    >
      {/* Visual Image Banner with Badge */}
      <div className="space-y-3">
        <div className="relative rounded-xl overflow-hidden shadow-xs border border-slate-200/80 aspect-video group">
          <img
            src={data.imageUrl}
            alt={data.imageAlt}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent pointer-events-none" />

          {/* Floating Category Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${themeStyles.badgeBg}`}
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
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          {data.caption}
        </p>

        {/* Visual Concept Highlights */}
        <div className="space-y-2 pt-1 border-t border-slate-200/60">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
            Pontos Visuais para Fixar:
          </span>
          <div className="grid grid-cols-1 gap-2">
            {data.visualHighlights.map((vh, idx) => {
              const IconComp = ICON_MAP[vh.iconName] || Info;
              return (
                <div
                  key={idx}
                  className="bg-white/80 border border-slate-200/80 rounded-xl p-2.5 flex items-start gap-2.5 shadow-2xs"
                >
                  <div
                    className={`w-7 h-7 rounded-lg ${themeStyles.iconBox} flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs leading-snug">
                    <span className="font-extrabold text-slate-900 block">
                      {vh.label}
                    </span>
                    <span className="text-slate-600 text-[11px]">
                      {vh.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pro-Tip Box */}
      <div
        className={`p-3 rounded-xl border ${themeStyles.tipBox} flex items-start gap-2.5 text-xs font-semibold`}
      >
        <Lightbulb className={`w-4 h-4 shrink-0 mt-0.5 ${themeStyles.tipIcon}`} />
        <p className="leading-relaxed text-[11px] sm:text-xs">{data.proTip}</p>
      </div>
    </div>
  );
};
