import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  School,
  ArrowRight,
  Sparkles,
  GraduationCap,
  LogIn,
  UserPlus,
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

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [classId, setClassId] = useState('class-6a');
  const [avatarConfig, setAvatarConfig] = useState<CustomAvatarConfig>(DEFAULT_AVATAR_CONFIG);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isRegister && !nickname) {
      setNickname(generateSafeNickname());
    }
  }, [isRegister]);

  if (!isOpen) return null;

  const handleShuffleNickname = () => {
    setNickname(generateSafeNickname());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cleanEmail = email.trim();
      if (isRegister) {
        await register({
          name: name.trim(),
          email: cleanEmail,
          password,
          nickname: nickname.trim(),
          classId,
          avatar: serializeAvatarConfig(avatarConfig),
        });
      } else {
        await login(cleanEmail, password);
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        id="login-dialog"
        className={`bg-white rounded-3xl border border-slate-200 shadow-2xl w-full overflow-hidden relative my-auto transition-all ${
          isRegister ? 'max-w-4xl' : 'max-w-md'
        }`}
      >
        {/* Header with Title and Close Button */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              {isRegister ? <UserPlus className="w-5 h-5 text-amber-300" /> : <LogIn className="w-5 h-5 text-blue-200" />}
              {isRegister ? 'Criar Conta de Aluno & Avatar' : 'Iniciar Sessão'}
            </h2>
            <p className="text-xs text-blue-100 font-medium mt-0.5">
              MISSÃO TIC 6.º ANO • Plataforma Educativa
            </p>
          </div>
          <button
            id="btn-close-login-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1.5">
          <button
            type="button"
            id="tab-auth-login"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              !isRegister
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sessão</span>
          </button>
          <button
            type="button"
            id="tab-auth-register"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isRegister
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Criar Conta de Aluno</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl font-medium space-y-2">
              <p>{error}</p>
              {error.includes('Já existe uma conta') && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError(null);
                  }}
                  className="inline-block text-blue-700 underline font-bold cursor-pointer"
                >
                  Clica aqui para Iniciar Sessão com esta conta →
                </button>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister ? (
              <div className="space-y-5">
                {/* Account Details Form Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      Nome Completo:
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Maria Santos"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Nickname:
                      </label>
                      <button
                        type="button"
                        onClick={handleShuffleNickname}
                        title="Gerar outro nickname"
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
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
                      placeholder="Ex: CiberExplorer_99"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-indigo-600" />
                      Turma do 6.º Ano:
                    </label>
                    <select
                      id="select-register-class"
                      required
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                    >
                      <option value="class-6a">6.º A</option>
                      <option value="class-6b">6.º B</option>
                      <option value="class-6c">6.º C</option>
                      <option value="class-6d">6.º D</option>
                      <option value="class-6e">6.º E</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      Email Escolar:
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aluno@escola.edu.pt"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2 lg:col-span-4">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      Palavra-passe:
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Cria uma palavra-passe..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Avatar Builder */}
                <AvatarBuilder
                  value={avatarConfig}
                  onChange={(newCfg) => setAvatarConfig(newCfg)}
                  compact
                />
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    Email (Aluno ou Professora):
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aluno@escola.edu.pt ou professor@escola.edu.pt"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    Palavra-passe:
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              id="btn-submit-auth"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm py-4 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
            >
              <span>{loading ? 'A processar...' : isRegister ? 'Concluir Registo com Este Avatar' : 'Entrar na Plataforma'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              id="btn-toggle-auth-mode"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              {isRegister
                ? 'Já tens conta ou és Professora? Entra aqui'
                : 'És um novo aluno do 6.º ano? Cria a tua conta e personaliza o teu avatar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

