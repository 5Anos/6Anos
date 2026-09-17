import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Check,
  Award,
  Sparkles,
  School,
  Lock,
  Shuffle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNextLevelInfo } from '../../server/catalog';
import { t } from '../i18n';
import { CustomAvatarConfig } from '../types/avatar';
import {
  parseAvatarConfig,
  serializeAvatarConfig,
  generateSafeNickname,
} from '../utils/avatarUtils';
import { AvatarBuilder } from './avatar/AvatarBuilder';
import { AvatarRenderer } from './avatar/AvatarRenderer';

export const ProfileView: React.FC = () => {
  const { user, classroom, updateProfile, locale } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [avatarConfig, setAvatarConfig] = useState<CustomAvatarConfig>(() =>
    parseAvatarConfig(user?.avatar)
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '');
      setAvatarConfig(parseAvatarConfig(user.avatar));
    }
  }, [user?.id, user?.avatar, user?.nickname]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 text-center shadow-sm">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Perfil Bloqueado — Registo Obrigatório
        </h2>
        <p className="text-sm text-slate-600 font-medium max-w-md mx-auto mb-6 leading-relaxed">
          Para personalizares o teu avatar e o teu nome de explorador digital, inicia sessão na tua conta.
        </p>
      </div>
    );
  }

  const nextLevel = getNextLevelInfo(user.xp);

  const handleShuffleNickname = () => {
    setNickname(generateSafeNickname());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        nickname: nickname.trim(),
        avatar: serializeAvatarConfig(avatarConfig),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao guardar perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-blue-500 shadow-md">
              <AvatarRenderer avatar={avatarConfig} size={96} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1 rounded-xl shadow">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {user.nickname || user.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-blue-100 text-blue-800">
                Nível {user.level}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {user.name} • {classroom ? classroom.name : '6.º Ano TIC'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-4 py-2.5 rounded-2xl border border-blue-200 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>Perfil Protegido RGPD</span>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Perfil e Avatar atualizados com sucesso! Todas as alterações foram guardadas.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Builder Studio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-black text-slate-900 uppercase tracking-wide">
                🎨 Estúdio de Avatar • Construtor Completo
              </label>
              <span className="text-xs text-slate-500 font-medium">
                Altera o teu estilo sempre que quiseres
              </span>
            </div>

            <AvatarBuilder
              value={avatarConfig}
              onChange={(newConfig) => setAvatarConfig(newConfig)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            {/* Nickname */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Nickname Público (RGPD):
                </label>
                <button
                  type="button"
                  onClick={handleShuffleNickname}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Baralhar</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: CiberHeroi_6A"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Este é o único nome visível para os teus colegas no ranking de turma e desafios.
              </span>
            </div>

            {/* Email (Read only for safety) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Escolar Registado:
              </label>
              <input
                type="text"
                disabled
                value={user.email}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Conta escolar associada à tua turma.
              </span>
            </div>
          </div>

          {/* Classroom info */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <School className="w-5 h-5 text-indigo-600" />
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">
                  {classroom ? classroom.name : 'Turma 6.º Ano – TIC'}
                </span>
                <span className="text-[10px] text-slate-500">
                  Código de Entrada:{' '}
                  <strong className="font-mono text-slate-700">
                    {classroom ? classroom.code : 'TIC6A-2025'}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-8 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
            >
              {saving ? 'A guardar alterações...' : 'Guardar Novo Avatar & Perfil'}
            </button>
          </div>
        </form>
      </div>

      {/* Level and Progression Summary Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 mb-4">
          Resumo do teu Estado Curricular
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100">
            <span className="text-[10px] uppercase font-bold text-blue-800">Nível Curricular</span>
            <div className="text-xl font-black text-blue-950 mt-1">
              Nível {nextLevel.current.level}
            </div>
            <span className="text-xs text-blue-700 font-semibold">{nextLevel.current.name}</span>
          </div>
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
            <span className="text-[10px] uppercase font-bold text-emerald-800">Pontos de Experiência</span>
            <div className="text-xl font-black text-emerald-950 mt-1">
              {user.xp} XP
            </div>
            <span className="text-xs text-emerald-700 font-semibold">
              Faltam {nextLevel.nextMin - user.xp} XP para o próximo nível
            </span>
          </div>
          <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-100">
            <span className="text-[10px] uppercase font-bold text-purple-800">Mundos Concluídos</span>
            <div className="text-xl font-black text-purple-950 mt-1">
              {user.unlockedWorlds?.length || 1} / 5
            </div>
            <span className="text-xs text-purple-700 font-semibold">Em progressão contínua</span>
          </div>
        </div>
      </div>
    </div>
  );
};

