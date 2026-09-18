import React, { useState, useEffect } from 'react';
import {
  Crown,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Shield,
  Search,
  Palette,
  Terminal,
  Brain,
  Award,
  Lock,
} from 'lucide-react';
import { apiRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { clientCompleteGrandeMissao, clientGetWorlds, clientGetGrandeMissao } from '../services/clientFirestore';
import { GrandeMissaoMap } from './grandeMissao/GrandeMissaoMap';
import { Zone1ServerCentral } from './grandeMissao/Zone1ServerCentral';
import { Zone2NewsArchive } from './grandeMissao/Zone2NewsArchive';
import { Zone3CreativeStudio } from './grandeMissao/Zone3CreativeStudio';
import { Zone4AutomationWorkshop } from './grandeMissao/Zone4AutomationWorkshop';
import { Zone5AILab } from './grandeMissao/Zone5AILab';
import { Zone6CoreSchool } from './grandeMissao/Zone6CoreSchool';
import { GrandeMissaoCelebration } from './grandeMissao/GrandeMissaoCelebration';

interface GrandeMissaoViewProps {
  onBack: () => void;
}

export const GrandeMissaoView: React.FC<GrandeMissaoViewProps> = ({ onBack }) => {
  const { user, refreshUser } = useAuth();
  const [activeZoneId, setActiveZoneId] = useState<number | null>(null);
  const [completedZones, setCompletedZones] = useState<number[]>([]);
  const [unlockedCodes, setUnlockedCodes] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [xpWon, setXpWon] = useState(150);
  const [isLocked, setIsLocked] = useState(false);
  const [checkingProgress, setCheckingProgress] = useState(true);
  const [isSavingFinal, setIsSavingFinal] = useState(false);

  // Load progress from DB / LocalStorage
  useEffect(() => {
    if (!user) {
      setCheckingProgress(false);
      return;
    }

    const checkLockAndProgress = async () => {
      try {
        if (user.role !== 'teacher') {
          const res = await clientGetWorlds(user.id, user.role);
          const worlds = res.worlds || [];
          const allCompletedWith75 =
            worlds.length >= 5 && worlds.every((w) => (w.average || 0) > 75);
          if (!allCompletedWith75) {
            setIsLocked(true);
          }
        } else {
          setIsLocked(false);
        }

        // Check if Grande Missão is already completed in backend
        try {
          const gmData = await clientGetGrandeMissao(user.id);
          if (gmData.completed || gmData.progress?.status === 'completed') {
            setIsCompleted(true);
            setCompletedZones([1, 2, 3, 4, 5, 6]);
            setUnlockedCodes({
              1: '#SEC-SAFE-2040',
              2: '#FACT-CHECK-OK',
              3: '#CREATIVE-CC-VAL',
              4: '#ALGO-ROBOT-RUN',
              5: '#AI-ETHICS-PASS',
              6: '#NUCLEO-UNLOCKED-2040',
            });
          }
        } catch {}

        // Load local progress for ongoing session
        try {
          const localKey = `missao_tic_gm_${user.id}`;
          const saved = localStorage.getItem(localKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.completedZones && Array.isArray(parsed.completedZones)) {
              setCompletedZones((prev) => Array.from(new Set([...prev, ...parsed.completedZones])));
            }
            if (parsed.unlockedCodes) {
              setUnlockedCodes((prev) => ({ ...prev, ...parsed.unlockedCodes }));
            }
            if (parsed.isCompleted) {
              setIsCompleted(true);
            }
          }
        } catch {}
      } catch (err) {
        console.error('Error checking grande missao progress', err);
      } finally {
        setCheckingProgress(false);
      }
    };

    checkLockAndProgress();
  }, [user?.id, user?.role]);

  // Save intermediate local progress
  const saveLocalProgress = (newCompleted: number[], newCodes: Record<number, string>, finished = false) => {
    if (!user) return;
    try {
      const localKey = `missao_tic_gm_${user.id}`;
      localStorage.setItem(
        localKey,
        JSON.stringify({
          completedZones: newCompleted,
          unlockedCodes: newCodes,
          isCompleted: finished,
        })
      );
    } catch {}
  };

  const handleZoneCompleted = (zoneId: number, code: string) => {
    const nextCompleted = Array.from(new Set([...completedZones, zoneId]));
    const nextCodes = { ...unlockedCodes, [zoneId]: code };
    setCompletedZones(nextCompleted);
    setUnlockedCodes(nextCodes);
    saveLocalProgress(nextCompleted, nextCodes, false);
  };

  const handleFinishAll = async (finalDecision: string) => {
    if (!user) return;
    setIsSavingFinal(true);
    try {
      let xpResult = 150;
      try {
        const res = await apiRequest('/api/pedagogical/grande-missao/complete', {
          method: 'POST',
          body: JSON.stringify({
            codes: unlockedCodes,
            decision: finalDecision,
          }),
        });
        xpResult = res.xpGain || 150;
      } catch {
        // Fallback to client firestore
        await clientCompleteGrandeMissao(user.id);
      }

      setXpWon(xpResult);
      const nextCompleted = [1, 2, 3, 4, 5, 6];
      setCompletedZones(nextCompleted);
      setIsCompleted(true);
      saveLocalProgress(nextCompleted, unlockedCodes, true);
      setActiveZoneId(null);
      await refreshUser();
    } catch (err) {
      console.error('Failed to complete grande missao', err);
    } finally {
      setIsSavingFinal(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 text-center shadow-sm animate-fadeIn">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Crown className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Grande Missão Bloqueada — Registo Obrigatório
        </h2>
        <p className="text-sm text-slate-600 font-medium max-w-md mx-auto mb-6 leading-relaxed">
          A Grande Missão Final é reservada a alunos registados que concluam as etapas dos 5 Mundos curriculares.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-6 py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <span>Voltar ao Início</span>
        </button>
      </div>
    );
  }

  if (checkingProgress) {
    return (
      <div className="py-20 text-center text-slate-500 font-semibold animate-pulse">
        A carregar os sistemas da Escola do Futuro...
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-amber-200/90 p-8 sm:p-10 text-center shadow-sm animate-fadeIn">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Crown className="w-8 h-8" />
        </div>
        <span className="text-xs font-black text-indigo-700 uppercase tracking-wider block mb-1">
          Desafio Supremo Bloqueado
        </span>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Grande Missão Final Bloqueada
        </h2>
        <p className="text-sm text-slate-600 font-medium max-w-md mx-auto mb-6 leading-relaxed">
          A Grande Missão Final (A ESCOLA DO FUTURO) só fica disponível quando alcançares uma pontuação média superior a <strong>75%</strong> em todos os 5 Mundos curriculares. Continua a praticar!
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm px-6 py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <span>Voltar ao Dashboard</span>
        </button>
      </div>
    );
  }

  // Celebration screen if completed and no active zone
  if (isCompleted && activeZoneId === null) {
    return (
      <GrandeMissaoCelebration
        xpWon={xpWon}
        onBackToDashboard={onBack}
        studentName={user.name || user.nickname}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={activeZoneId !== null ? () => setActiveZoneId(null) : onBack}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <span>{activeZoneId !== null ? '← Voltar ao Mapa de Setores' : '← Voltar ao Painel'}</span>
        </button>

        {activeZoneId !== null && (
          <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
            Escape Room Digital • Setor {activeZoneId}
          </span>
        )}
      </div>

      {/* Render Active View */}
      {activeZoneId === null && (
        <GrandeMissaoMap
          completedZones={completedZones}
          unlockedCodes={unlockedCodes}
          onSelectZone={(zoneId) => setActiveZoneId(zoneId)}
          onBackToApp={onBack}
          isFullyCompleted={isCompleted}
        />
      )}

      {activeZoneId === 1 && (
        <Zone1ServerCentral
          onComplete={(code) => handleZoneCompleted(1, code)}
          onBackToMap={() => setActiveZoneId(null)}
          alreadyCompleted={completedZones.includes(1)}
        />
      )}

      {activeZoneId === 2 && (
        <Zone2NewsArchive
          onComplete={(code) => handleZoneCompleted(2, code)}
          onBackToMap={() => setActiveZoneId(null)}
          alreadyCompleted={completedZones.includes(2)}
        />
      )}

      {activeZoneId === 3 && (
        <Zone3CreativeStudio
          onComplete={(code) => handleZoneCompleted(3, code)}
          onBackToMap={() => setActiveZoneId(null)}
          alreadyCompleted={completedZones.includes(3)}
        />
      )}

      {activeZoneId === 4 && (
        <Zone4AutomationWorkshop
          onComplete={(code) => handleZoneCompleted(4, code)}
          onBackToMap={() => setActiveZoneId(null)}
          alreadyCompleted={completedZones.includes(4)}
        />
      )}

      {activeZoneId === 5 && (
        <Zone5AILab
          onComplete={(code) => handleZoneCompleted(5, code)}
          onBackToMap={() => setActiveZoneId(null)}
          alreadyCompleted={completedZones.includes(5)}
        />
      )}

      {activeZoneId === 6 && (
        <Zone6CoreSchool
          unlockedCodes={unlockedCodes}
          onFinishAll={handleFinishAll}
          onBackToMap={() => setActiveZoneId(null)}
          isSaving={isSavingFinal}
        />
      )}
    </div>
  );
};
