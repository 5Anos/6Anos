import React, { useMemo, useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  BarChart3,
  Users,
  User,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { PROGRESSION_CONFIG } from '../../progressionConfig';

const WORLD_COLORS: Record<number, { hex: string; name: string; short: string }> = {
  1: { hex: '#2563EB', name: 'Mundo 1', short: 'M1' },
  2: { hex: '#7C3AED', name: 'Mundo 2', short: 'M2' },
  3: { hex: '#059669', name: 'Mundo 3', short: 'M3' },
  4: { hex: '#D97706', name: 'Mundo 4', short: 'M4' },
  5: { hex: '#E11D48', name: 'Mundo 5', short: 'M5' },
};

const DEFAULT_WORLD_TITLES: Record<number, string> = {
  1: 'Segurança Digital',
  2: 'Pesquisa e Verdade',
  3: 'Comunicação Digital',
  4: 'Criação Digital',
  5: 'Cidadania Digital',
};

interface StudentWorldMetrics {
  worldId: number;
  worldTitle: string;
  worldAverage: number;
  simulatorsDone: number;
  simulatorsTotal: number;
  completionPct: number;
  simulatorsAvg: number;
  assessmentScore: number;
  officialAssessmentScore: number | null;
  assessmentMention: string;
  isWorldPassed: boolean;
  hasQuizAttempt: boolean;
}

interface NormalizedStudentRow {
  studentId: string;
  studentName: string;
  shortLabel: string;
  studentNumber: number | null;
  studentNickname: string;
  classId: string;
  className: string;
  totalXP: number;
  level: number;
  globalAverage: number;
  worlds: Record<number, StudentWorldMetrics>;
  w1: number;
  w2: number;
  w3: number;
  w4: number;
  w5: number;
}

type MetricType = 'average' | 'completion' | 'quiz';
type SortOption = 'number' | 'average_desc' | 'xp_desc' | 'name';

const truncateName = (name: string, maxLen = 20): string => {
  const clean = (name || 'Aluno').trim();
  if (clean.length <= maxLen) return clean;
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    const firstLast = `${parts[0]} ${parts[parts.length - 1]}`;
    if (firstLast.length <= maxLen) return firstLast;
    const firstInitial = `${parts[0]} ${parts[parts.length - 1][0]}.`;
    if (firstInitial.length <= maxLen) return firstInitial;
  }
  return `${clean.slice(0, maxLen - 1)}…`;
};

