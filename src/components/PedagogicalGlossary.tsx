import React, { useState } from 'react';
import { HelpCircle, X, Sparkles, BookOpen } from 'lucide-react';

export interface GlossaryDefinition {
  title: string;
  emoji: string;
  simpleDef: string;
  example: string;
  tip: string;
}

export const GLOSSARY_DICTIONARY: Record<string, GlossaryDefinition> = {
  algoritmo: {
    title: 'Algoritmo',
    emoji: '📐',
    simpleDef: 'Uma lista passo a passo de instruções exatas para resolver um problema ou realizar uma tarefa.',
    example: 'Uma receita de bolo ou o caminho do GPS: se faltar um passo, o bolo não cresce!',
    tip: 'Os computadores não adivinham nada; precisam de instruções claras numa ordem lógica.',
  },
  decomposição: {
    title: 'Decomposição',
    emoji: '🧩',
    simpleDef: 'A técnica de dividir um problema gigante ou difícil em pedaços mais pequenos e fáceis de resolver.',
    example: 'Para construir um castelo de LEGO, constróis primeiro as paredes, depois as torres e no fim o portão.',
    tip: 'Uma pizza inteira come-se fatia a fatia!',
  },
  phishing: {
    title: 'Phishing',
    emoji: '🎣',
    simpleDef: 'Uma armadilha digital criada por burlões que fingem ser bancos ou jogos para roubar senhas e dados.',
    example: 'Uma mensagem a dizer: "Ganhaste Robux grátis! Clica aqui e escreve a tua palavra-passe!".',
    tip: 'Desconfia sempre de ofertas boas demais e mensagens com urgência súbita.',
  },
  'pegada digital': {
    title: 'Pegada Digital',
    emoji: '👣',
    simpleDef: 'O rasto invisível de cliques, fotos, vídeos e comentários que deixas na Internet.',
    example: 'Fotos publicadas em redes sociais continuam guardadas mesmo depois de as apagares do teu telemóvel.',
    tip: 'Pensa se gostarias que a tua família ou futuros professores vissem o que estás a partilhar.',
  },
  'palavras-chave': {
    title: 'Palavras-Chave',
    emoji: '🔑',
    simpleDef: 'Os termos mais específicos e importantes sobre o tema que procuras num motor de busca.',
    example: 'Em vez de "animais que vão desaparecer", pesquisa "lince-ibérico perigo extinção Portugal".',
    tip: 'Palavras precisas trazem respostas confiáveis e evitam páginas de anúncios.',
  },
  'alucinação de IA': {
    title: 'Alucinação de IA',
    emoji: '🌀',
    simpleDef: 'Quando uma Inteligência Artificial inventa dados, datas ou factos falsos com um tom muito confiante.',
    example: 'O robô de IA dizer que D. Afonso Henriques tinha um telemóvel no século XII!',
    tip: 'Confirma sempre as respostas da IA em enciclopédias, manuais escolares ou sites fiáveis.',
  },
  'creative commons': {
    title: 'Creative Commons (CC)',
    emoji: '🎨',
    simpleDef: 'Licenças que os autores colocam nas suas músicas e fotos para permitir que outras pessoas as usem legalmente.',
    example: 'Uma imagem CC-BY que podes pôr no teu trabalho escolar desde que digas o nome de quem a tirou.',
    tip: 'Nem tudo o que está na Internet é grátis para copiar. Respeita sempre os criadores!',
  },
  plágio: {
    title: 'Plágio',
    emoji: '⚠️',
    simpleDef: 'Copiar o texto, imagem ou ideia de outra pessoa e fingir que foste tu que inventaste.',
    example: 'Fazer "Copiar e Colar" da Wikipédia para o trabalho de História sem pôr aspas nem a fonte.',
    tip: 'Usa as tuas próprias palavras e cita quem te inspirou!',
  },
  netiqueta: {
    title: 'Netiqueta',
    emoji: '🤝',
    simpleDef: 'As regras de boa educação, respeito e empatia para falar e conviver no mundo digital.',
    example: 'Não escrever em MAIÚSCULAS (porque parece que estás a gritar) e nunca partilhar prints privados.',
    tip: 'Do outro lado do ecrã está uma pessoa real com sentimentos reais.',
  },
  'dados pessoais': {
    title: 'Dados Pessoais',
    emoji: '🔒',
    simpleDef: 'Informações que revelam quem tu és ou onde estás (nome completo, morada, escola, telefone ou fotos íntimas).',
    example: 'A tua localização em tempo real no telemóvel ou o teu número de cidadão.',
    tip: 'Guarda os teus dados como se fossem o dinheiro da tua carteira.',
  },
  depuração: {
    title: 'Depuração (Debugging)',
    emoji: '🐞',
    simpleDef: 'O processo de caçar e corrigir erros ("bugs") num código ou algoritmo.',
    example: 'O robô virou para a esquerda em vez de ir em frente: verificamos a lista e corrigimos a instrução.',
    tip: 'Errar no código é normalíssimo! Os melhores programadores passam a vida a fazer depuração.',
  },
  loop: {
    title: 'Ciclo ou Repetição (Loop)',
    emoji: '🔁',
    simpleDef: 'Um comando que diz ao computador para repetir as mesmas instruções várias vezes automaticamente.',
    example: '"Repete 4 vezes: Avança 1 passo e Vira 90º à direita" (desenha um quadrado sem escrever 8 linhas!).',
    tip: 'Poupa tempo e linhas de código com ciclos inteligentes.',
  },
};

interface GlossaryTermProps {
  term: keyof typeof GLOSSARY_DICTIONARY | string;
  children?: React.ReactNode;
}

export const GlossaryTerm: React.FC<GlossaryTermProps> = ({ term, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const normalizedKey = term.toLowerCase().trim();
  const definition = GLOSSARY_DICTIONARY[normalizedKey];

  if (!definition) {
    return <span className="underline decoration-dotted decoration-blue-400">{children || term}</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50/90 hover:bg-blue-100/90 px-1.5 py-0.5 rounded-md underline decoration-dotted decoration-blue-500 hover:decoration-solid transition-colors cursor-pointer text-inherit"
        title={`Clica para ver o que significa "${definition.title}"`}
      >
        <span>{children || definition.title}</span>
        <span className="text-[10px] text-blue-500 font-extrabold bg-white rounded-full w-3.5 h-3.5 flex items-center justify-center border border-blue-300">
          ?
        </span>
      </button>

      {/* Floating Glossary Definition Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-3xl border-2 border-blue-300 max-w-sm w-full p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-2xl flex items-center justify-center shadow-xs">
                {definition.emoji}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
                  Glossário do 6.º Ano
                </span>
                <h4 className="text-lg font-black text-slate-900">{definition.title}</h4>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5">
                <span className="font-black text-blue-900 block mb-1">📖 O que significa?</span>
                <p className="leading-relaxed">{definition.simpleDef}</p>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5">
                <span className="font-black text-amber-900 block mb-1">🌟 Exemplo no teu dia a dia:</span>
                <p className="leading-relaxed">{definition.example}</p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3">
                <span className="font-black text-emerald-900 block text-[11px] mb-0.5">💡 Dica do Mestre:</span>
                <p className="text-[11px] text-emerald-950 font-medium">{definition.tip}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Percebido! Fechar Dica ✓
            </button>
          </div>
        </div>
      )}
    </>
  );
};
