import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  LogOut,
  LogIn,
  GraduationCap,
  User,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNextLevelInfo } from '../data/catalog';
import { t } from '../i18n';
import {
  DoodleLightbulbWithText,
  DoodleUnderline,
} from './Illustrations';
import { AvatarRenderer } from './avatar/AvatarRenderer';

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  onOpenLoginModal?: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLoginModal,
  onOpenMobileMenu,
}) => {
  const { user, logout, locale, setLocale } = useAuth();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const actionsRef = useRef<HTMLDivElement | null>(null);

  // Close open dropdowns when clicking outside
  useEffect(() => {
    if (!showLanguageMenu && !showNotifications) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowLanguageMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showLanguageMenu, showNotifications]);

  const userXp = user ? user.xp : 0;
  const nextLevel = getNextLevelInfo(userXp);
  const firstName = user ? user.name.split(' ')[0] : 'Aluno';

  return (
    <header
      id="main-header"
      className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 lg:px-10 py-2 md:py-4 lg:py-5 sticky top-0 z-30 shadow-xs pt-safe"
    >
      {/* MOBILE COMPACT SINGLE-ROW BAR (< md): ~56px height to respect 15% mobile sticky cap */}
      <div className="flex md:hidden items-center justify-between gap-2 min-h-[44px]">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Abrir menu de navegação"
            className="w-11 h-11 -ml-1 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="shrink-0">
            <AvatarRenderer
              avatar={user?.avatar || 'avatar-boy-1'}
              size={36}
              className="border-2 border-white shadow-xs rounded-full"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-sm font-black text-slate-900 tracking-tight leading-tight truncate">
              Olá, <span className="text-blue-600">{firstName}!</span>
            </h1>
            {user?.role === 'teacher' ? (
              <p className="text-[11px] font-bold text-indigo-700 truncate leading-tight">
                Conta Docente
              </p>
            ) : (
              <p className="text-[11px] font-bold text-slate-500 truncate leading-tight tabular-nums">
                Nv.{nextLevel.current.level} · {userXp}/{nextLevel.nextMin} XP
              </p>
            )}
          </div>
        </div>

        <div ref={actionsRef} className="flex items-center gap-1.5 shrink-0">
          {/* Mobile Notifications */}
          <div className="relative">
            <button
              type="button"
              id="btn-header-notifications-mobile"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowLanguageMenu(false);
              }}
              aria-label="Notificações"
              className="w-11 h-11 rounded-2xl border border-slate-200 bg-white active:bg-slate-100 flex items-center justify-center text-slate-700 shadow-2xs transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4 text-blue-600" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>

            {showNotifications && (
              <div className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 text-xs space-y-2">
                <div className="font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                  Novidades (3)
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-amber-900">
                  Novo Desafio da Semana pronto para ti! (+30 XP)
                </div>
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 text-blue-900">
                  Completa o Mundo 1 para ganhares a medalha Guardião Digital!
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
                  A tua Dica Rápida de hoje já está pronta (+20 XP)!
                </div>
              </div>
            )}
          </div>

          {!user ? (
            <button
              type="button"
              id="btn-header-login-mobile"
              onClick={onOpenLoginModal}
              className="h-11 px-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center gap-1.5 text-xs font-black shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span>Entrar</span>
            </button>
          ) : (
            <div className="relative">
              <button
                type="button"
                id="btn-header-profile-role-mobile"
                onClick={() => {
                  setShowLanguageMenu(!showLanguageMenu);
                  setShowNotifications(false);
                }}
                aria-label="Conta e idioma"
                className="h-11 px-3 rounded-2xl border border-slate-200 bg-slate-50 active:bg-slate-100 flex items-center gap-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                {user.role === 'teacher' ? (
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                ) : (
                  <User className="w-4 h-4 text-blue-600" />
                )}
                <span className="text-[11px] font-black uppercase text-slate-600">
                  {locale.toUpperCase()}
                </span>
              </button>

              {showLanguageMenu && (
                <div className="fixed right-3 top-16 w-60 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 text-xs space-y-2.5">
                  <div className="text-[10px] font-bold uppercase text-slate-400 px-1">
                    {user.role === 'teacher' ? 'Conta de Professora' : 'Conta de Aluno'}
                  </div>
                  <div className="px-2.5 py-2 bg-slate-50 rounded-xl text-slate-800 font-bold truncate">
                    {user.email}
                  </div>
                  <div className="border-t border-slate-100 pt-2">
                    <div className="text-[10px] font-bold uppercase text-slate-400 px-1 mb-1.5">
                      Idioma
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setLocale('pt');
                          setShowLanguageMenu(false);
                        }}
                        className={`flex-1 min-h-[40px] rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          locale === 'pt'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        PT
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLocale('en');
                          setShowLanguageMenu(false);
                        }}
                        className={`flex-1 min-h-[40px] rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          locale === 'en'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        EN
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowLanguageMenu(false);
                        logout();
                      }}
                      className="w-full min-h-[42px] px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Terminar sessão</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TABLET (md) & DESKTOP (lg+) HEADER */}
      <div className="hidden md:flex items-center justify-between gap-4 lg:gap-6">
        {/* Left Side: Tablet Drawer Trigger + Avatar, Greeting & Level Bar */}
        <div className="flex items-center gap-3.5 lg:gap-5 min-w-0">
          {/* Tablet Menu Button (hidden on lg+ where persistent sidebar is visible) */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Abrir menu de navegação"
            className="lg:hidden w-11 h-11 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Circular Avatar */}
          <div className="relative shrink-0 hidden lg:block">
            <AvatarRenderer
              avatar={user?.avatar || 'avatar-boy-1'}
              size={84}
              className="border-4 border-white shadow-md rounded-full"
            />
          </div>
          <div className="relative shrink-0 lg:hidden">
            <AvatarRenderer
              avatar={user?.avatar || 'avatar-boy-1'}
              size={52}
              className="border-2 border-white shadow-sm rounded-full"
            />
          </div>

          {/* Welcome Text & XP bar */}
          <div className="space-y-1.5 lg:space-y-2 min-w-0">
            <div>
              <h1 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none truncate">
                Olá, <span className="text-blue-600">{firstName}!</span>
              </h1>
              <p className="text-xs lg:text-sm font-medium text-slate-500 mt-1 truncate">
                {t('ready_prompt', locale)}
              </p>
            </div>

            {user?.role === 'teacher' ? (
              <div
                id="header-teacher-pill"
                className="bg-indigo-50 border border-indigo-200/90 rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow-xs w-fit max-w-full"
              >
                <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-bold text-indigo-900 truncate">
                  Conta Docente{' '}
                  <span className="hidden xl:inline font-normal text-indigo-600">
                    · Modo de Teste (Sem acumulação de pontos)
                  </span>
                </span>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl px-3.5 py-1.5 flex items-center gap-3 w-64 lg:w-80 xl:w-96 max-w-full shadow-xs">
                <span className="text-xs font-black text-slate-800 shrink-0">
                  Nível {nextLevel.current.level}
                  <span className="hidden lg:inline font-normal text-slate-500 ml-1">
                    – {nextLevel.current.name}
                  </span>
                </span>

                <div className="flex-1 bg-slate-200/90 rounded-full h-2.5 overflow-hidden relative min-w-[48px]">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${nextLevel.percentage}%` }}
                  />
                </div>

                <span className="text-[11px] font-bold text-slate-600 shrink-0 tabular-nums">
                  {userXp} / {nextLevel.nextMin} XP
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Center: Inspirational Quote (Desktop XL only) */}
        <div className="hidden xl:flex items-center gap-6 shrink-0">
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

        {/* Right Side: Notifications, Login/Logout, Role/Language */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Notifications Button */}
          <div className="relative">
            <button
              type="button"
              id="btn-header-notifications"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowLanguageMenu(false);
              }}
              className="w-11 h-11 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-xs transition-colors relative cursor-pointer"
              title="Notificações"
              aria-label="Notificações"
            >
              <Bell className="w-4 h-4 text-blue-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 text-xs space-y-2">
                <div className="font-extrabold text-slate-900 border-b pb-2">
                  Novidades (3)
                </div>
                <div className="p-2 bg-amber-50 rounded-xl border border-amber-100 text-amber-900">
                  Novo Desafio da Semana pronto para ti! (+30 XP)
                </div>
                <div className="p-2 bg-blue-50 rounded-xl border border-blue-100 text-blue-900">
                  Completa o Mundo 1 para ganhares a medalha Guardião Digital!
                </div>
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
                  A tua Dica Rápida de hoje já está pronta (+20 XP)!
                </div>
              </div>
            )}
          </div>

          {!user ? (
            <button
              type="button"
              id="btn-header-login"
              onClick={onOpenLoginModal}
              className="h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-xs font-black shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar sessão</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                id="btn-header-logout"
                onClick={() => logout()}
                className="h-11 px-3.5 lg:px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-700 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <LogOut className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="hidden lg:inline">Terminar sessão</span>
                <span className="lg:hidden">Sair</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  id="btn-header-profile-role"
                  onClick={() => {
                    setShowLanguageMenu(!showLanguageMenu);
                    setShowNotifications(false);
                  }}
                  className="h-11 px-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-bold text-slate-700 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                  title="Idioma & Conta"
                >
                  {user.role === 'teacher' ? (
                    <>
                      <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="font-extrabold text-indigo-700 hidden lg:inline">
                        Professora
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-extrabold text-blue-700 hidden lg:inline">
                        Aluno
                      </span>
                    </>
                  )}
                  <span className="text-[11px] text-slate-500 uppercase font-mono">
                    {locale.toUpperCase()}
                  </span>
                </button>

                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl p-2.5 z-50 text-xs space-y-2">
                    <div className="text-[10px] font-bold uppercase text-slate-400 px-1">
                      {user.role === 'teacher' ? 'Conta de Professora' : 'Conta de Aluno'}
                    </div>
                    <div className="px-2 py-1.5 bg-slate-50 rounded-xl text-slate-800 font-bold truncate">
                      {user.email}
                    </div>
                    <div className="border-t border-slate-100 pt-1.5">
                      <div className="text-[10px] font-bold uppercase text-slate-400 px-1 mb-1">
                        Idioma
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setLocale('pt');
                            setShowLanguageMenu(false);
                          }}
                          className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                            locale === 'pt'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          PT
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLocale('en');
                            setShowLanguageMenu(false);
                          }}
                          className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                            locale === 'en'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          EN
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
