import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  Download,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { extractShortName } from '../../utils/kidCredentials';

interface LoginCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: any[];
  classes: any[];
  initialClassId?: string;
}

const OFFICIAL_PLATFORM_URL = 'https://5anos.github.io/6Anos/';
const CARDS_PER_A4_PAGE = 8;

const escapeHtml = (value: string): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

interface PreparedCard {
  id: string;
  turmaName: string;
  callNum: string;
  shortName: string;
  username: string;
  password: string;
}

const chunkArray = <T,>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const buildStandalonePrintHtml = (
  cards: PreparedCard[],
  qrSvgMarkup: string,
  turmaLabel: string,
  includeToolbar: boolean
): string => {
  const pages = chunkArray(cards, CARDS_PER_A4_PAGE);

  const pagesHtml = pages
    .map((pageCards, pageIndex) => {
      const cardsHtml = pageCards
        .map((card) => {
          const titleLabel = card.callNum
            ? `${escapeHtml(card.callNum)} • Nome do Aluno`
            : 'Nome do Aluno';
          const displayName = card.callNum
            ? `${escapeHtml(card.callNum)} - ${escapeHtml(card.shortName)}`
            : escapeHtml(card.shortName);

          return `
            <div class="card">
              <div class="cut-tag">&#9986; recortar</div>
              <div class="card-header">
                <div class="brand">
                  <div class="brand-badge">TIC</div>
                  <div class="brand-title">MISSÃO TIC 6.º ANO</div>
                </div>
                <div class="turma-badge">${escapeHtml(card.turmaName)}</div>
              </div>

              <div class="card-body">
                <div class="info-col">
                  <div class="student-block">
                    <div class="field-label">${titleLabel}</div>
                    <div class="student-name">${displayName}</div>
                  </div>
                  <div class="creds-box">
                    <div class="cred-row">
                      <span class="cred-label">Utilizador:</span>
                      <span class="cred-user">${escapeHtml(card.username)}</span>
                    </div>
                    <div class="cred-row cred-row-sep">
                      <span class="cred-label">Palavra-passe:</span>
                      <span class="cred-pass">${escapeHtml(card.password)}</span>
                    </div>
                  </div>
                </div>

                <div class="qr-col">
                  <div class="qr-svg-wrap">${qrSvgMarkup}</div>
                  <div class="qr-caption">Lê o QR Code</div>
                </div>
              </div>

              <div class="card-footer">
                <span class="card-url">${escapeHtml(OFFICIAL_PLATFORM_URL)}</span>
                <span class="card-note">Guarda na tua caderneta!</span>
              </div>
            </div>
          `;
        })
        .join('');

      return `
        <section class="print-page" data-page="${pageIndex + 1}">
          ${cardsHtml}
        </section>
      `;
    })
    .join('');

  const toolbarHtml = includeToolbar
    ? `
      <div class="screen-toolbar">
        <div>
          <strong>Cartões de Acesso (A4) — ${escapeHtml(turmaLabel)}</strong>
          <span> · ${cards.length} ${cards.length === 1 ? 'cartão' : 'cartões'} (${pages.length} ${pages.length === 1 ? 'folha' : 'folhas'} A4)</span>
        </div>
        <button type="button" onclick="window.print()">Imprimir Folha A4</button>
      </div>
    `
    : '';

  return `<!doctype html>
<html lang="pt-PT">
<head>
  <meta charset="utf-8" />
  <title>Cartões de Acesso A4 — ${escapeHtml(turmaLabel)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .screen-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 20px;
      background: #0f172a;
      color: #ffffff;
      font-size: 13px;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .screen-toolbar button {
      background: #fbbf24;
      color: #0f172a;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
    }
    .print-page {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 5mm;
      width: 100%;
      max-width: 190mm;
      margin: 0 auto;
      padding: 4mm 0;
      break-after: page;
      page-break-after: always;
    }
    .print-page:last-child {
      break-after: auto;
      page-break-after: auto;
    }
    .card {
      position: relative;
      border: 1.5px dashed #64748b;
      border-radius: 12px;
      background: #ffffff;
      padding: 11px 12px 0 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      break-inside: avoid;
      page-break-inside: avoid;
      min-height: 60mm;
    }
    .cut-tag {
      position: absolute;
      top: 4px;
      right: 8px;
      font-size: 8px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: #94a3b8;
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 8px;
      padding-right: 42px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .brand-badge {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      background: #2563eb;
      color: #ffffff;
      font-weight: 900;
      font-size: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .brand-title {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.04em;
      color: #1e3a8a;
    }
    .turma-badge {
      padding: 2px 8px;
      border-radius: 6px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
      font-size: 10px;
      font-weight: 800;
      flex-shrink: 0;
    }
    .card-body {
      display: flex;
      align-items: stretch;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
    }
    .info-col {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .student-block {
      margin-bottom: 6px;
    }
    .field-label {
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
    }
    .student-name {
      font-size: 12.5px;
      font-weight: 900;
      color: #0f172a;
      line-height: 1.25;
      word-break: break-word;
      margin-top: 1px;
    }
    .creds-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 6px 8px;
    }
    .cred-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .cred-row-sep {
      margin-top: 4px;
      padding-top: 4px;
      border-top: 1px solid #e2e8f0;
    }
    .cred-label {
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #475569;
      flex-shrink: 0;
    }
    .cred-user {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      font-weight: 800;
      color: #1d4ed8;
      word-break: break-all;
      text-align: right;
    }
    .cred-pass {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      font-weight: 900;
      color: #065f46;
      background: #d1fae5;
      padding: 1px 6px;
      border-radius: 4px;
    }
    .qr-col {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 5px;
    }
    .qr-svg-wrap {
      width: 68px;
      height: 68px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-svg-wrap svg {
      width: 68px !important;
      height: 68px !important;
      display: block;
    }
    .qr-caption {
      font-size: 7.5px;
      font-weight: 800;
      text-transform: uppercase;
      color: #475569;
      margin-top: 3px;
      text-align: center;
    }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      background: #eff6ff;
      border-top: 1px solid #dbeafe;
      margin: 0 -12px;
      padding: 6px 12px;
    }
    .card-url {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 9.5px;
      font-weight: 800;
      color: #1e40af;
      word-break: break-all;
    }
    .card-note {
      font-size: 8.5px;
      font-weight: 700;
      color: #475569;
      flex-shrink: 0;
    }
    @media print {
      .screen-toolbar {
        display: none !important;
      }
      .print-page {
        max-width: none;
        padding: 0;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  ${toolbarHtml}
  ${pagesHtml}
</body>
</html>`;
};

