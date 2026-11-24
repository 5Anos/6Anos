import React, { useEffect } from 'react';
import {
  Home,
  Globe,
  BookOpen,
  Trophy,
  Award,
  User,
  GraduationCap,
  X,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  mobileOpen?: boolean;
  onOpenMobile?: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen = false,
  onOpenMobile,
  onCloseMobile,
}) => {
  const { user, locale } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'worlds', label: 'Mundos', icon: Globe },
    { id: 'learn', label: 'Aprender', icon: BookOpen },
    { id: 'challenges', label: 'Desafios', icon: Trophy },
    { id: 'badges', label: 'Conquistas', icon: Award },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  // Lock body scroll & handle Escape key when drawer is open on mobile/tablet
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMobile?.();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen, onCloseMobile]);

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    onCloseMobile?.();
  };

  const renderSidebarContent = (isDrawer: boolean) => (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand Logo */}
        <div className="flex items-start justify-between mb-6 lg:mb-8">
          <div
            id={isDrawer ? 'sidebar-logo-mobile' : 'sidebar-logo'}
            onClick={() => handleNavClick('dashboard')}
            className="cursor-pointer flex flex-col items-center text-center flex-1 group"
          >
            {/* Stylized 3D Compass Star Icon */}
            <div className="w-14 h-14 lg:w-16 lg:h-16 mb-2 flex items-center justify-center relative">
              <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
                <circle cx="40" cy="40" r="36" stroke="#DBEAFE" strokeWidth="3" fill="#EFF6FF" />
                <line x1="40" y1="8" x2="40" y2="14" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="40" y1="66" x2="40" y2="72" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="8" y1="40" x2="14" y2="40" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="66" y1="40" x2="72" y2="40" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                <polygon points="40,12 45,40 40,36" fill="#38BDF8" />
                <polygon points="40,12 35,40 40,36" fill="#0284C7" />
                <polygon points="40,68 45,40 40,44" fill="#1E293B" />
                <polygon points="40,68 35,40 40,44" fill="#334155" />
                <polygon points="68,40 40,45 44,40" fill="#2563EB" />
                <polygon points="68,40 40,35 44,40" fill="#1D4ED8" />
                <polygon points="12,40 40,45 36,40" fill="#64748B" />
                <polygon points="12,40 40,35 36,40" fill="#475569" />
                <circle cx="40" cy="40" r="4" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-black tracking-tight text-slate-900 leading-none">
                MISSÃO <span className="text-blue-600">TIC</span>
              </h1>
              <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                6.º ANO
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 tracking-tight mt-1.5">
              6.º Ano • 2.º Ciclo do Ensino Básico
            </span>
          </div>

          {isDrawer && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Fechar menu de navegação"
              className="min-w-[44px] min-h-[44px] -mr-2 -mt-2 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav id={isDrawer ? 'sidebar-nav-mobile' : 'sidebar-nav'} className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={isDrawer ? `nav-mobile-${item.id}` : `nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full min-h-[46px] flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-blue-100/80 text-blue-700 shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/70 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`w-5 h-5 transition-colors shrink-0 ${
                      active ? 'text-blue-600' : 'text-slate-500'
                    }`}
                  />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>
              </button>
            );
          })}

          {/* Teacher Area Link - Exclusively visible for teacher */}
          {isTeacher && (
            <div className="pt-3 mt-2 border-t border-slate-100">
              <button
                type="button"
                id={isDrawer ? 'nav-mobile-teacher' : 'nav-teacher'}
                onClick={() => handleNavClick('teacher')}
                className={`w-full min-h-[46px] flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                  currentTab === 'teacher'
                    ? 'bg-indigo-100/80 text-indigo-700 shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100/70 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <GraduationCap
                    className={`w-5 h-5 shrink-0 ${
                      currentTab === 'teacher' ? 'text-indigo-600' : 'text-slate-500'
                    }`}
                  />
                  <span className="whitespace-nowrap">{t('nav_teacher', locale)}</span>
                </div>
                <span className="text-[10px] bg-indigo-200 text-indigo-800 font-extrabold px-2 py-0.5 rounded-lg">
                  Prof
                </span>
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Quote */}
      <div id={isDrawer ? 'sidebar-bottom-quote-mobile' : 'sidebar-bottom-quote'} className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-xs italic text-slate-500 font-medium leading-relaxed">
          “Pequenas aprendizagens fazem grandes futuros.”
        </p>
      </div>
    </div>
  );

  const mobileBottomTabs = isTeacher
    ? [
        { id: 'dashboard', label: 'Início', icon: Home },
        { id: 'worlds', label: 'Mundos', icon: Globe },
        { id: 'challenges', label: 'Desafios', icon: Trophy },
        { id: 'teacher', label: 'Prof', icon: GraduationCap },
        { id: '__menu__', label: 'Mais', icon: Menu },
      ]
    : [
        { id: 'dashboard', label: 'Início', icon: Home },
        { id: 'worlds', label: 'Mundos', icon: Globe },
        { id: 'challenges', label: 'Desafios', icon: Trophy },
        { id: 'profile', label: 'Perfil', icon: User },
        { id: '__menu__', label: 'Mais', icon: Menu },
      ];

  return (
    <>
      {/* 1. Desktop Persistent Sidebar (lg+) */}
      <aside
        id="main-sidebar"
        className="hidden lg:flex lg:flex-col lg:w-64 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto bg-white border-r border-slate-200/90 p-6 select-none shrink-0"
      >
        {renderSidebarContent(false)}
      </aside>

      {/* 2. Mobile & Tablet Slide-Over Navigation Drawer (< lg) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
        >
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
          />
          {/* Drawer Panel */}
          <aside className="relative z-10 w-72 max-w-[85vw] h-full bg-white shadow-2xl border-r border-slate-200 p-5 overflow-y-auto select-none animate-in slide-in-from-left duration-200">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* 3. Smartphone Fixed Bottom Tab Bar (< md) — Thumb-zone navigation */}
      <nav
        id="mobile-bottom-nav"
        aria-label="Navegação rápida móvel"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] pb-safe"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {mobileBottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isMenuTrigger = tab.id === '__menu__';
            const active = isMenuTrigger
              ? mobileOpen || currentTab === 'learn' || currentTab === 'badges' || (!isTeacher && currentTab === 'grande_missao')
              : currentTab === tab.id;
            const isTeacherTab = tab.id === 'teacher';

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (isMenuTrigger) {
                    onOpenMobile?.();
                  } else {
                    onSelectTab(tab.id);
                  }
                }}
                aria-current={active && !isMenuTrigger ? 'page' : undefined}
                className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors cursor-pointer select-none ${
                  active
                    ? isTeacherTab
                      ? 'text-indigo-600'
                      : 'text-blue-600'
                    : 'text-slate-500 active:text-slate-800'
                }`}
              >
                <div
                  className={`w-9 h-7 rounded-xl flex items-center justify-center transition-colors ${
                    active
                      ? isTeacherTab
                        ? 'bg-indigo-100/90'
                        : 'bg-blue-100/90'
                      : 'bg-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold tracking-tight leading-none">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
