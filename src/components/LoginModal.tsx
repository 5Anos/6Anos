import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  LogIn,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cleanEmail = email.trim();
      await login(cleanEmail, password);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Credenciais incorretas. Verifica o teu nome de utilizador/palavra-passe ou pede apoio à tua Professora.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        id="login-dialog"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden relative my-auto transition-all"
      >
        {/* Header with Title and Close Button */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <LogIn className="w-5 h-5 text-blue-200" />
              <span>Iniciar Sessão</span>
            </h2>
            <p className="text-xs text-blue-100 font-medium mt-0.5">
              MISSÃO TIC 6.º ANO • Plataforma Educativa
            </p>
          </div>
          <button
            id="btn-close-login-modal"
            onClick={onClose}
            aria-label="Fechar janela"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl font-medium space-y-1">
              <p className="font-bold">Não foi possível entrar:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Nome de Utilizador ou Email:</span>
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: anderson.santos ou aluno@escola.edu.pt"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-500">
                Introduz o teu <strong>Username</strong> do cartão de acesso escolar ou o teu email institucional.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>Palavra-passe / PIN:</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ex: sol350"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                  aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-auth"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
            >
              <span>{loading ? 'A verificar credenciais...' : 'Entrar na Plataforma'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Teacher Managed Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-black text-amber-900">
              <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Contas Geridas pela Professora</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              As contas dos alunos são criadas e fornecidas pela Professora de TIC. Se ainda não tens o teu cartão de acesso ou se te esqueceste da palavra-passe, solicita o teu código na sala de aula.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