export const LoginCardsModal: React.FC<LoginCardsModalProps> = ({
  isOpen,
  onClose,
  students = [],
  classes = [],
  initialClassId,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(initialClassId || 'all');
  const qrSourceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedClass(initialClassId || 'all');
      document.body.classList.add('printing-login-cards');
    } else {
      document.body.classList.remove('printing-login-cards');
    }
    return () => {
      document.body.classList.remove('printing-login-cards');
    };
  }, [isOpen, initialClassId]);

  const preparedCards = useMemo<PreparedCard[]>(() => {
    const selectedClassObj = classes.find((c) => c.id === selectedClass);

    const filtered = students.filter((s) => {
      if (selectedClass === 'all') return true;
      if (s.classId === selectedClass || s.turma === selectedClass) return true;
      if (selectedClassObj) {
        return s.turma === selectedClassObj.name || s.className === selectedClassObj.name;
      }
      return false;
    });

    filtered.sort((a, b) => {
      const classComp = (a.turma || a.className || '').localeCompare(b.turma || b.className || '', 'pt');
      if (classComp !== 0) return classComp;
      const numA = Number(a.studentNumber);
      const numB = Number(b.studentNumber);
      if (numA && numB && numA !== numB) return numA - numB;
      return (a.fullName || a.name || '').localeCompare(b.fullName || b.name || '', 'pt');
    });

    return filtered.map((student) => {
      const turmaName = student.turma || student.className || '6.º Ano';
      const callNum = student.studentNumber ? `N.º ${student.studentNumber}` : '';
      const fullName = student.fullName || student.name || 'Aluno';
      const shortName = extractShortName(fullName).displayName;
      const username = student.username || student.nickname || '—';
      const password = student.initialPassword || '••••••';

      return {
        id: student.id,
        turmaName,
        callNum,
        shortName,
        username,
        password,
      };
    });
  }, [students, classes, selectedClass]);

  const pages = useMemo(() => chunkArray(preparedCards, CARDS_PER_A4_PAGE), [preparedCards]);

  if (!isOpen) return null;

  const selectedClassLabel =
    selectedClass === 'all'
      ? 'Todas as Turmas'
      : `Turma ${classes.find((c) => c.id === selectedClass)?.name || selectedClass}`;

  const getQrSvgMarkup = (): string => {
    const svgEl = qrSourceRef.current?.querySelector('svg');
    if (!svgEl) return '';
    return new XMLSerializer().serializeToString(svgEl);
  };

  const handlePrint = () => {
    if (preparedCards.length === 0) return;

    const qrSvgMarkup = getQrSvgMarkup();
    const html = buildStandalonePrintHtml(preparedCards, qrSvgMarkup, selectedClassLabel, false);

    // Use a dedicated offscreen A4-sized iframe so print preview is 100% immune
    // to modal scroll containers, overflow clipping, or fixed overlays.
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    const iframeWin = iframe.contentWindow;

    if (!iframeDoc || !iframeWin) {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      window.print();
      return;
    }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    iframeWin.addEventListener('afterprint', cleanup);
    window.setTimeout(cleanup, 120000);

    requestAnimationFrame(() => {
      window.setTimeout(() => {
        try {
          iframeWin.focus();
          iframeWin.print();
        } catch {
          cleanup();
          window.print();
        }
      }, 120);
    });
  };

  const handleDownloadPrintableHtml = () => {
    if (preparedCards.length === 0) return;
    const qrSvgMarkup = getQrSvgMarkup();
    const html = buildStandalonePrintHtml(preparedCards, qrSvgMarkup, selectedClassLabel, true);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeSlug = selectedClassLabel
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    link.href = url;
    link.download = `cartoes_acesso_a4_${safeSlug || 'turmas'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const printPortal =
    typeof document !== 'undefined'
      ? createPortal(
          <div id="login-cards-print-portal" aria-hidden="true">
            {pages.map((pageCards, pageIdx) => (
              <div key={pageIdx} className="login-cards-print-page">
                {pageCards.map((card) => (
                  <div
                    key={card.id}
                    className="login-cards-print-card relative border-2 border-dashed border-slate-400 bg-white rounded-xl p-3 flex flex-col justify-between overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-black text-[9px] shrink-0">
                          TIC
                        </div>
                        <div className="text-[10px] font-black tracking-wider uppercase text-blue-900">
                          MISSÃO TIC 6.º ANO
                        </div>
                      </div>
                      <div className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 font-black text-[10px]">
                        {card.turmaName}
                      </div>
                    </div>

                    <div className="flex items-stretch justify-between gap-2.5 mb-2">
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="mb-1.5">
                          <div className="text-[8px] uppercase font-bold tracking-wider text-slate-500">
                            {card.callNum ? `${card.callNum} • Nome do Aluno` : 'Nome do Aluno'}
                          </div>
                          <div className="text-xs font-black text-slate-900 leading-snug break-words">
                            {card.callNum ? `${card.callNum} - ${card.shortName}` : card.shortName}
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[8px] uppercase font-bold text-slate-500">Utilizador:</span>
                            <span className="font-mono font-bold text-[11px] text-blue-700 break-all text-right">
                              {card.username}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200">
                            <span className="text-[8px] uppercase font-bold text-slate-500">Palavra-passe:</span>
                            <span className="font-mono font-black text-[11px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                              {card.password}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg p-1.5">
                        <QRCodeSVG
                          value={OFFICIAL_PLATFORM_URL}
                          size={68}
                          level="M"
                          bgColor="#ffffff"
                          fgColor="#0f172a"
                          includeMargin={false}
                        />
                        <span className="text-[7px] font-bold uppercase tracking-wider text-slate-500 mt-1">
                          Lê o QR Code
                        </span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-blue-100 flex items-center justify-between gap-1 bg-blue-50 -mx-3 -mb-3 px-3 py-1.5">
                      <span className="font-mono text-[9.5px] font-bold text-blue-800 break-all">
                        {OFFICIAL_PLATFORM_URL}
                      </span>
                      <span className="text-[8px] text-slate-600 font-semibold shrink-0">
                        Guarda na tua caderneta!
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {printPortal}

      {/* Hidden single QR source for clean SVG serialization into the A4 print iframe */}
      <div ref={qrSourceRef} className="sr-only" aria-hidden="true">
        <QRCodeSVG
          value={OFFICIAL_PLATFORM_URL}
          size={78}
          level="M"
          bgColor="#ffffff"
          fgColor="#0f172a"
          includeMargin={false}
        />
      </div>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden relative my-auto flex flex-col max-h-[94vh]">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-300 shrink-0" />
                <span>Cartões Individuais de Acesso (Login Cards)</span>
              </h2>
              <p className="text-xs text-blue-100 font-medium mt-0.5">
                Folha pronta a imprimir (formato A4 · 8 cartões por página) com QR Code de acesso direto e linhas tracejadas para recorte
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={preparedCards.length === 0}
                onClick={handleDownloadPrintableHtml}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                title="Descarregar ficheiro A4 pronto a abrir e imprimir em qualquer computador"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Guardar Folha A4</span>
              </button>
              <button
                type="button"
                disabled={preparedCards.length === 0}
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Cartões (A4)</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar janela de cartões"
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <label htmlFor="login-cards-class-select" className="text-xs font-bold text-slate-700">
                Filtrar por Turma:
              </label>
              <select
                id="login-cards-class-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Todas as Turmas ({students.length} cartões)</option>
                {classes.map((c) => {
                  const count = students.filter(
                    (s) => s.classId === c.id || s.turma === c.name || s.className === c.name
                  ).length;
                  return (
                    <option key={c.id} value={c.id}>
                      Turma {c.name} ({count} cartões)
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-mono font-bold text-[11px]">
                <QrCode className="w-3.5 h-3.5 text-blue-600" />
                <span>{OFFICIAL_PLATFORM_URL}</span>
              </span>
              <span className="font-mono tabular-nums">
                A mostrar <strong className="text-slate-800">{preparedCards.length}</strong> cartões ({pages.length}{' '}
                {pages.length === 1 ? 'folha' : 'folhas'} A4)
              </span>
            </div>
          </div>

          {/* Screen Preview Grid Area */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/50">
            {preparedCards.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="font-bold text-slate-700">Nenhum aluno encontrado para a turma selecionada.</p>
                <p className="text-xs text-slate-500 mt-1">
                  Usa o botão &quot;Importar Alunos&quot; para adicionar alunos ou seleciona outra turma.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {preparedCards.map((card) => (
                  <div
                    key={card.id}
                    className="relative border-2 border-dashed border-slate-300 bg-white rounded-2xl p-4 shadow-xs flex flex-col justify-between overflow-hidden"
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
                        {card.turmaName}
                      </div>
                    </div>

                    {/* Main Body: Student Credentials (Left) + QR Code (Right) */}
                    <div className="flex items-stretch justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        {/* Student Name */}
                        <div className="mb-2.5">
                          <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                            {card.callNum ? `${card.callNum} • Nome do Aluno` : 'Nome do Aluno'}
                          </div>
                          <div className="text-sm font-black text-slate-900 leading-snug break-words">
                            {card.callNum ? `${card.callNum} - ${card.shortName}` : card.shortName}
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
                              {card.username}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/70">
                            <div className="text-[9px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1 shrink-0">
                              <Key className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Palavra-passe:</span>
                            </div>
                            <div className="font-mono font-black text-xs text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                              {card.password}
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
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>
                Dica: Podes imprimir diretamente ou guardar a folha A4 em HTML para imprimir noutro computador.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                disabled={preparedCards.length === 0}
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Agora (A4)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
