import React from 'react';
import {
  Home,
  Globe,
  Trophy,
  Award,
  User,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user, locale } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'worlds', label: 'Mundos', icon: Globe },
    { id: 'challenges', label: 'Desafios', icon: Trophy },
    { id: 'badges', label: 'Conquistas', icon: Award },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <aside
      id="main-sidebar"
      className="w-full md:w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between p-6 select-none shrink-0"
    >
      <div>
        {/* Brand Logo Matching Screenshot */}
        <div
          id="sidebar-logo"
          onClick={() => onSelectTab('dashboard')}
          className="cursor-pointer flex flex-col items-center text-center mb-8 group"
        >
          {/* Stylized 3D Compass Star Icon */}
          <div className="w-16 h-16 mb-2 flex items-center justify-center relative">
            <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16">
              {/* Outer compass ring */}
              <circle cx="40" cy="40" r="36" stroke="#DBEAFE" strokeWidth="3" fill="#EFF6FF" />
              {/* Compass tick marks */}
              <line x1="40" y1="8" x2="40" y2="14" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="40" y1="66" x2="40" y2="72" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="8" y1="40" x2="14" y2="40" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="66" y1="40" x2="72" y2="40" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />

              {/* 4-Point Star Facets */}
              {/* Top needle (Cyan / Blue) */}
              <polygon points="40,12 45,40 40,36" fill="#38BDF8" />
              <polygon points="40,12 35,40 40,36" fill="#0284C7" />
              {/* Bottom needle (Navy) */}
              <polygon points="40,68 45,40 40,44" fill="#1E293B" />
              <polygon points="40,68 35,40 40,44" fill="#334155" />
              {/* Right needle */}
              <polygon points="68,40 40,45 44,40" fill="#2563EB" />
              <polygon points="68,40 40,35 44,40" fill="#1D4ED8" />
              {/* Left needle */}
              <polygon points="12,40 40,45 36,40" fill="#64748B" />
              <polygon points="12,40 40,35 36,40" fill="#475569" />

              {/* Center Pivot */}
              <circle cx="40" cy="40" r="4" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
            </svg>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
            MISSÃO <span className="text-blue-600">TIC</span>
          </h1>
          <span className="text-[10px] font-bold text-slate-500 tracking-tight mt-1.5">
            Aprende. Experimenta. Resolve. Cria.
          </span>
        </div>

        {/* Navigation Items */}
        <nav id="sidebar-nav" className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  active
                    ? 'bg-blue-100/70 text-blue-700 shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/70 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    active ? 'text-blue-600' : 'text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Teacher Area Link - Exclusively visible for teacher */}
          {isTeacher && (
            <div className="pt-4 mt-2">
              <button
                id="nav-teacher"
                onClick={() => onSelectTab('teacher')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  currentTab === 'teacher'
                    ? 'bg-indigo-100/70 text-indigo-700 shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/70 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <GraduationCap
                    className={`w-5 h-5 ${
                      currentTab === 'teacher' ? 'text-indigo-600' : 'text-slate-500'
                    }`}
                  />
                  <span>{t('nav_teacher', locale)}</span>
                </div>
                <span className="text-[10px] bg-indigo-200 text-indigo-800 font-extrabold px-2 py-0.5 rounded-lg">
                  Prof
                </span>
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Quote matching reference image: “Pequenas aprendizagens fazem grandes futuros.” */}
      <div id="sidebar-bottom-quote" className="mt-8 pt-6">
        <div className="border-l-2 border-blue-500 pl-3.5 py-0.5">
          <p className="text-xs italic text-slate-500 font-medium leading-relaxed">
            “Pequenas aprendizagens fazem grandes futuros.”
          </p>
        </div>
      </div>
    </aside>
  );
};
