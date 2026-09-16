import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Check,
  Award,
  Sparkles,
  School,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNextLevelInfo } from '../../server/catalog';
import { t } from '../i18n';

export const ProfileView: React.FC = () => {
  const { user, classroom, updateProfile, locale } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'avatar-boy-1');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const nextLevel = getNextLevelInfo(user.xp);

  const availableAvatars = [
    { id: 'avatar-boy-1', label: 'Explorador', emoji: '🧑‍💻' },
    { id: 'avatar-girl-1', label: 'Ciberdefensora', emoji: '👧' },
    { id: 'avatar-boy-2', label: 'Programador', emoji: '👦' },
    { id: 'avatar-robot', label: 'IA Bot', emoji: '🤖' },
    { id: 'avatar-super', label: 'Guardião Digital', emoji: '🦸' },
    { id: 'teacher-1', label: 'Professora', emoji: '👩‍🏫' },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        nickname: nickname.trim(),
        avatar: selectedAvatar,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('nav_profile', locale)} do Aluno
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gere a tua identidade na plataforma e personaliza o teu avatar.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
          <ShieldCheck className="w-4 h-4" />
          <span>Perfil Protegido RGPD</span>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Perfil atualizado com sucesso!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-3">
              Escolhe o teu Avatar:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {availableAvatars.map((av) => {
                const isSelected = selectedAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-xs">
                      {av.emoji}
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 truncate w-full">
                      {av.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nickname */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nickname Público:
              </label>
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: Alex_Digital"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Este é o único nome visível para os teus colegas no ranking.
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
                Definido pela escola e pela professora.
              </span>
            </div>
          </div>

          {/* Classroom info */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <School className="w-5 h-5 text-indigo-600" />
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">
                  {classroom ? classroom.name : 'Turma 6.º A – TIC'}
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xs transition-colors"
            >
              {saving ? 'A guardar...' : 'Guardar Alterações'}
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