const MultiStudentTooltip = ({ active, payload, metric }: any) => {
  if (!active || !payload || !payload.length) return null;
  const row: NormalizedStudentRow | undefined = payload[0]?.payload;
  if (!row) return null;

  const metricLabel =
    metric === 'average'
      ? 'Média do Mundo'
      : metric === 'completion'
      ? 'Conclusão de Simuladores'
      : 'Quiz de Avaliação';

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3.5 text-xs text-slate-700 min-w-[240px] max-w-[300px]">
      <div className="border-b border-slate-100 pb-2 mb-2">
        <div className="font-bold text-slate-900 text-sm leading-tight">
          {row.studentNumber ? `N.º ${row.studentNumber} · ` : ''}
          {row.studentName}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
          {row.className} · {row.totalXP} XP · Média Global {row.globalAverage}%
        </div>
      </div>

      <div className="text-[11px] font-semibold text-slate-500 mb-1.5">{metricLabel}</div>

      <div className="space-y-1.5">
        {[1, 2, 3, 4, 5].map((wId) => {
          const w = row.worlds[wId];
          const val =
            metric === 'average'
              ? w.worldAverage
              : metric === 'completion'
              ? w.completionPct
              : w.assessmentScore;
          const passed = w.isWorldPassed;
          return (
            <div key={wId} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: WORLD_COLORS[wId].hex }}
                />
                <span className="truncate text-slate-700 font-medium">
                  M{wId}: {w.worldTitle}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 font-mono tabular-nums">
                <span
                  className={`font-bold ${
                    val > PROGRESSION_CONFIG.PASSING_THRESHOLD
                      ? 'text-emerald-700'
                      : val > 0
                      ? 'text-slate-900'
                      : 'text-slate-400'
                  }`}
                >
                  {val}%
                </span>
                <span className="text-[10px] text-slate-400">
                  ({w.simulatorsDone}/{w.simulatorsTotal})
                </span>
                {passed && (
                  <span className="text-[10px] font-sans font-semibold text-emerald-700">
                    OK
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
        Clica na barra para inspecionar o detalhe individual.
      </div>
    </div>
  );
};

const SingleStudentTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3.5 text-xs text-slate-700 min-w-[230px]">
      <div className="border-b border-slate-100 pb-2 mb-2">
        <div className="font-bold text-slate-900 text-sm">
          Mundo {item.worldId}: {item.worldTitle}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          {item.isPassed
            ? `Aprovado (>${PROGRESSION_CONFIG.PASSING_THRESHOLD}%)`
            : item.isUnlocked === false
            ? 'Mundo bloqueado'
            : 'Em progresso'}
        </div>
      </div>

      <div className="space-y-1.5 font-mono tabular-nums">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 font-sans text-slate-600">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
            Média do Mundo
          </span>
          <span
            className={`font-bold ${
              item.average > PROGRESSION_CONFIG.PASSING_THRESHOLD
                ? 'text-emerald-700'
                : item.average > 0
                ? 'text-slate-900'
                : 'text-slate-400'
            }`}
          >
            {item.average}%
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 font-sans text-slate-600">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
            Atividades Concluídas
          </span>
          <span className="font-bold text-slate-900">
            {item.completionPct}% ({item.completedLabel})
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 font-sans text-slate-600">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-600" />
            Melhor Quiz
          </span>
          <span className="font-bold text-slate-900">
            {item.hasQuiz ? `${item.quizScore}%` : 'Sem tentativa'}
          </span>
        </div>

        {item.officialQuizScore !== null && item.officialQuizScore !== undefined && (
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100 text-[11px]">
            <span className="font-sans text-slate-500">1.ª Tentativa Oficial</span>
            <span className="font-semibold text-slate-700">
              {item.officialQuizScore}% {item.mention && item.mention !== '—' ? `(${item.mention})` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

interface TeacherStudentsWorldBarChartProps {
  pautaData: any;
  students: any[];
  classes: any[];
  selectedClass: string;
  onSelectClass: (classId: string) => void;
  onOpenStudent: (student: { id: string; name?: string }) => void;
}

export const TeacherStudentsWorldBarChart: React.FC<TeacherStudentsWorldBarChartProps> = ({
  pautaData,
  students,
  classes,
  selectedClass,
  onSelectClass,
  onOpenStudent,
}) => {
  const [viewMode, setViewMode] = useState<'all_students' | 'single_student'>('all_students');
  const [metric, setMetric] = useState<MetricType>('average');
  const [worldFilter, setWorldFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');
  const [sortBy, setSortBy] = useState<SortOption>('number');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const studentMetaById = useMemo(() => {
    const map = new Map<string, any>();
    for (const s of students || []) {
      map.set(s.id, s);
    }
    return map;
  }, [students]);

  const worldTitles = useMemo(() => {
    const titles: Record<number, string> = { ...DEFAULT_WORLD_TITLES };
    const pautasPorMundo = Array.isArray(pautaData?.pautasPorMundo) ? pautaData.pautasPorMundo : [];
    for (const w of pautasPorMundo) {
      if (w?.worldId && w?.worldTitle) {
        titles[w.worldId] = w.worldTitle;
      }
    }
    return titles;
  }, [pautaData]);

  const normalizedRows = useMemo<NormalizedStudentRow[]>(() => {
    const pautaGeral = Array.isArray(pautaData?.pautaGeral) ? pautaData.pautaGeral : [];
    const pautasPorMundo = Array.isArray(pautaData?.pautasPorMundo) ? pautaData.pautasPorMundo : [];

    // Index per-world data by studentId
    const worldDataByStudent = new Map<string, Record<number, any>>();
    for (const w of pautasPorMundo) {
      const wId = Number(w.worldId);
      const list = Array.isArray(w.students) ? w.students : [];
      for (const st of list) {
        if (!worldDataByStudent.has(st.studentId)) {
          worldDataByStudent.set(st.studentId, {});
        }
        worldDataByStudent.get(st.studentId)![wId] = st;
      }
    }

    return pautaGeral
      .filter((item: any) => selectedClass === 'all' || item.classId === selectedClass)
      .map((item: any) => {
        const meta = studentMetaById.get(item.studentId);
        const rawNumber = meta?.studentNumber ?? item.studentNumber ?? null;
        const studentNumber =
          rawNumber !== null && rawNumber !== undefined && !Number.isNaN(Number(rawNumber))
            ? Number(rawNumber)
            : null;
        const perWorldRaw = worldDataByStudent.get(item.studentId) || {};
        const worldScoresArr: number[] = Array.isArray(item.worldScores) ? item.worldScores : [0, 0, 0, 0, 0];

        const worlds: Record<number, StudentWorldMetrics> = {};
        for (let wId = 1; wId <= 5; wId++) {
          const wRaw = perWorldRaw[wId] || {};
          const simsDone = Number(wRaw.simulatorsCount ?? wRaw.simulatorsCompleted ?? 0);
          const simsTotal = Number(wRaw.simulatorsTotal ?? 5);
          const completionPct = simsTotal > 0 ? Math.min(100, Math.round((simsDone / simsTotal) * 100)) : 0;
          const worldAverage = Number(wRaw.worldAverage ?? worldScoresArr[wId - 1] ?? 0);
          const assessmentScore = Number(wRaw.assessmentScore ?? 0);
          const officialAssessmentScore =
            wRaw.officialAssessmentScore !== null && wRaw.officialAssessmentScore !== undefined
              ? Number(wRaw.officialAssessmentScore)
              : null;
          const hasQuizAttempt =
            Number(wRaw.attemptsCount ?? 0) > 0 ||
            officialAssessmentScore !== null ||
            assessmentScore > 0;
          const isWorldPassed =
            typeof wRaw.isWorldPassed === 'boolean'
              ? wRaw.isWorldPassed
              : worldAverage > PROGRESSION_CONFIG.PASSING_THRESHOLD;

          worlds[wId] = {
            worldId: wId,
            worldTitle: worldTitles[wId] || `Mundo ${wId}`,
            worldAverage,
            simulatorsDone: simsDone,
            simulatorsTotal: simsTotal,
            completionPct,
            simulatorsAvg: Number(wRaw.simulatorsAvg ?? 0),
            assessmentScore,
            officialAssessmentScore,
            assessmentMention: wRaw.assessmentMention || '—',
            isWorldPassed,
            hasQuizAttempt,
          };
        }

        const getVal = (wId: number) =>
          metric === 'average'
            ? worlds[wId].worldAverage
            : metric === 'completion'
            ? worlds[wId].completionPct
            : worlds[wId].assessmentScore;

        const baseName = item.studentName || meta?.fullName || meta?.name || 'Aluno';
        const prefix = studentNumber ? `${studentNumber}. ` : '';

        return {
          studentId: item.studentId,
          studentName: baseName,
          shortLabel: `${prefix}${truncateName(baseName, studentNumber ? 17 : 20)}`,
          studentNumber,
          studentNickname: item.studentNickname || meta?.nickname || '',
          classId: item.classId || '',
          className: item.className || meta?.className || meta?.turma || '—',
          totalXP: Number(item.totalXP ?? meta?.xp ?? 0),
          level: Number(item.level ?? meta?.level ?? 1),
          globalAverage: Number(item.globalAverage ?? 0),
          worlds,
          w1: getVal(1),
          w2: getVal(2),
          w3: getVal(3),
          w4: getVal(4),
          w5: getVal(5),
        };
      });
  }, [pautaData, selectedClass, studentMetaById, worldTitles, metric]);

  const filteredAndSortedRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const filtered = q
      ? normalizedRows.filter(
          (r) =>
            r.studentName.toLowerCase().includes(q) ||
            r.studentNickname.toLowerCase().includes(q) ||
            r.className.toLowerCase().includes(q) ||
            (r.studentNumber !== null && String(r.studentNumber) === q)
        )
      : normalizedRows;

    const copy = [...filtered];
    copy.sort((a, b) => {
      if (sortBy === 'average_desc') {
        return b.globalAverage - a.globalAverage || b.totalXP - a.totalXP || a.studentName.localeCompare(b.studentName, 'pt');
      }
      if (sortBy === 'xp_desc') {
        return b.totalXP - a.totalXP || b.globalAverage - a.globalAverage || a.studentName.localeCompare(b.studentName, 'pt');
      }
      if (sortBy === 'name') {
        return a.studentName.localeCompare(b.studentName, 'pt');
      }
      // Default: className -> studentNumber -> studentName
      const classCmp = a.className.localeCompare(b.className, 'pt');
      if (selectedClass === 'all' && classCmp !== 0) return classCmp;
      if (a.studentNumber !== null && b.studentNumber !== null && a.studentNumber !== b.studentNumber) {
        return a.studentNumber - b.studentNumber;
      }
      if (a.studentNumber !== null && b.studentNumber === null) return -1;
      if (a.studentNumber === null && b.studentNumber !== null) return 1;
      return a.studentName.localeCompare(b.studentName, 'pt');
    });
    return copy;
  }, [normalizedRows, searchTerm, sortBy, selectedClass]);

  // Keep selectedStudentId valid when class/search changes
  useEffect(() => {
    if (filteredAndSortedRows.length === 0) {
      setSelectedStudentId('');
      return;
    }
    const exists = filteredAndSortedRows.some((r) => r.studentId === selectedStudentId);
    if (!exists) {
      // Pick the first student with any activity, or fallback to first student
      const activeStudent =
        filteredAndSortedRows.find((r) => r.globalAverage > 0 || r.totalXP > 0) ||
        filteredAndSortedRows[0];
      setSelectedStudentId(activeStudent.studentId);
    }
  }, [filteredAndSortedRows, selectedStudentId]);

  const activeSingleStudent = useMemo(
    () => filteredAndSortedRows.find((r) => r.studentId === selectedStudentId) || filteredAndSortedRows[0] || null,
    [filteredAndSortedRows, selectedStudentId]
  );

  const activeStudentIndex = useMemo(
    () =>
      activeSingleStudent
        ? filteredAndSortedRows.findIndex((r) => r.studentId === activeSingleStudent.studentId)
        : -1,
    [filteredAndSortedRows, activeSingleStudent]
  );

  const singleStudentChartData = useMemo(() => {
    if (!activeSingleStudent) return [];
    return [1, 2, 3, 4, 5].map((wId) => {
      const w = activeSingleStudent.worlds[wId];
      return {
        name: `Mundo ${wId}`,
        worldId: wId,
        worldTitle: w.worldTitle,
        average: w.worldAverage,
        completionPct: w.completionPct,
        quizScore: w.assessmentScore,
        officialQuizScore: w.officialAssessmentScore,
        mention: w.assessmentMention,
        hasQuiz: w.hasQuizAttempt,
        completedLabel: `${w.simulatorsDone}/${w.simulatorsTotal} simuladores`,
        isPassed: w.isWorldPassed,
        isUnlocked: true,
      };
    });
  }, [activeSingleStudent]);

  const hasAnyNonZeroData = useMemo(
    () =>
      filteredAndSortedRows.some(
        (r) => r.w1 > 0 || r.w2 > 0 || r.w3 > 0 || r.w4 > 0 || r.w5 > 0
      ),
    [filteredAndSortedRows]
  );

  const handleBarClick = (data: any) => {
    const clickedRow: NormalizedStudentRow | undefined = data?.payload || data;
    if (!clickedRow?.studentId) return;
    setSelectedStudentId(clickedRow.studentId);
    setViewMode('single_student');
  };

  if (!pautaData) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="h-5 w-64 bg-slate-100 rounded animate-pulse" />
        <div className="h-64 w-full bg-slate-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  const selectedClassName =
    selectedClass === 'all'
      ? 'Todas as Turmas'
      : classes.find((c) => c.id === selectedClass)?.name || 'Turma selecionada';

  const rowHeight = worldFilter === 'all' ? 58 : 38;
  const multiChartHeight = Math.max(300, filteredAndSortedRows.length * rowHeight + 56);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 shrink-0" />
            Progresso Detalhado por Aluno nos 5 Mundos
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            {selectedClassName} ·{' '}
            <span className="font-mono tabular-nums font-semibold text-slate-700">
              {filteredAndSortedRows.length}
            </span>{' '}
            {filteredAndSortedRows.length === 1 ? 'aluno apresentado' : 'alunos apresentados'} · Linha de referência de aprovação nos {PROGRESSION_CONFIG.PASSING_THRESHOLD}%
          </p>
        </div>

        {/* Right Controls: Turma Selector + View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <label htmlFor="chart-class-filter" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Turma:
            </label>
            <select
              id="chart-class-filter"
              value={selectedClass}
              onChange={(e) => onSelectClass(e.target.value)}
              aria-label="Selecionar turma no gráfico de progresso por aluno"
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">Todas as Turmas ({students.length})</option>
              {classes.map((c: any) => {
                const count = students.filter(
                  (s) => s.classId === c.id || s.turma === c.name || s.className === c.name
                ).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('all_students')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                viewMode === 'all_students'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Comparar Alunos</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('single_student')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                viewMode === 'single_student'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Detalhe de 1 Aluno</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls Toolbar */}
      <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-center justify-between gap-3">
        {viewMode === 'all_students' ? (
          <>
            {/* Left controls: Search & World focus */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Procurar aluno..."
                  aria-label="Procurar aluno no gráfico"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={worldFilter}
                  onChange={(e) =>
                    setWorldFilter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as 1 | 2 | 3 | 4 | 5))
                  }
                  aria-label="Filtrar Mundo no gráfico"
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Todos os 5 Mundos</option>
                  {[1, 2, 3, 4, 5].map((wId) => (
                    <option key={wId} value={wId}>
                      Mundo {wId}: {worldTitles[wId]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right controls: Metric & Sort */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                {(
                  [
                    { id: 'average', label: 'Média (%)' },
                    { id: 'completion', label: 'Simuladores (%)' },
                    { id: 'quiz', label: 'Quiz (%)' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMetric(m.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      metric === m.id
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label="Ordenar alunos no gráfico"
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="number">Ordenar: N.º / Turma</option>
                  <option value="average_desc">Ordenar: Maior Média</option>
                  <option value="xp_desc">Ordenar: Maior XP</option>
                  <option value="name">Ordenar: Nome (A–Z)</option>
                </select>
              </div>
            </div>
          </>
        ) : (
          /* Single Student Selector Bar */
          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                type="button"
                disabled={activeStudentIndex <= 0}
                onClick={() => {
                  if (activeStudentIndex > 0) {
                    setSelectedStudentId(filteredAndSortedRows[activeStudentIndex - 1].studentId);
                  }
                }}
                aria-label="Aluno anterior"
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={activeSingleStudent?.studentId || ''}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                aria-label="Selecionar aluno para ver detalhe nos 5 Mundos"
                className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {filteredAndSortedRows.map((r) => (
                  <option key={r.studentId} value={r.studentId}>
                    {r.studentNumber ? `N.º ${r.studentNumber} · ` : ''}
                    {r.studentName} ({r.className}) — Média {r.globalAverage}% · {r.totalXP} XP
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={activeStudentIndex < 0 || activeStudentIndex >= filteredAndSortedRows.length - 1}
                onClick={() => {
                  if (activeStudentIndex >= 0 && activeStudentIndex < filteredAndSortedRows.length - 1) {
                    setSelectedStudentId(filteredAndSortedRows[activeStudentIndex + 1].studentId);
                  }
                }}
                aria-label="Próximo aluno"
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {activeSingleStudent && (
              <button
                type="button"
                onClick={() =>
                  onOpenStudent({
                    id: activeSingleStudent.studentId,
                    name: activeSingleStudent.studentName,
                  })
                }
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Dossiê Completo</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredAndSortedRows.length === 0 ? (
        <div className="py-12 px-4 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
          <BarChart3 className="w-8 h-8 mx-auto text-slate-300" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-700">
              Nenhum aluno encontrado para estes filtros
            </p>
            <p className="text-xs text-slate-500">
              Ajusta a pesquisa ou escolhe outra turma para visualizar o progresso nos 5 Mundos.
            </p>
          </div>
          {(searchTerm || selectedClass !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                onSelectClass('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : viewMode === 'all_students' ? (
        /* MODE A: ALL STUDENTS COMPARISON HORIZONTAL BAR CHART */
        <div className="space-y-3">
          {!hasAnyNonZeroData && (
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
              Ainda não existem pontuações registadas para esta métrica nos alunos visíveis. As barras atualizam automaticamente assim que os alunos concluírem simuladores ou quizzes.
            </div>
          )}

          <div className="border border-slate-100 rounded-xl bg-slate-50/40 p-2 sm:p-3">
            <div className="max-h-[540px] overflow-y-auto pr-1">
              <div style={{ width: '100%', height: `${multiChartHeight}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredAndSortedRows}
                    layout="vertical"
                    margin={{ top: 12, right: 24, left: 8, bottom: 8 }}
                    barGap={2}
                    barCategoryGap={worldFilter === 'all' ? '18%' : '26%'}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      ticks={[0, 20, 40, 60, 70, 80, 100]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={{ stroke: '#CBD5E1' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="shortLabel"
                      width={136}
                      tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 600 }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                      content={<MultiStudentTooltip metric={metric} />}
                    />
                    <Legend
                      verticalAlign="top"
                      height={34}
                      iconType="square"
                      iconSize={10}
                      wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}
                    />
                    <ReferenceLine
                      x={PROGRESSION_CONFIG.PASSING_THRESHOLD}
                      stroke="#059669"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: `${PROGRESSION_CONFIG.PASSING_THRESHOLD}%`,
                        position: 'insideTopRight',
                        fill: '#047857',
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    />

                    {worldFilter === 'all' ? (
                      <>
                        <Bar
                          dataKey="w1"
                          name={`M1 · ${worldTitles[1]}`}
                          fill={WORLD_COLORS[1].hex}
                          radius={[0, 3, 3, 0]}
                          barSize={8}
                          onClick={handleBarClick}
                          className="cursor-pointer"
                        />
                        <Bar
                          dataKey="w2"
                          name={`M2 · ${worldTitles[2]}`}
                          fill={WORLD_COLORS[2].hex}
                          radius={[0, 3, 3, 0]}
                          barSize={8}
                          onClick={handleBarClick}
                          className="cursor-pointer"
                        />
                        <Bar
                          dataKey="w3"
                          name={`M3 · ${worldTitles[3]}`}
                          fill={WORLD_COLORS[3].hex}
                          radius={[0, 3, 3, 0]}
                          barSize={8}
                          onClick={handleBarClick}
                          className="cursor-pointer"
                        />
                        <Bar
                          dataKey="w4"
                          name={`M4 · ${worldTitles[4]}`}
                          fill={WORLD_COLORS[4].hex}
                          radius={[0, 3, 3, 0]}
                          barSize={8}
                          onClick={handleBarClick}
                          className="cursor-pointer"
                        />
                        <Bar
                          dataKey="w5"
                          name={`M5 · ${worldTitles[5]}`}
                          fill={WORLD_COLORS[5].hex}
                          radius={[0, 3, 3, 0]}
                          barSize={8}
                          onClick={handleBarClick}
                          className="cursor-pointer"
                        />
                      </>
                    ) : (
                      <Bar
                        dataKey={`w${worldFilter}`}
                        name={`Mundo ${worldFilter} · ${worldTitles[worldFilter]}`}
                        fill={WORLD_COLORS[worldFilter].hex}
                        radius={[0, 5, 5, 0]}
                        barSize={20}
                        onClick={handleBarClick}
                        className="cursor-pointer"
                      >
                        {filteredAndSortedRows.map((entry) => {
                          const key = `w${worldFilter}` as 'w1' | 'w2' | 'w3' | 'w4' | 'w5';
                          const val = entry[key];
                          const fill =
                            val > PROGRESSION_CONFIG.PASSING_THRESHOLD
                              ? '#059669'
                              : val > 0
                              ? '#D97706'
                              : '#CBD5E1';
                          return <Cell key={entry.studentId} fill={fill} />;
                        })}
                      </Bar>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>
              Dica: clica em qualquer barra de aluno para alternar para a vista detalhada dos 5 Mundos desse aluno.
            </span>
            {worldFilter !== 'all' && (
              <span className="font-medium text-slate-600">
                Cores: Verde (&gt;{PROGRESSION_CONFIG.PASSING_THRESHOLD}% aprovado) · Âmbar (em curso) · Cinzento (0%)
              </span>
            )}
          </div>
        </div>
      ) : (
        /* MODE B: SINGLE STUDENT 5-WORLD DETAILED BAR CHART */
        activeSingleStudent && (
          <div className="space-y-4">
            {/* Unboxed Clean Student Metadata Summary */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-bold text-slate-900 text-sm">
                  {activeSingleStudent.studentNumber ? `N.º ${activeSingleStudent.studentNumber} · ` : ''}
                  {activeSingleStudent.studentName}
                </span>
                <span className="text-slate-400" aria-hidden="true">·</span>
                <span className="text-slate-600 font-medium">{activeSingleStudent.className}</span>
                <span className="text-slate-400" aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-slate-700 font-semibold">
                  {activeSingleStudent.totalXP} XP (Nível {activeSingleStudent.level})
                </span>
              </div>
              <div className="flex items-center gap-4 font-mono tabular-nums text-xs">
                <span className="text-slate-600">
                  Média Global:{' '}
                  <strong
                    className={
                      activeSingleStudent.globalAverage > PROGRESSION_CONFIG.PASSING_THRESHOLD
                        ? 'text-emerald-700'
                        : 'text-slate-900'
                    }
                  >
                    {activeSingleStudent.globalAverage}%
                  </strong>
                </span>
                <span className="text-slate-600">
                  Mundos Aprovados:{' '}
                  <strong className="text-slate-900">
                    {[1, 2, 3, 4, 5].filter((id) => activeSingleStudent.worlds[id].isWorldPassed).length}/5
                  </strong>
                </span>
              </div>
            </div>

            {/* Detailed 3-Series Grouped Bar Chart */}
            <div className="border border-slate-100 rounded-xl bg-slate-50/40 p-3 sm:p-4">
              <div className="w-full h-[310px] sm:h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={singleStudentChartData}
                    margin={{ top: 16, right: 20, left: 0, bottom: 8 }}
                    barGap={4}
                    barCategoryGap="22%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#1E293B', fontWeight: 700 }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 20, 40, 60, 70, 80, 100]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={{ stroke: '#CBD5E1' }}
                      width={44}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                      content={<SingleStudentTooltip />}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="square"
                      iconSize={10}
                      wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}
                    />
                    <ReferenceLine
                      y={PROGRESSION_CONFIG.PASSING_THRESHOLD}
                      stroke="#059669"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: `Critério > ${PROGRESSION_CONFIG.PASSING_THRESHOLD}%`,
                        position: 'insideTopRight',
                        fill: '#047857',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    />
                    <Bar
                      dataKey="average"
                      name="Média do Mundo (%)"
                      fill="#2563EB"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={32}
                    />
                    <Bar
                      dataKey="completionPct"
                      name="Simuladores Concluídos (%)"
                      fill="#059669"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={32}
                    />
                    <Bar
                      dataKey="quizScore"
                      name="Quiz de Avaliação (%)"
                      fill="#D97706"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Compact Tabular World Breakdown below chart */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">Mundo</th>
                    <th className="py-2.5 px-3 text-right">Simuladores</th>
                    <th className="py-2.5 px-3 text-right">Quiz</th>
                    <th className="py-2.5 px-3 text-right">Média do Mundo</th>
                    <th className="py-2.5 px-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {singleStudentChartData.map((w) => (
                    <tr key={w.worldId} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        Mundo {w.worldId} · {w.worldTitle}
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-700">
                        {w.completionPct}% ({activeSingleStudent.worlds[w.worldId].simulatorsDone}/
                        {activeSingleStudent.worlds[w.worldId].simulatorsTotal})
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-700">
                        {w.hasQuiz ? `${w.quizScore}%` : '—'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        {w.average > 0 ? `${w.average}%` : '0%'}
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-semibold ${
                          w.isPassed ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        {w.isPassed ? 'Aprovado' : w.average > 0 ? 'Em curso' : 'Não iniciado'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
};

interface SingleStudentWorldBarChartProps {
  worldDetails: any[];
}

export const SingleStudentWorldBarChart: React.FC<SingleStudentWorldBarChartProps> = ({
  worldDetails,
}) => {
  const chartData = useMemo(() => {
    return (worldDetails || []).map((w: any) => {
      const completedCount = Number(w.completedCount ?? 0);
      const totalComponents = Number(w.totalComponents ?? 0);
      const completionPct =
        totalComponents > 0 ? Math.min(100, Math.round((completedCount / totalComponents) * 100)) : 0;

      const assessments = Array.isArray(w.assessments) ? w.assessments : [];
      const sortedByDate = [...assessments].sort(
        (a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      );
      const official = sortedByDate[0];
      const best = [...assessments].sort((a: any, b: any) => (b.percentage || 0) - (a.percentage || 0))[0];

      const average = Number(w.average ?? 0);

      return {
        name: `Mundo ${w.worldId}`,
        worldId: w.worldId,
        worldTitle: w.title || DEFAULT_WORLD_TITLES[w.worldId] || `Mundo ${w.worldId}`,
        average,
        completionPct,
        quizScore: best ? Number(best.percentage || 0) : 0,
        officialQuizScore: official ? Number(official.percentage || 0) : null,
        mention: best?.mention || official?.mention || '—',
        hasQuiz: assessments.length > 0,
        completedLabel: `${completedCount}/${totalComponents} atividades`,
        isPassed: average > PROGRESSION_CONFIG.PASSING_THRESHOLD,
        isUnlocked: Boolean(w.isUnlocked),
      };
    });
  }, [worldDetails]);

  if (chartData.length === 0) return null;

  const approvedCount = chartData.filter((w) => w.isPassed).length;
  const overallAvg = Math.round(
    chartData.reduce((acc, item) => acc + item.average, 0) / chartData.length
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Gráfico de Progresso Individual por Mundo
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparação entre média global do mundo, atividades concluídas e melhor resultado no quiz.
          </p>
        </div>
        <div className="text-xs text-slate-600 font-mono tabular-nums shrink-0">
          Aprovados: <strong className="text-slate-900">{approvedCount}/{chartData.length}</strong> · Média:{' '}
          <strong className={overallAvg > PROGRESSION_CONFIG.PASSING_THRESHOLD ? 'text-emerald-700' : 'text-slate-900'}>
            {overallAvg}%
          </strong>
        </div>
      </div>

      <div className="w-full h-[260px] sm:h-[290px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 14, right: 16, left: -6, bottom: 4 }}
            barGap={4}
            barCategoryGap="24%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 700 }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 70, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={{ stroke: '#CBD5E1' }}
              width={44}
            />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
              content={<SingleStudentTooltip />}
            />
            <Legend
              verticalAlign="top"
              height={32}
              iconType="square"
              iconSize={10}
              wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#334155' }}
            />
            <ReferenceLine
              y={PROGRESSION_CONFIG.PASSING_THRESHOLD}
              stroke="#059669"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `${PROGRESSION_CONFIG.PASSING_THRESHOLD}%`,
                position: 'insideTopRight',
                fill: '#047857',
                fontSize: 10,
                fontWeight: 700,
              }}
            />
            <Bar
              dataKey="average"
              name="Média do Mundo (%)"
              fill="#2563EB"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="completionPct"
              name="Atividades (%)"
              fill="#059669"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="quizScore"
              name="Melhor Quiz (%)"
              fill="#D97706"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
