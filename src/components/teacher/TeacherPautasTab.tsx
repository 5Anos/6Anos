import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Filter,
  CheckCircle2,
  XCircle,
  Download,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';

interface TeacherPautasTabProps {
  pautaData: any;
  classes: any[];
  selectedClass: string;
  setSelectedClass: (val: string) => void;
  onOpenStudent: (student: any) => void;
  onExportCSV: () => void;
  onExportXLSX: () => void;
}

export const TeacherPautasTab: React.FC<TeacherPautasTabProps> = ({
  pautaData,
  classes,
  selectedClass,
  setSelectedClass,
  onOpenStudent,
  onExportCSV,
  onExportXLSX,
}) => {
  const [viewMode, setViewMode] = useState<'general' | 'world'>('general');
  const [selectedWorldId, setSelectedWorldId] = useState(1);

  if (!pautaData) {
    return (
      <div className="p-12 text-center text-slate-500">
        <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
        <p className="font-semibold text-slate-600">A carregar dados da pauta...</p>
      </div>
    );
  }

  const pautaGeral = Array.isArray(pautaData?.pautaGeral) ? pautaData.pautaGeral : [];
  const pautasPorMundo = Array.isArray(pautaData?.pautasPorMundo) ? pautaData.pautasPorMundo : [];

  const filteredPautaGeral = pautaGeral.filter((item: any) => {
    return selectedClass === 'all' || item.classId === selectedClass;
  });

  const currentWorldPauta = pautasPorMundo.find((w: any) => w.worldId === selectedWorldId);
  const filteredWorldStudents = currentWorldPauta && Array.isArray(currentWorldPauta.students)
    ? currentWorldPauta.students.filter((st: any) => {
        return selectedClass === 'all' || st.classId === selectedClass;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Top Navigation & Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        {/* View mode switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('general')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'general'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pauta Geral (Todos os Mundos)
          </button>
          <button
            onClick={() => setViewMode('world')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'world'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pauta Detalhada por Mundo
          </button>
        </div>

        {/* Filter and Export buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              aria-label="Filtrar por turma na pauta"
              className="bg-transparent text-slate-800 text-sm focus:outline-none cursor-pointer pr-2"
            >
              <option value="all" className="bg-white text-slate-800">Todas as Turmas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-slate-800">
                  Turma {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportCSV}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              CSV
            </button>
            <button
              onClick={onExportXLSX}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel (.xlsx)
            </button>
          </div>
        </div>
      </div>

      {/* World Selector (if in World view mode) */}
      {viewMode === 'world' && (
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((wId) => {
            const wData = pautasPorMundo.find((w: any) => w.worldId === wId);
            const isSelected = selectedWorldId === wId;
            return (
              <button
                key={wId}
                onClick={() => setSelectedWorldId(wId)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>Mundo {wId}: {wData ? wData.worldTitle : `Mundo ${wId}`}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Rule Notification Banner */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-slate-700 shadow-2xs">
        <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
        <div>
          <strong>Critério de Desbloqueio e Conclusão:</strong> Média estritamente superior a{' '}
          <span className="text-emerald-700 font-bold font-mono">80%</span> (ex: 81% ou mais desbloqueia o mundo seguinte; 80% ou inferior mantém bloqueado).
        </div>
      </div>

      {/* VIEW 1: PAUTA GERAL */}
      {viewMode === 'general' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Aluno</th>
                  <th className="py-3.5 px-4">Turma</th>
                  <th className="py-3.5 px-4 text-center">Mundo 1</th>
                  <th className="py-3.5 px-4 text-center">Mundo 2</th>
                  <th className="py-3.5 px-4 text-center">Mundo 3</th>
                  <th className="py-3.5 px-4 text-center">Mundo 4</th>
                  <th className="py-3.5 px-4 text-center">Mundo 5</th>
                  <th className="py-3.5 px-4 text-center">Média Global</th>
                  <th className="py-3.5 px-4 text-center">XP Total</th>
                  <th className="py-3.5 px-4 text-center">Nível</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPautaGeral.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500">
                      Nenhum registo encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredPautaGeral.map((item: any) => {
                    const isPassedGlobal = item.globalAverage > 80;

                    return (
                      <tr
                        key={item.studentId}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <button
                            onClick={() => onOpenStudent({ id: item.studentId, name: item.studentName })}
                            className="font-semibold text-slate-900 hover:text-amber-600 transition-colors text-left flex items-center gap-2"
                          >
                            <span>{item.studentName}</span>
                            <span className="text-xs text-slate-400 font-mono">@{item.studentNickname}</span>
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-xs text-slate-700 font-medium border border-slate-200">
                            {item.className}
                          </span>
                        </td>

                        {item.worldScores.map((score: number, idx: number) => {
                          const isWorldPassed = score > 80;
                          return (
                            <td key={idx} className="py-3 px-4 text-center font-mono">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                  score > 0
                                    ? isWorldPassed
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'text-slate-400'
                                }`}
                              >
                                {score > 0 ? `${score}%` : '—'}
                              </span>
                            </td>
                          );
                        })}

                        <td className="py-3 px-4 text-center font-mono">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${
                              item.globalAverage > 0
                                ? isPassedGlobal
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {item.globalAverage > 0 ? `${item.globalAverage}%` : '—'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold text-amber-700 text-xs">
                          {item.totalXP} XP
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="text-xs font-bold text-slate-700">
                            Nível {item.level}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: PAUTA POR MUNDO */}
      {viewMode === 'world' && currentWorldPauta && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Mundo {selectedWorldId}: {currentWorldPauta.worldTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pauta detalhada com simuladores, desafios, missões e avaliação final.
              </p>
            </div>
            <div className="text-xs text-amber-700 font-bold">
              {filteredWorldStudents.length} alunos
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Aluno</th>
                  <th className="py-3.5 px-4">Turma</th>
                  <th className="py-3.5 px-4 text-center">Simuladores</th>
                  <th className="py-3.5 px-4 text-center">Desafio</th>
                  <th className="py-3.5 px-4 text-center">Missão Real</th>
                  <th className="py-3.5 px-4 text-center">Avaliação Final</th>
                  <th className="py-3.5 px-4 text-center">Média do Mundo</th>
                  <th className="py-3.5 px-4 text-center">Mundo Seguinte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorldStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      Nenhum aluno encontrado para esta turma.
                    </td>
                  </tr>
                ) : (
                  filteredWorldStudents.map((st: any) => {
                    const isWorldPassed = st.worldAverage > 80;

                    return (
                      <tr
                        key={st.studentId}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <button
                            onClick={() => onOpenStudent({ id: st.studentId, name: st.studentName })}
                            className="font-semibold text-slate-900 hover:text-amber-600 transition-colors text-left"
                          >
                            {st.studentName}
                          </button>
                          <div className="text-xs text-slate-400 font-mono">@{st.studentNickname}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-xs text-slate-700 font-medium border border-slate-200">
                            {st.className}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-xs text-slate-700">
                          {st.simulatorsCompleted} concluído(s)
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-xs">
                          {st.challengeCompleted ? (
                            <span className="text-emerald-700 font-bold">{st.challengeScore} XP</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-xs">
                          {st.missionScore > 0 ? (
                            <span className="text-amber-700 font-bold">{st.missionScore}/100</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-xs">
                          {st.assessmentScore > 0 ? (
                            <span
                              className={`font-bold ${
                                st.assessmentScore > 80 ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {st.assessmentScore}%
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center font-mono">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${
                              st.worldAverage > 0
                                ? isWorldPassed
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {st.worldAverage > 0 ? `${st.worldAverage}%` : '—'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          {st.unlockedNext ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Desbloqueado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                              <XCircle className="w-3 h-3" />
                              Bloqueado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
