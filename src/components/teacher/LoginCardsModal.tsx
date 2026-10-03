import React, { useState } from 'react';
import {
  X,
  Printer,
  Scissors,
  Key,
  User,
  GraduationCap,
  Globe,
  Filter,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface LoginCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: any[];
  classes: any[];
}

export const LoginCardsModal: React.FC<LoginCardsModalProps> = ({
  isOpen,
  onClose,
  students = [],
  classes = [],
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');

  if (!isOpen) return null;

  const filteredStudents = students.filter((s) => {
    if (selectedClass === 'all') return true;
    return s.classId === selectedClass || s.turma === selectedClass;
  });

  // Sort by Turma and studentNumber
  filteredStudents.sort((a, b) => {
    const classComp = (a.turma || a.className || '').localeCompare(b.turma || b.className || '');
    if (classComp !== 0) return classComp;
    if (a.studentNumber && b.studentNumber) return a.studentNumber - b.studentNumber;
    return (a.name || '').localeCompare(b.name || '');
  });

  const handlePrint = () => {
    window.print();
  };

  const platformUrl = typeof window !== 'undefined' ? window.location.origin : 'https://missao-tic.escola.pt';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Inject Print-specific styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-login-cards, #printable-login-cards * {
            visibility: visible;
          }
          #printable-login-cards {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10mm;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden relative my-auto flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Header - Hidden on Print */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white flex items-center justify-between shrink-0 no-print">
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Scissors className="w-5 h-5 text-amber-300" />
              <span>Cartões Individuais de Acesso (Login Cards)</span>
            </h2>
            <p className="text-xs text-blue-100 font-medium mt-0.5">
              Folha pronta a imprimir (formato A4) com linhas tracejadas e tesoura para recorte fácil
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Cartões (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar - Hidden on Print */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <label className="text-xs font-bold text-slate-700">Filtrar por Turma:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Todas as Turmas ({students.length} cartões)</option>
              {classes.map((c) => {
                const count = students.filter((s) => s.classId === c.id || s.turma === c.name).length;
                return (
                  <option key={c.id} value={c.id}>
                    Turma {c.name} ({count} cartões)
                  </option>
                );
              })}
            </select>
          </div>

          <div className="text-xs text-slate-500">
            A mostrar <strong>{filteredStudents.length}</strong> cartões prontos para impressão em folha A4.
          </div>
        </div>

        {/* Printable Grid Area */}
        <div id="printable-login-cards" className="p-6 overflow-y-auto flex-1 bg-slate-100/50 print:bg-white print:p-0">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="font-bold text-slate-700">Nenhum aluno encontrado para a turma selecionada.</p>
              <p className="text-xs text-slate-500 mt-1">Usa o botão "Registar / Importar Alunos" para adicionar alunos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 print:grid-cols-2 gap-4 print:gap-4">
              {filteredStudents.map((student) => {
                const turmaName = student.turma || student.className || '6.º Ano';
                const callNum = student.studentNumber ? `N.º ${student.studentNumber}` : '';
                const fullName = student.fullName || student.name;
                const username = student.username || student.nickname;
                const password = student.initialPassword || '••••••';

                return (
                  <div
                    key={student.id}
                    className="print-card relative border-2 border-dashed border-slate-300 print:border-slate-400 bg-white rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between overflow-hidden"
                  >
                    {/* Cut guideline corner indicator */}
                    <div className="absolute top-1 right-2 flex items-center gap-1 text-[10px] font-mono text-slate-400 select-none">
                      <Scissors className="w-3 h-3 text-slate-400" />
                      <span>recortar</span>
                    </div>

                    {/* Card Top: Discipline & Turma */}
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-[10px]">
                            TIC
                          </div>
                          <div>
                            <div className="text-[11px] font-black tracking-wider uppercase text-blue-900 leading-tight">
                              MISSÃO TIC 6.º ANO
                            </div>
                            <div className="text-[9px] text-slate-400 font-medium">
                              Cartão Oficial de Acesso
                            </div>
                          </div>
                        </div>

                        <div className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-black text-xs">
                          {turmaName}
                        </div>
                      </div>

                      {/* Student info */}
                      <div className="mb-3">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          {callNum ? `${callNum} • Nome do Aluno` : 'Nome do Aluno'}
                        </div>
                        <div className="text-sm font-black text-slate-900 leading-snug">
                          {callNum ? `${callNum} - ${fullName}` : fullName}
                        </div>
                      </div>

                      {/* Credentials Grid */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-3">
                        <div>
                          <div className="text-[9px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                            <User className="w-2.5 h-2.5 text-blue-600" />
                            <span>Utilizador</span>
                          </div>
                          <div className="font-mono font-bold text-xs text-blue-700 mt-0.5 break-all">
                            {username}
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                            <Key className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Palavra-passe</span>
                          </div>
                          <div className="font-mono font-black text-xs text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {password}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Web Address */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex items-center gap-1 font-mono text-slate-600">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[190px]">{platformUrl}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-semibold">
                        Guarda este cartão na tua caderneta!
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Hidden on Print */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 no-print">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Dica: Podes imprimir em papel normal ou cartolina para recortar e entregar a cada aluno na aula.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-bold cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Agora (A4)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
