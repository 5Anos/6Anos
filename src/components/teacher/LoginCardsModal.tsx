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
  QrCode,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { extractShortName } from '../../utils/kidCredentials';

interface LoginCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: any[];
  classes: any[];
}

const OFFICIAL_PLATFORM_URL = 'https://5anos.github.io/6Anos/';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Inject Print-specific styles */}
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
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
            padding: 8mm;
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
              Folha pronta a imprimir (formato A4) com QR Code de acesso direto, link oficial e linhas tracejadas para recorte
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

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-mono font-bold text-[11px]">
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              <span>{OFFICIAL_PLATFORM_URL}</span>
            </span>
            <span>
              A mostrar <strong>{filteredStudents.length}</strong> cartões prontos para A4.
            </span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 print:grid-cols-2 gap-4 print:gap-3.5">
              {filteredStudents.map((student) => {
                const turmaName = student.turma || student.className || '6.º Ano';
                const callNum = student.studentNumber ? `N.º ${student.studentNumber}` : '';
                const fullName = student.fullName || student.name || '';
                const shortName = extractShortName(fullName).displayName;
                const username = student.username || student.nickname;
                const password = student.initialPassword || '••••••';

                return (
                  <div
                    key={student.id}
                    className="print-card relative border-2 border-dashed border-slate-300 print:border-slate-400 bg-white rounded-2xl p-4 shadow-xs flex flex-col justify-between overflow-hidden"
                  >
                    {/* Cut guideline corner indicator */}
                    <div className="absolute top-1 right-2 flex items-center gap-1 text-[9px] font-mono text-slate-400 select-none">
                      <Scissors className="w-2.5 h-2.5 text-slate-400" />
                      <span>recortar</span>
                    </div>

                    {/* Card Top: Discipline & Turma */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3 pr-12">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-[10px] shrink-0">
                          TIC
                        </div>
                        <div className="text-[11px] font-black tracking-wider uppercase text-blue-900 leading-tight">
                          MISSÃO TIC 6.º ANO
                        </div>
                      </div>

                      <div className="px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-black text-xs shrink-0">
                        {turmaName}
                      </div>
                    </div>

                    {/* Main Body: Student Credentials (Left) + QR Code (Right) */}
                    <div className="flex items-stretch justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        {/* Student Name */}
                        <div className="mb-2.5">
                          <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                            {callNum ? `${callNum} • Nome do Aluno` : 'Nome do Aluno'}
                          </div>
                          <div className="text-sm font-black text-slate-900 leading-snug break-words">
                            {callNum ? `${callNum} - ${shortName}` : shortName}
                          </div>
                        </div>

                        {/* Credentials Box */}
                        <div className="grid grid-cols-1 gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-[9px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1 shrink-0">
                              <User className="w-2.5 h-2.5 text-blue-600" />
                              <span>Utilizador:</span>
                            </div>
                            <div className="font-mono font-bold text-xs text-blue-700 break-all text-right">
                              {username}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/70">
                            <div className="text-[9px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1 shrink-0">
                              <Key className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Palavra-passe:</span>
                            </div>
                            <div className="font-mono font-black text-xs text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                              {password}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* QR Code Column */}
                      <div className="shrink-0 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl p-2 shadow-2xs">
                        <QRCodeSVG
                          value={OFFICIAL_PLATFORM_URL}
                          size={78}
                          level="M"
                          bgColor="#ffffff"
                          fgColor="#0f172a"
                          includeMargin={false}
                        />
                        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 mt-1 text-center leading-tight">
                          Lê o QR Code
                        </span>
                      </div>
                    </div>

                    {/* Card Footer: Visible Full Web Address */}
                    <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-1.5 bg-blue-50/50 -mx-4 -mb-4 px-4 py-2">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-blue-800">
                        <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <a
                          href={OFFICIAL_PLATFORM_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-blue-300 underline-offset-2 break-all"
                        >
                          {OFFICIAL_PLATFORM_URL}
                        </a>
                      </div>
                      <span className="text-[9px] text-slate-500 font-semibold">
                        Guarda na tua caderneta!
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
            <span>Dica: Podes imprimir em papel normal ou cartolina. Cada cartão inclui o QR Code e o link direto para a página dos alunos.</span>
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
