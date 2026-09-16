import React, { useState } from 'react';
import {
  Bell,
  Search,
  LogOut,
  UserCheck,
  Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNextLevelInfo } from '../../server/catalog';
import { t } from '../i18n';
import {
  AlexAvatar,
  LeonorAvatar,
  TiagoAvatar,
  DoodleLightbulbWithText,
  DoodleUnderline,
} from './Illustrations';

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { user, logout, quickSwitch, locale, setLocale } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) return null;

  const nextLevel = getNextLevelInfo(user.xp);

  // Render appropriate avatar illustration
  const renderAvatar = () => {
    if (user.avatar === 'avatar-girl-1') {
      return <LeonorAvatar size={84} className="border-4 border-white shadow-md" />;
    }
    if (user.avatar === 'avatar-boy-2') {
      return <TiagoAvatar size={84} className="border-4 border-white shadow-md" />;
    }
    // Default Alex avatar matching reference mockup
    return <AlexAvatar size={84} className="border-4 border-white shadow-md rounded-full" />;
  };

  return (
    <header
      id="main-header"
      className="bg-white border-b border-slate-200/90 px-6 sm:px-10 py-5 sticky top-0 z-30 shadow-xs"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Avatar, Greeting & Level Bar Matching Reference Mockup */}
        <div className="flex items-center gap-5">
          {/* 3D Circular Avatar */}
          <div className="relative shrink-0">
            {renderAvatar()}
            {/* Online Indicator Dot */}
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-xs" />
          </div>

          {/* Welcome Text & XP capsule */}
          <div className="space-y-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                Olá, <span className="text-blue-600">{user.name.split(' ')[0]}!</span>
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                {t('ready_prompt', locale)}
              </p>
            </div>

            {/* Level Capsule matching exact mockup: Nível 3 - Explorador Digital [====] 320 / 500 XP */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl px-3.5 py-1.5 flex items-center gap-3 w-72 sm:w-96 shadow-xs">
              <span className="text-xs font-black text-slate-800 shrink-0">
                Nível {nextLevel.current.level}
                <span className="font-normal text-slate-500 ml-1">
                  – {nextLevel.current.name}
                </span>
              </span>

              {/* Progress bar */}
              <div className="flex-1 bg-slate-200/90 rounded-full h-2.5 overflow-hidden relative">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(6, nextLevel.percentage)}%` }}
                />
              </div>

              <span className="text-[11px] font-bold text-slate-600 shrink-0">
                {user.xp} / {nextLevel.nextMin} XP
              </span>
            </div>
          </div>
        </div>

        {/* Center: Inspirational Quote with Doodle Underline & Hand-drawn Lightbulb */}
        <div className="hidden xl:flex items-center gap-6">
          <div className="text-center">
            <p className="text-sm italic font-semibold text-slate-700">
              “A tecnologia é uma ferramenta. Tu decides como a usar.”
            </p>
            <div className="flex justify-center mt-1">
              <DoodleUnderline className="w-28 h-2.5" />
            </div>
          </div>

          <DoodleLightbulbWithText />
        </div>

        {/* Right Side: Search, Notifications & Terminar Sessão Buttons */}
        <div className="flex items-center gap-3 self-end lg:self-center">
          {/* Search Button */}
          <button
            onClick={() => setShowSearchModal(!showSearchModal)}
            className="w-10 h-10 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-xs transition-colors"
            title="Pesquisar"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Button with Red Badge 3 */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-xs transition-colors relative"
              title="Notificações"
            >
              <Bell className="w-4 h-4 text-blue-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 text-xs space-y-2">
                <div className="font-extrabold text-slate-900 border-b pb-2">
                  Notificações Pedagógicas (3)
                </div>
                <div className="p-2 bg-amber-50 rounded-xl border border-amber-100 text-amber-900">
                  ⚡ Novo desafio semanal de Phishing disponível! (+50 XP)
                </div>
                <div className="p-2 bg-blue-50 rounded-xl border border-blue-100 text-blue-900">
                  🏆 Conquistaste a insígnia Guardião Digital!
                </div>
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
                  💡 A tua dica diária de segurança está pronta a reclamar.
                </div>
              </div>
            )}
          </div>

          {/* Terminar Sessão Button */}
          <button
            onClick={() => logout()}
            className="h-10 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-700 shadow-xs transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Terminar sessão</span>
          </button>

          {/* Quick Role Switcher Menu (Alex / Professora) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="h-10 px-3 rounded-2xl border border-blue-200 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 text-xs font-black text-blue-700 shadow-xs transition-colors"
              title="Mudar Perfil ou Idioma"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{user.role === 'teacher' ? 'Professora' : 'Aluno'}</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 text-xs space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">
                  Mudar Perfil Ativo
                </div>
                <button
                  onClick={() => {
                    quickSwitch('student');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between ${
                    user.role === 'student' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'
                  }`}
                >
                  <span>Alex (Aluno 6.º A)</span>
                  {user.role === 'student' && <span>✓</span>}
                </button>
                <button
                  onClick={() => {
                    quickSwitch('teacher');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between ${
                    user.role === 'teacher' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'
                  }`}
                >
                  <span>Prof. Carla Silva</span>
                  {user.role === 'teacher' && <span>✓</span>}
                </button>
                <div className="border-t my-1" />
                <div className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">
                  Idioma
                </div>
                <div className="flex gap-1 px-2">
                  <button
                    onClick={() => setLocale('pt')}
                    className={`flex-1 py-1 rounded-lg text-[11px] font-bold ${
                      locale === 'pt' ? 'bg-blue-600 text-white' : 'bg-slate-100'
                    }`}
                  >
                    🇵🇹 PT
                  </button>
                  <button
                    onClick={() => setLocale('en')}
                    className={`flex-1 py-1 rounded-lg text-[11px] font-bold ${
                      locale === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-100'
                    }`}
                  >
                    🇬🇧 EN
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
