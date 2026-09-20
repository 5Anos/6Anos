import React, { useState, useEffect } from 'react';
import {
  Compass,
  Shield,
  Search,
  Video,
  Code,
  Cpu,
  ArrowRight,
  Sparkles,
  Trophy,
  Award,
  Layers,
  CheckCircle2,
  Lock,
  Mail,
  User,
  School,
  ArrowLeft,
  GraduationCap,
  Shuffle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CustomAvatarConfig } from '../types/avatar';
import {
  DEFAULT_AVATAR_CONFIG,
  generateSafeNickname,
  serializeAvatarConfig,
} from '../utils/avatarUtils';
import { AvatarBuilder } from './avatar/AvatarBuilder';

interface AuthModalProps {
  onContinueToApp?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onContinueToApp }) => {
  const { user, login, register, logout } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [classId, setClassId] = useState('class-6a');
  const [avatarConfig, setAvatarConfig] = useState<CustomAvatarConfig>(DEFAULT_AVATAR_CONFIG);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate safe default nickname when switching to register
  useEffect(() => {
    if (isRegister && !nickname) {
      setNickname(generateSafeNickname());
    }
  }, [isRegister]);

  const handleShuffleNickname = () => {
    setNickname(generateSafeNickname());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          nickname: nickname.trim(),
          classId,
          avatar: serializeAvatarConfig(avatarConfig),
        });
      } else {
        await login(email.trim(), password);
      }
      if (onContinueToApp) onContinueToApp();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar autenticação');
    } finally {
      setLoading(false);
    }
  };

  const worlds = [
    {
      id: 1,
      title: 'Segurança & Privacidade',
      desc: 'Pegada digital, passwords fortes, 2FA e identificação de phishing.',
      icon: Shield,
      color: 'from-blue-500 to-indigo-600',
      tag: 'Cidadania Digital',
    },
    {
      id: 2,
      title: 'Investigação & Fontes Online',
      desc: 'Pesquisa avançada, validação de notícias falsas e credibilidade.',
      icon: Search,
      color: 'from-cyan-500 to-blue-600',
      tag: 'Literacia da Informação',
    },
    {
      id: 3,
      title: 'Criação Multimédia',
      desc: 'Produção de áudio, vídeo, infografias e direitos de autor / Creative Commons.',
      icon: Video,
      color: 'from-purple-500 to-pink-600',
      tag: 'Produção Criativa',
    },
    {
      id: 4,
      title: 'Algoritmos & Programação',
      desc: 'Fluxogramas, lógica computacional em blocos, loops e condicionais.',
      icon: Code,
      color: 'from-emerald-500 to-teal-600',
      tag: 'Pensamento Computacional',
    },
    {
      id: 5,
      title: 'Inteligência Artificial & Robótica',
      desc: 'Modelos generativos éticos, visão computacional e automação.',
      icon: Cpu,
      color: 'from-amber-500 to-orange-600',
      tag: 'Tecnologias Emergentes',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center gap-2 border-b border-blue-600/30">
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>MISSÃO TIC 6.º ANO — Plataforma Pedagógica Gamificada para o Ensino Básico</span>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-12">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Brand Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Logo / Badge */}
            <div className="inline-flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider block">
                  Educação Digital 6.º Ano
                </span>
                <span className="text-xs font-bold text-slate-300">
                  Aprendizagens Essenciais de TIC
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                MISSÃO <span className="text-blue-500">TIC</span>
                <span className="text-amber-400 text-2xl sm:text-3xl lg:text-4xl block sm:inline sm:ml-3">
                  6.º ANO
                </span>
              </h1>
              <p className="text-lg sm:text-xl font-medium text-slate-300">
                Aprende. Experimenta. Resolve. Cria.
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
              Explora os 5 Mundos digitais, enfrenta desafios semanais de cibersegurança e programação, conquista insígnias oficiais e realiza a Grande Missão interdisciplinar.
            </p>

            {user && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl max-w-xl flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Sessão ativa: <strong className="text-white">{user.name}</strong> ({user.role === 'teacher' ? 'Professora' : 'Aluno'})
                </span>
                <div className="flex gap-2">
                  {onContinueToApp && (
                    <button
                      onClick={onContinueToApp}
                      className="text-blue-400 hover:text-blue-300 font-bold underline"
                    >
                      Continuar →
                    </button>
                  )}
                  <button
                    onClick={() => logout()}
                    className="text-rose-400 hover:text-rose-300 font-bold ml-2"
                  >
                    Terminar Sessão
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Authentication Card */}
          <div className={isRegister ? 'lg:col-span-12' : 'lg:col-span-5'}>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-400" />
                    {isRegister ? 'Criação de Conta de Aluno' : 'Entrar com Credenciais'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isRegister
                      ? 'Preenche os teus dados escolares e personaliza o teu avatar digital antes de começar!'
                      : 'Acede com o teu email escolar e palavra-passe.'}
                  </p>
                </div>
                {isRegister && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      setError(null);
                    }}
                    className="self-start sm:self-auto text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 bg-slate-800 rounded-xl transition-all"
                  >
                    ← Voltar ao Início de Sessão
                  </button>
                )}
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {isRegister ? (
                  <div className="space-y-6">
                    {/* Personal Information Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-400" />
                          Nome Completo:
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Beatriz Silva"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            Nickname:
                          </label>
                          <button
                            type="button"
                            onClick={handleShuffleNickname}
                            title="Gerar outro nickname seguro"
                            className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Shuffle className="w-2.5 h-2.5" />
                            <span>Baralhar</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          placeholder="Ex: Ciber_Heroi_84"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5 text-blue-400" />
                          Turma do 6.º Ano:
                        </label>
                        <select
                          id="select-authmodal-class"
                          required
                          value={classId}
                          onChange={(e) => setClassId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-blue-500"
                        >
                          <option value="class-6a">6.º A</option>
                          <option value="class-6b">6.º B</option>
                          <option value="class-6c">6.º C</option>
                          <option value="class-6d">6.º D</option>
                          <option value="class-6e">6.º E</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-blue-400" />
                          Email Escolar:
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="aluno@escola.edu.pt"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2 lg:col-span-4">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-blue-400" />
                          Palavra-passe:
                        </label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Cria uma palavra-passe segura..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Integrated Full Avatar Builder */}
                    <AvatarBuilder
                      value={avatarConfig}
                      onChange={(newConfig) => setAvatarConfig(newConfig)}
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-400" />
                        Email ou Nickname (Aluno ou Professora):
                      </label>
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ex: imaginebycarla2023@gmail.com ou Prof_Carla"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-blue-400" />
                        Palavra-passe:
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  <span>{loading ? 'A processar...' : isRegister ? 'Concluir Criação de Conta com Este Avatar' : 'Entrar na Plataforma'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="text-center pt-1 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError(null);
                  }}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                >
                  {isRegister
                    ? 'Já tens conta? Entra aqui'
                    : 'Novo aluno do 6.º ano? Cria a tua conta e constrói o teu avatar'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Mundos Showcase */}
        <div className="space-y-6 pt-6 border-t border-slate-800/80">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Os 5 Mundos Temáticos do 6.º Ano
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Currículo completo estruturado por desafios progressivos e simuladores interativos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {worlds.map((w) => {
              const Icon = w.icon;
              return (
                <div
                  key={w.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${w.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-400">
                        Mundo {w.id} • {w.tag}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                        {w.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {w.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] font-bold text-blue-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Teoria + Simulador + Teste</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pedagogical Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase">Simuladores Interativos</h4>
            <p className="text-xs text-slate-400">
              Prática de cibersegurança, verificação de fontes, fluxogramas e edição multimédia em ambiente seguro.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase">Desafios Semanais</h4>
            <p className="text-xs text-slate-400">
              Missões rápidas com XP bónus para manter os alunos motivados e envolvidos semana a semana.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase">Insígnias & Conquistas</h4>
            <p className="text-xs text-slate-400">
              Sistema de reconhecimento com insígnias temáticas desbloqueadas ao superar metas curriculares.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase">Área da Professora</h4>
            <p className="text-xs text-slate-400">
              Dossiês dos alunos, pautas com exportação CSV, gestão de turmas, correção de missões e auditoria.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-800 text-center space-y-2">
          <p className="text-xs italic text-slate-400">
            “Pequenas aprendizagens fazem grandes futuros.”
          </p>
          <p className="text-[11px] text-slate-500">
            MISSÃO TIC 6.º ANO • Plataforma Educativa Segura em conformidade com o RGPD
          </p>
        </footer>
      </div>
    </div>
  );
};
