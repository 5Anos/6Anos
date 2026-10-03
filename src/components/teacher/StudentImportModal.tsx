import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  FileText,
  ClipboardList,
  UserPlus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Key,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiRequest } from '../../api';
import {
  generateKidUsername,
  generateKidPassword,
  extractShortName,
  normalizeTurmaName,
} from '../../utils/kidCredentials';

interface StudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: any[];
  onSuccess: () => void;
}

interface ParsedStudentItem {
  id: string;
  studentNumber: number;
  fullName: string;
  shortName: string;
  turma: string;
  username: string;
  initialPassword: string;
  email: string;
}

export const StudentImportModal: React.FC<StudentImportModalProps> = ({
  isOpen,
  onClose,
  classes = [],
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'excel' | 'csv' | 'paste' | 'manual'>('excel');
  const [defaultTurma, setDefaultTurma] = useState<string>(
    classes.length > 0 ? classes[0].name : '6.º A'
  );
  const [parsedStudents, setParsedStudents] = useState<ParsedStudentItem[]>([]);
  const [pasteText, setPasteText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  // Manual Form State
  const [manualFullName, setManualFullName] = useState('');
  const [manualTurma, setManualTurma] = useState(
    classes.length > 0 ? classes[0].name : '6.º A'
  );
  const [manualNumber, setManualNumber] = useState<number>(1);

  if (!isOpen) return null;

  // Process rows from SheetJS
  const processRawRows = (rows: any[][], sourceTurma: string) => {
    if (rows.length === 0) {
      setError('O ficheiro parece estar vazio.');
      return;
    }

    // Try finding header row or process directly
    let headerRowIdx = -1;
    let nameColIdx = -1;
    let numberColIdx = -1;
    let turmaColIdx = -1;

    for (let r = 0; r < Math.min(10, rows.length); r++) {
      const row = rows[r];
      if (!Array.isArray(row)) continue;
      for (let c = 0; c < row.length; c++) {
        const val = String(row[c] || '').trim().toLowerCase();
        if (
          val === 'nome' ||
          val === 'nome completo' ||
          val === 'aluno' ||
          val === 'nome do aluno' ||
          val === 'estudante'
        ) {
          nameColIdx = c;
          headerRowIdx = r;
        } else if (
          val === 'n.º' ||
          val === 'nº' ||
          val === 'num' ||
          val === 'número' ||
          val === 'numero' ||
          val === 'n_chamada'
        ) {
          numberColIdx = c;
        } else if (val === 'turma' || val === 'classe' || val === 'ano/turma') {
          turmaColIdx = c;
        }
      }
      if (nameColIdx !== -1) break;
    }

    const startRow = headerRowIdx !== -1 ? headerRowIdx + 1 : 0;
    if (nameColIdx === -1) {
      // Default to column 0 or 1
      nameColIdx = rows[0].length > 1 && !isNaN(Number(rows[0][0])) ? 1 : 0;
      if (numberColIdx === -1 && nameColIdx === 1) numberColIdx = 0;
    }

    const existingUsernames = new Set<string>();
    const list: ParsedStudentItem[] = [];

    let autoNum = 1;
    for (let r = startRow; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      const rawName = String(row[nameColIdx] || '').trim();
      if (!rawName || rawName.length < 2) continue;
      // Skip obvious header repeat
      if (rawName.toLowerCase() === 'nome' || rawName.toLowerCase() === 'nome completo') continue;

      let studentNum = autoNum;
      if (numberColIdx !== -1 && row[numberColIdx] !== undefined) {
        const parsedN = parseInt(String(row[numberColIdx]).replace(/\D/g, ''), 10);
        if (!isNaN(parsedN) && parsedN > 0) {
          studentNum = parsedN;
        }
      }

      let rowTurma = sourceTurma;
      if (turmaColIdx !== -1 && row[turmaColIdx]) {
        const tVal = String(row[turmaColIdx]).trim();
        if (tVal) rowTurma = normalizeTurmaName(tVal);
      }

      const { displayName } = extractShortName(rawName);
      const username = generateKidUsername(rawName, rowTurma, existingUsernames);
      existingUsernames.add(username);

      const initialPassword = generateKidPassword();
      const email = `${username}@escola.local`;

      list.push({
        id: `preview-${r}-${autoNum}`,
        studentNumber: studentNum,
        fullName: rawName,
        shortName: displayName,
        turma: rowTurma,
        username,
        initialPassword,
        email,
      });

      autoNum++;
    }

    if (list.length === 0) {
      setError('Não foi possível identificar nomes válidos no ficheiro. Verifica a formatação.');
      return;
    }

    setParsedStudents(list);
    setError(null);
  };

  // 1. File Upload (Excel or CSV)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        processRawRows(jsonRows, defaultTurma);
      } catch (err: any) {
        console.error('Error parsing spreadsheet:', err);
        setError('Erro ao ler ficheiro. Certifica-te de que é um formato válido (.xlsx, .xls ou .csv).');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // 2. Paste text parsing
  const handleParsePaste = () => {
    setError(null);
    if (!pasteText.trim()) {
      setError('Por favor cola uma lista de nomes na caixa de texto.');
      return;
    }

    const lines = pasteText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setError('Nenhum nome válido encontrado no texto colado.');
      return;
    }

    const existingUsernames = new Set<string>();
    const list: ParsedStudentItem[] = [];

    lines.forEach((line, idx) => {
      // Check for leading numbers e.g. "1. João Silva", "02 - Maria", "3\tPedro"
      let studentNum = idx + 1;
      let rawName = line;

      const numMatch = line.match(/^(\d+)[\.\s\-\:\t]+(.*)$/);
      if (numMatch) {
        const parsed = parseInt(numMatch[1], 10);
        if (!isNaN(parsed)) studentNum = parsed;
        rawName = numMatch[2].trim();
      }

      if (!rawName || rawName.length < 2) return;

      const { displayName } = extractShortName(rawName);
      const username = generateKidUsername(rawName, defaultTurma, existingUsernames);
      existingUsernames.add(username);

      const initialPassword = generateKidPassword();
      const email = `${username}@escola.local`;

      list.push({
        id: `paste-${idx + 1}`,
        studentNumber: studentNum,
        fullName: rawName,
        shortName: displayName,
        turma: defaultTurma,
        username,
        initialPassword,
        email,
      });
    });

    if (list.length === 0) {
      setError('Não foi possível extrair nomes válidos. Verifica o texto.');
      return;
    }

    setParsedStudents(list);
  };

  // 3. Add single manual student to preview
  const handleAddManualStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualFullName.trim()) {
      setError('Preenche o nome do aluno.');
      return;
    }

    const existingUsernames = new Set<string>(parsedStudents.map((s) => s.username));
    const cleanName = manualFullName.trim();
    const { displayName } = extractShortName(cleanName);
    const targetTurma = normalizeTurmaName(manualTurma);
    const username = generateKidUsername(cleanName, targetTurma, existingUsernames);
    const initialPassword = generateKidPassword();
    const email = `${username}@escola.local`;

    const newItem: ParsedStudentItem = {
      id: `manual-${Date.now()}`,
      studentNumber: manualNumber,
      fullName: cleanName,
      shortName: displayName,
      turma: targetTurma,
      username,
      initialPassword,
      email,
    };

    setParsedStudents((prev) => [...prev, newItem]);
    setManualFullName('');
    setManualNumber((prev) => prev + 1);
    setError(null);
  };

  // Regenerate credentials for an individual student
  const handleRegenerateItem = (id: string) => {
    setParsedStudents((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const otherUsernames = new Set<string>(prev.filter((p) => p.id !== id).map((p) => p.username));
        const newUsername = generateKidUsername(item.fullName, item.turma, otherUsernames);
        const newPassword = generateKidPassword();
        return {
          ...item,
          username: newUsername,
          initialPassword: newPassword,
          email: `${newUsername}@escola.local`,
        };
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setParsedStudents((prev) => prev.filter((p) => p.id !== id));
  };

  // Submit batch to backend API
  const handleConfirmSubmit = async () => {
    if (parsedStudents.length === 0) {
      setError('Não há alunos na lista para registar.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await apiRequest('/api/teacher/students/batch-import', {
        method: 'POST',
        body: JSON.stringify({
          students: parsedStudents.map((s) => ({
            fullName: s.fullName,
            name: s.shortName,
            studentNumber: s.studentNumber,
            turma: s.turma,
            customUsername: s.username,
            customPassword: s.initialPassword,
            email: s.email,
          })),
          defaultTurma,
        }),
      });

      setSuccessCount(res.importedCount || parsedStudents.length);
      onSuccess();
    } catch (err: any) {
      console.error('Error importing students:', err);
      setError(err.message || 'Erro ao gravar alunos no servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden relative my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-300" />
              <span>Registo e Importação de Alunos</span>
            </h2>
            <p className="text-xs text-blue-100 font-medium mt-0.5">
              Importa a pauta oficial com geração automática de credenciais amigáveis (Kid-Friendly)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {successCount !== null ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {successCount} Alunos Registados com Sucesso!
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Todas as contas foram criadas com as respetivas palavras-passe amigáveis. Podes agora imprimir os cartões de acesso ou consultar a tabela geral.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessCount(null);
                    setParsedStudents([]);
                    setPasteText('');
                    setFileName(null);
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  Concluir e Ver Alunos
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Method Switcher Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('excel');
                    setError(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'excel'
                      ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>1. Ficheiro Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('csv');
                    setError(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'csv'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>2. Ficheiro CSV (Inovar)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('paste');
                    setError(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'paste'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ClipboardList className="w-4 h-4 text-indigo-600" />
                  <span>3. Colar Texto (Paste)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('manual');
                    setError(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'manual'
                      ? 'bg-white text-violet-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-4 h-4 text-violet-600" />
                  <span>4. Registo Manual</span>
                </button>
              </div>

              {/* Turma selection */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                <label className="text-xs font-bold text-slate-700 shrink-0">
                  Turma Padrão para os Alunos:
                </label>
                <select
                  value={defaultTurma}
                  onChange={(e) => setDefaultTurma(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  <option value="6.º A">6.º A</option>
                  <option value="6.º B">6.º B</option>
                  <option value="6.º C">6.º C</option>
                  <option value="6.º D">6.º D</option>
                  <option value="6.º E">6.º E</option>
                </select>
                <span className="text-[11px] text-slate-500">
                  (O sistema também reconhece a turma indicada no ficheiro se existir coluna "Turma")
                </span>
              </div>

              {/* Tab 1 & Tab 2: Excel / CSV Upload */}
              {(activeTab === 'excel' || activeTab === 'csv') && (
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 rounded-2xl p-6 text-center transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {activeTab === 'excel'
                      ? 'Carregar Lista de Turma Oficial (.xlsx ou .xls)'
                      : 'Carregar Ficheiro CSV (GIAE, Inovar, etc.)'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    O sistema lê automaticamente colunas como "Nome", "Nome Completo", "N.º", "Número" e "Turma".
                  </p>
                  <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs">
                    <span>Selecionar Ficheiro do Computador</span>
                    <input
                      type="file"
                      accept={activeTab === 'excel' ? '.xlsx, .xls' : '.csv'}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {fileName && (
                    <div className="mt-2 text-xs font-mono text-emerald-700 font-bold">
                      Ficheiro selecionado: {fileName}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Paste text */}
              {activeTab === 'paste' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Copia e cola a lista de alunos (um por linha):
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Ex: "1. Anderson Santos" ou apenas "Anderson Santos"
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="1. Anderson Oliveira dos Santos&#10;2. Beatriz Maria Silva&#10;3. Carlos Eduardo Ferreira"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleParsePaste}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Processar Nomes e Gerar Credenciais</span>
                  </button>
                </div>
              )}

              {/* Tab 4: Manual Form */}
              {activeTab === 'manual' && (
                <form onSubmit={handleAddManualStudent} className="space-y-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Registar Novo Aluno Individualmente:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">Nome Completo Oficial:</label>
                      <input
                        type="text"
                        required
                        value={manualFullName}
                        onChange={(e) => setManualFullName(e.target.value)}
                        placeholder="Ex: Anderson Oliveira dos Santos"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">N.º Chamada:</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={manualNumber}
                        onChange={(e) => setManualNumber(parseInt(e.target.value, 10) || 1)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Adicionar à Lista de Pré-visualização</span>
                    </button>
                  </div>
                </form>
              )}

              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Preview Table of Generated Credentials */}
              {parsedStudents.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Credenciais Geradas Automaticamente ({parsedStudents.length} alunos)</span>
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Prontas a Guardar
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                          <th className="py-2.5 px-3 w-12 text-center">N.º</th>
                          <th className="py-2.5 px-3">Nome Completo</th>
                          <th className="py-2.5 px-3">Turma</th>
                          <th className="py-2.5 px-3">Username (Login)</th>
                          <th className="py-2.5 px-3">Palavra-passe (Kid)</th>
                          <th className="py-2.5 px-3 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedStudents.map((s) => (
                          <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-2 px-3 text-center font-bold text-slate-600">
                              {s.studentNumber}
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-bold text-slate-900">{s.fullName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{s.shortName}</div>
                            </td>
                            <td className="py-2 px-3">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-bold text-slate-700 text-[11px]">
                                {s.turma}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-blue-700">
                              @{s.username}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-emerald-700 bg-emerald-50/50">
                              <div className="flex items-center gap-1">
                                <Key className="w-3 h-3 text-emerald-600" />
                                <span>{s.initialPassword}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleRegenerateItem(s.id)}
                                  title="Gerar novas credenciais"
                                  className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(s.id)}
                                  title="Remover da lista"
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {successCount === null && (
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-500 font-medium">
              {parsedStudents.length > 0 ? (
                <span>
                  <strong>{parsedStudents.length}</strong> alunos prontos para criação de conta
                </span>
              ) : (
                <span>Escolhe um método acima para carregar alunos.</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={parsedStudents.length === 0 || isSubmitting}
                onClick={handleConfirmSubmit}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>A Criar Contas na Nuvem...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>Confirmar e Gravar {parsedStudents.length} Alunos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
