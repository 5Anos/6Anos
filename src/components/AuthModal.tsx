import React, { useState } from 'react';
import {
  Compass,
  Key,
  Mail,
  User,
  School,
  Lock,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { login, register, quickSwitch } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [classroomCode, setClassroomCode] = useState('TIC6A-2025');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        await register({
          name,
          email,
          password,
          nickname,
          classroomCode,
        });
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Brand header matching screenshot */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center mx-auto text-blue-600 shadow-xs">
            <Compass className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            MISSÃO <span className="text-blue-600">TIC</span> 6.º ANO
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Plataforma Pedagógica Gamificada de Tecnologias de Informação e Comunicação
          </p>
        </div>

        {/* Quick Demo Buttons */}
        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-2">
          <span className="text-[10px] font-black uppercase text-blue-800 tracking-wide block text-center">
            Acesso Rápido de Demonstração:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickSwitch('student')}
              className="bg-white hover:bg-blue-100/60 border border-blue-200 rounded-xl py-2 px-3 text-xs font-extrabold text-blue-700 shadow-xs transition-colors text-center"
            >
              Entrar como Aluno
            </button>
            <button
              type="button"
              onClick={() => quickSwitch('teacher')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2 px-3 text-xs font-extrabold shadow-xs transition-colors text-center"
            >
              Entrar como Professora
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-[10px] uppercase font-bold text-slate-400">ou com credenciais</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Beatriz Silva"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nickname Público (RGPD):
                </label>
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Ex: Beatriz_Gamer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Código da Turma:
                </label>
                <input
                  type="text"
                  required
                  value={classroomCode}
                  onChange={(e) => setClassroomCode(e.target.value)}
                  placeholder="TIC6A-2025"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Escolar:
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aluno@escola.edu.pt"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Palavra-passe:
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>{isRegister ? 'Criar Conta de Aluno' : 'Entrar na Plataforma'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            {isRegister
              ? 'Já tens conta? Entra aqui'
              : 'Novo aluno do 6.º ano? Regista-te com o código da turma'}
          </button>
        </div>
      </div>
    </div>
  );
};
