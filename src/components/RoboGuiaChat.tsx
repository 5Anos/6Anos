import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Lightbulb,
  HelpCircle,
  BookOpen,
  RotateCcw,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { apiRequest } from '../api';
import {
  SimulatorMistakeEvent,
  subscribeSimulatorMistake,
} from '../lib/simulatorHints';

interface ChatMessage {
  id: string;
  role: 'tutor' | 'student' | 'error';
  text: string;
  simulatorTitle?: string;
  timestamp: number;
}

interface RoboGuiaChatProps {
  visible?: boolean;
}

const QUICK_PROMPTS = [
  { label: 'Outra pista', icon: Lightbulb, text: 'Podes dar-me outra pista sem dizer a resposta?' },
  { label: 'O que observar?', icon: HelpCircle, text: 'O que devo observar com mais atenção para acertar?' },
  { label: 'Explica o tema', icon: BookOpen, text: 'Podes explicar-me este tema de forma simples?' },
];

export const RoboGuiaChat: React.FC<RoboGuiaChatProps> = ({ visible = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeContext, setActiveContext] = useState<SimulatorMistakeEvent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'tutor',
      text: 'Olá! Eu sou o Robo-Guia 🤖. Sempre que precisares de ajuda numa missão, estou aqui para te dar pistas — sem estragar a descoberta!',
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedPayload, setLastFailedPayload] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const requestHint = async (payload: {
    simulatorId: string;
    simulatorTitle: string;
    worldId: number;
    topic: string;
    score?: number;
    attemptSummary?: string;
    userMessage?: string;
    history: { role: 'student' | 'tutor'; text: string }[];
  }) => {
    setIsLoading(true);
    setLastFailedPayload(null);
    try {
      const res = await apiRequest<{ hint: string }>('/api/ai/simulator-hint', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const replyText = res?.hint?.trim();
      if (!replyText) {
        throw new Error('Não foi possível obter uma dica neste momento.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `tutor-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role: 'tutor',
          text: replyText,
          simulatorTitle: payload.simulatorTitle,
          timestamp: Date.now(),
        },
      ]);
    } catch (err: any) {
      setLastFailedPayload(payload);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'error',
          text:
            err?.message ||
            'Não foi possível contactar o Robo-Guia neste momento. Tenta novamente!',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to simulator mistakes across all 5 Worlds & SimulatorsView
  useEffect(() => {
    const unsubscribe = subscribeSimulatorMistake((event) => {
      setActiveContext(event);
      setIsOpen(true);
      setUnreadCount(0);

      const historySnapshot: { role: 'student' | 'tutor'; text: string }[] = [];

      requestHint({
        simulatorId: event.simulatorId,
        simulatorTitle: event.simulatorTitle,
        worldId: event.worldId,
        topic: event.topic,
        score: event.score,
        attemptSummary: event.attemptSummary,
        history: historySnapshot,
      });
    });

    return unsubscribe;
  }, []);

  if (!visible) return null;

  const handleSendMessage = async (customText?: string) => {
    const text = (customText ?? inputValue).trim();
    if (!text || isLoading) return;

    if (!customText) {
      setInputValue('');
    }

    const studentMsg: ChatMessage = {
      id: `student-${Date.now()}`,
      role: 'student',
      text,
      timestamp: Date.now(),
    };

    const nextHistory = [...messages, studentMsg]
      .filter((m) => m.role === 'student' || m.role === 'tutor')
      .slice(-6)
      .map((m) => ({
        role: m.role as 'student' | 'tutor',
        text: m.text,
      }));

    setMessages((prev) => [...prev, studentMsg]);

    await requestHint({
      simulatorId: activeContext?.simulatorId || 'geral',
      simulatorTitle: activeContext?.simulatorTitle || 'Missão TIC 6.º Ano',
      worldId: activeContext?.worldId || 1,
      topic: activeContext?.topic || 'Cidadania digital, segurança, pesquisa, criação, algoritmos e IA',
      score: activeContext?.score,
      attemptSummary: activeContext?.attemptSummary,
      userMessage: text,
      history: nextHistory,
    });
  };

  const handleRetry = () => {
    if (!lastFailedPayload || isLoading) return;
    setMessages((prev) => prev.filter((m) => m.role !== 'error'));
    requestHint(lastFailedPayload);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end">
      {/* Chat Drawer */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-[370px] max-h-[75vh] bg-white rounded-3xl border border-indigo-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black tracking-tight truncate">Robo-Guia</h3>
                  <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full">
                    Dicas
                  </span>
                </div>
                <p className="text-[11px] text-blue-100 truncate">
                  {activeContext
                    ? `A ajudar em: ${activeContext.simulatorTitle}`
                    : 'Ajuda sem entregar a resposta'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar chat do Robo-Guia"
              className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Active Simulator Context Strip */}
          {activeContext && (
            <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between gap-2 text-[11px]">
              <span className="font-bold text-indigo-900 truncate flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Mundo {activeContext.worldId} • {activeContext.simulatorTitle}</span>
              </span>
              <span className="font-black text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200 shrink-0">
                Pista ativa
              </span>
            </div>
          )}

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70 min-h-[220px] max-h-[340px]">
            {messages.map((msg) => {
              if (msg.role === 'error') {
                return (
                  <div
                    key={msg.id}
                    className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2"
                  >
                    <div className="flex items-start gap-2 font-semibold">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{msg.text}</span>
                    </div>
                    {lastFailedPayload && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="inline-flex items-center gap-1.5 text-[11px] font-black text-rose-700 bg-white border border-rose-200 px-3 py-1 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Tentar novamente</span>
                      </button>
                    )}
                  </div>
                );
              }

              const isStudent = msg.role === 'student';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isStudent ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                      isStudent
                        ? 'bg-indigo-600 text-white rounded-br-md font-semibold'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md font-medium'
                    }`}
                  >
                    {!isStudent && msg.simulatorTitle && (
                      <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 mb-1 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        <span>Dica • {msg.simulatorTitle}</span>
                      </div>
                    )}
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-indigo-100 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-xs text-indigo-700 font-semibold flex items-center gap-2 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                  <span>O Robo-Guia está a preparar uma pista para ti...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((qp) => {
              const Icon = qp.icon;
              return (
                <button
                  key={qp.label}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSendMessage(qp.text)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Icon className="w-3 h-3" />
                  <span>{qp.label}</span>
                </button>
              );
            })}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder="Escreve a tua dúvida ao Robo-Guia..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              aria-label="Enviar mensagem"
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setUnreadCount(0);
        }}
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
      >
        <div className="relative">
          {isOpen ? (
            <MessageCircle className="w-5 h-5" />
          ) : (
            <Bot className="w-5 h-5" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <span>{isOpen ? 'Ocultar Robo-Guia' : 'Dicas do Robo-Guia'}</span>
      </button>
    </div>
  );
};
