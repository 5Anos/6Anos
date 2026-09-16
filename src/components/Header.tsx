import React, { useState } from 'react';
import {
  Bell,
  Search,
  LogOut,
  Globe,
  LogIn,
  GraduationCap,
  User,
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
  onOpenLoginModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLoginModal }) => {
  const { user, logout, locale, setLocale } = useAuth();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Compute level or use reference default for guest state
  const nextLevel = user
    ? getNextLevelInfo(user.xp)
    : {
        current: { level: 3, name: 'Guardião Digital', minXp: 300 },
        next: { level: 4, name: 'Criador Digital', minXp: 500 },
        percentage: 64,
        nextMin: 500,
      };

  const userXp = user ? user.xp : 320;
  const firstName = user ? user.name.split(' ')[0] : 'Aluno';

  // Render appropriate avatar illustration
  const renderAvatar = () => {
    if (user?.avatar === 'avatar-girl-1') {
      return <LeonorAvatar size={84} className="border-4 border-white shadow-md" />;
    }
    if (user?.avatar === 'avatar-boy-2') {
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
                Olá, <span className="text-blue-600">{firstName}!</span>
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                {t('ready_prompt', locale)}
              </p>
            </div>

            {/* Level Capsule matching exact mockup: Nível 3 - Guardião Digital [====] 320 / 500 XP */}
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
                {userXp} / {nextLevel.nextMin} XP
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

        {/* Right Side: Search, Notifications, Iniciar Sessão or User Actions */}
        <div className="flex items-center gap-3 self-end lg:self-center">
          {/* Search Button */}
          <button
            id="btn-header-search"
            onClick={() => setShowSearchModal(!showSearchModal)}
            className="w-10 h-10 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-xs transition-colors"
            title="Pesquisar"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Button with Red Badge 3 */}
          <div className="relative">
            <button
              id="btn-header-notifications"
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

          {!user ? (
            /* Botão para Iniciar a Sessão no canto superior direito */
            <button
              id="btn-header-login"
              onClick={onOpenLoginModal}
              className="h-10 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-xs font-black shadow-xs transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar sessão</span>
            </button>
          ) : (
            <>
              {/* Terminar Sessão Button */}
              <button
                id="btn-header-logout"
                onClick={() => logout()}
                className="h-10 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-700 shadow-xs transition-colors"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                <span>Terminar sessão</span>
              </button>

              {/* Profile Badge & Language Selector */}
              <div className="relative">
                <button
                  id="btn-header-profile-role"
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="h-10 px-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-bold text-slate-700 shadow-xs transition-colors"
                  title="Idioma & Conta"
                >
                  {user.role === 'teacher' ? (
                    <>
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      <span className="font-extrabold text-indigo-700">Professora</span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-extrabold text-blue-700">Aluno</span>
                    </>
                  )}
                  <span className="text-[11px] text-slate-400 ml-1 uppercase font-mono">
                    {locale.toUpperCase()}
                  </span>
                </button>

                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl p-2.5 z-50 text-xs space-y-2">
                    <div className="text-[10px] font-bold uppercase text-slate-400 px-1">
                      {user.role === 'teacher' ? 'Conta de Professora' : 'Conta de Aluno'}
                    </div>
                    <div className="px-2 py-1.5 bg-slate-50 rounded-xl text-slate-800 font-bold truncate">
                      {user.email}
                    </div>
                    <div className="border-t border-slate-100 pt-1">
                      <div className="text-[10px] font-bold uppercase text-slate-400 px-1 mb-1">
                        Idioma
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setLocale('pt');
                            setShowLanguageMenu(false);
                          }}
                          className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                            locale === 'pt' ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          🇵🇹 PT
                        </button>
                        <button
                          onClick={() => {
                            setLocale('en');
                            setShowLanguageMenu(false);
                          }}
                          className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                            locale === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          🇬🇧 EN
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
