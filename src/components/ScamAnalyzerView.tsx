import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookmarkPlus, Search } from 'lucide-react';
import type { AnalysisResult, ScamReport, ThemeMode, UserProfile } from '../types/scam';
import {
  analyzeMessage,
  MAX_MESSAGE_CHARS,
  QUICK_EXAMPLES,
  SCAM_CHANNELS,
  SCAM_TYPES,
} from '../utils/scamAnalyzer';

interface ScamAnalyzerViewProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  initialText?: string;
  userProfile: UserProfile | null;
  scamReports: ScamReport[];
  onSaveAnalyzedMessage: (report: Omit<ScamReport, 'id' | 'criadoEm'>) => void;
  onBackToStart: () => void;
}

const RISK_LABELS: Record<AnalysisResult['risk']['level'], string> = {
  high: 'Alto',
  medium: 'Moderado',
  low: 'Atenção',
  none: 'Baixo sinal detectado',
};

const COMMON_SCAMS = [
  {
    num: '01',
    title: 'Falsa central de atendimento',
    desc: 'Alguém afirma haver um problema na conta e pede para ligar para um número, instalar um aplicativo ou compartilhar dados.',
  },
  {
    num: '02',
    title: 'WhatsApp falso',
    desc: 'Um número novo usa a foto de alguém conhecido e pede dinheiro com urgência, alegando emergência ou problema no celular.',
  },
  {
    num: '03',
    title: 'Links e páginas falsas',
    desc: 'Uma mensagem pede para clicar em um link para atualizar cadastro, regularizar conta, rastrear entrega ou receber benefício.',
  },
  {
    num: '04',
    title: 'Prêmios e ofertas improváveis',
    desc: 'Prometem prêmio, emprego ou retorno fácil, muitas vezes exigindo taxa antecipada ou dados pessoais.',
  },
  {
    num: '05',
    title: 'Roubo de conta ou linha',
    desc: 'Pedem senha, código de autenticação ou dados que podem permitir a invasão de uma conta ou a tomada da linha telefônica.',
  },
  {
    num: '06',
    title: 'Falsificação de identidade',
    desc: 'O contato pode imitar o nome, o número ou a aparência de uma instituição legítima. O identificador, sozinho, não prova que é verdadeiro.',
  },
];

const SAFETY_STEPS = [
  {
    num: '1',
    title: 'Não clique nem responda.',
    desc: 'Não abra anexos, não instale aplicativos indicados pela mensagem e não compartilhe códigos de verificação.',
  },
  {
    num: '2',
    title: 'Confirme por outro canal.',
    desc: 'Abra o aplicativo oficial ou digite o endereço conhecido no navegador. Se for alguém conhecido, ligue para o número que você já tinha salvo.',
  },
  {
    num: '3',
    title: 'Não faça pagamentos sob pressão.',
    desc: 'Desconfie de taxas inesperadas, transferências urgentes e pedidos de dinheiro que não possam ser confirmados.',
  },
  {
    num: '4',
    title: 'Se já agiu, procure ajuda rapidamente.',
    desc: 'Contate seu banco ou serviço pelos canais oficiais, troque senhas afetadas, proteja suas contas e registre ocorrência se houver prejuízo.',
  },
];

export const ScamAnalyzerView: React.FC<ScamAnalyzerViewProps> = ({
  theme,
  onToggleTheme,
  initialText = '',
  userProfile,
  scamReports,
  onSaveAnalyzedMessage,
  onBackToStart,
}) => {
  const [messageText, setMessageText] = useState(initialText);
  const [result, setResult] = useState<AnalysisResult | null>(() =>
    initialText.trim() ? analyzeMessage(initialText.trim()) : null
  );
  const [emptyError, setEmptyError] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialText.trim()) {
      setMessageText(initialText);
      setResult(analyzeMessage(initialText.trim()));
      setEmptyError(false);
      setSavedNotice(null);
    }
  }, [initialText]);

  const handleAnalyze = () => {
    const trimmed = messageText.trim();
    setSavedNotice(null);
    if (!trimmed) {
      setResult(null);
      setEmptyError(true);
      textareaRef.current?.focus();
      return;
    }
    setEmptyError(false);
    setResult(analyzeMessage(trimmed));
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const handleSaveFromAnalyzer = () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    const topSignal = result?.matchedRules[0]?.title;
    onSaveAnalyzedMessage({
      nome: userProfile?.nome || 'Visitante',
      email: userProfile?.email || 'Não informado',
      telefone: userProfile?.telefone || '',
      persona: userProfile?.persona || 'cliente',
      tipoGolpe: topSignal ? `Suspeita: ${topSignal}` : SCAM_TYPES[6],
      canal: SCAM_CHANNELS[0],
      dataOcorrencia: new Date().toISOString().slice(0, 10),
      impacto: 'Mensagem salva a partir do analisador Golpe 3.0',
      valorPrejuizo: '',
      relato: trimmed,
    });
    setSavedNotice('Mensagem salva nos seus registros locais com sucesso.');
  };

  const barColor =
    result?.risk.level === 'high'
      ? 'var(--danger)'
      : result?.risk.level === 'medium'
        ? 'var(--warning)'
        : result?.risk.level === 'low'
          ? 'var(--link)'
          : 'var(--good)';

  return (
    <div id="analisador">
      {/* Hero + Analyzer Panel */}
      <section className="mx-auto max-w-[1060px] px-5 pt-10 pb-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToStart}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-xs font-bold text-[var(--ink)] hover:border-[var(--accent)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Voltar para a tela inicial e registros
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-pressed={theme === 'light'}
            className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-xs font-bold text-[var(--ink)] hover:border-[var(--accent)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {theme === 'dark' ? '☀ Tema claro' : '☾ Tema escuro'}
          </button>
        </div>

        <p className="text-xs font-bold tracking-[0.14em] text-[var(--accent)]">
          FERRAMENTA DE PREVENÇÃO DIGITAL
        </p>

        <h1 className="mt-2 max-w-[820px] font-display text-[clamp(2.2rem,5.5vw,4rem)] font-extrabold leading-[1.04] tracking-tight text-[var(--ink)]">
          Essa mensagem é confiável <span className="text-[var(--accent)]">mesmo?</span>
        </h1>

        <p className="mt-3 max-w-[700px] text-lg text-[var(--soft)]">
          Cole o texto que você recebeu. Vamos procurar sinais de fraude, tentativas de pressão,
          pedidos suspeitos e padrões comuns de golpes digitais.
        </p>

        {/* Analyzer Card */}
        <div className="mt-8 rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-5 md:p-8">
          <label htmlFor="msg" className="mb-2.5 block text-sm font-bold text-[var(--ink)]">
            Mensagem recebida
          </label>

          <textarea
            ref={textareaRef}
            id="msg"
            rows={7}
            maxLength={MAX_MESSAGE_CHARS}
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              if (emptyError) setEmptyError(false);
            }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleAnalyze();
              }
            }}
            placeholder="Cole aqui a mensagem, SMS, e-mail ou conversa suspeita..."
            spellCheck={false}
            className="min-h-[170px] w-full resize-y rounded-[14px] border border-[var(--line)] bg-[var(--bg)] p-4 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          />

          <div className="mt-2 flex flex-wrap justify-between gap-3 text-xs text-[var(--soft)]">
            <span>Faça a análise sem clicar em links nem responder à mensagem.</span>
            <span className="tabular-nums">
              {messageText.length.toLocaleString('pt-BR')} /{' '}
              {MAX_MESSAGE_CHARS.toLocaleString('pt-BR')}
            </span>
          </div>

          {/* Examples & Saved Reports */}
          <div className="my-5 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-full text-xs font-semibold text-[var(--soft)]">
                Testar um exemplo:
              </span>
              {QUICK_EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => {
                    setMessageText(example.text);
                    setEmptyError(false);
                    setSavedNotice(null);
                    textareaRef.current?.focus();
                  }}
                  className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] hover:border-[var(--accent)] transition-colors whitespace-nowrap cursor-pointer"
                >
                  {example.label}
                </button>
              ))}
            </div>

            {scamReports.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-full text-xs font-semibold text-[var(--soft)]">
                  Carregar de seus registros salvos:
                </span>
                {scamReports.slice(0, 4).map((rep) => (
                  <button
                    key={rep.id}
                    type="button"
                    onClick={() => {
                      setMessageText(rep.relato);
                      setResult(analyzeMessage(rep.relato));
                      setEmptyError(false);
                      setSavedNotice(null);
                    }}
                    className="max-w-[240px] truncate rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--link)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                  >
                    {rep.tipoGolpe}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            className="flex w-full items-center justify-center gap-2.5 rounded-[13px] bg-[var(--accent)] px-5 py-3.5 text-base font-bold text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Analisar mensagem
          </button>

          <p className="mt-3.5 text-center text-xs text-[var(--soft)]">
            Esta versão analisa o texto localmente no seu navegador. Não envie senhas, códigos ou
            dados pessoais.
          </p>
        </div>

        {/* Empty Error */}
        {emptyError && (
          <div
            role="alert"
            className="mt-5 rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-5"
          >
            <p className="rounded-xl bg-[var(--surface-2)] p-4 text-sm font-semibold text-[var(--ink)]">
              Cole uma mensagem antes de analisar.
            </p>
          </div>
        )}

        {/* Analysis Results */}
        {result && (
          <div
            ref={resultsRef}
            aria-live="polite"
            className="mt-5 rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-5 md:p-8"
          >
            <div className="flex items-start gap-3.5">
              <div
                aria-hidden="true"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-[var(--surface-2)] text-xl font-bold text-[var(--ink)]"
              >
                {result.risk.icon}
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold leading-snug text-[var(--ink)]">
                  {result.risk.title}
                </h2>
                <p className="mt-1 text-sm text-[var(--soft)]">{result.risk.subtitle}</p>
              </div>
            </div>

            <div
              role="img"
              aria-label={`Indicador heurístico de sinais de risco: ${result.risk.score} de 100`}
              className="mt-5 mb-2 h-2.5 overflow-hidden rounded-full bg-[var(--surface-2)]"
            >
              <span
                className="block h-full rounded-full transition-all duration-300"
                style={{ width: `${result.risk.score}%`, backgroundColor: barColor }}
              />
            </div>

            <div className="flex justify-between text-xs text-[var(--soft)]">
              <span>Indicador de sinais detectados</span>
              <strong className="text-[var(--ink)]">{RISK_LABELS[result.risk.level]}</strong>
            </div>

            <div className="my-5 whitespace-pre-wrap break-words rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 text-sm text-[var(--ink)]">
              {result.segments.map((seg, idx) =>
                seg.highlighted ? <mark key={idx}>{seg.text}</mark> : <span key={idx}>{seg.text}</span>
              )}
            </div>

            {result.matchedRules.length > 0 ? (
              <div>
                <h3 className="font-display text-base font-bold text-[var(--ink)] tabular-nums">
                  Sinais encontrados ({result.matchedRules.length})
                </h3>
                <ul className="mt-3 grid gap-3">
                  {result.matchedRules.map((rule) => (
                    <li
                      key={rule.id}
                      className="rounded-xl border border-[var(--line)] bg-[var(--bg)]/50 px-4 py-3"
                    >
                      <strong className="block text-sm text-[var(--ink)]">{rule.title}</strong>
                      <p className="mt-1 text-sm text-[var(--soft)]">{rule.explanation}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-xl bg-[var(--surface-2)] p-4 text-sm">
                <strong className="block text-[var(--ink)]">
                  Nenhum sinal das regras atuais apareceu.
                </strong>
                <p className="mt-1 text-[var(--soft)]">
                  Isso não confirma a autenticidade da mensagem.
                </p>
              </div>
            )}

            <div className="mt-5 rounded-xl border border-[var(--warning)]/40 bg-[var(--surface-2)] p-4 text-sm text-[var(--ink)]">
              <strong className="mb-1 block font-display text-sm text-[var(--warning)]">
                O que recomendamos
              </strong>
              {result.advice}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
              <button
                type="button"
                onClick={handleSaveFromAnalyzer}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-4 py-2 text-xs font-bold text-[var(--ink)] hover:border-[var(--accent)] transition-colors whitespace-nowrap cursor-pointer"
              >
                <BookmarkPlus className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                Salvar esta mensagem nos meus registros
              </button>

              {savedNotice && (
                <span role="status" className="text-xs font-bold text-[var(--good)]">
                  ✓ {savedNotice}
                </span>
              )}
            </div>

            <p className="mt-4 text-xs text-[var(--soft)]">
              <strong className="text-[var(--ink)]">Importante:</strong> o indicador é uma estimativa
              baseada em padrões de texto, não uma probabilidade estatística nem uma confirmação de
              crime. A ferramenta não consulta bancos de dados de denúncias nem verifica a
              identidade real do remetente.
            </p>
          </div>
        )}
      </section>

      {/* Common Scam Patterns */}
      <section id="golpes" className="border-t border-[var(--line)] py-14">
        <div className="mx-auto max-w-[1060px] px-5">
          <p className="text-xs font-bold tracking-[0.14em] text-[var(--accent)]">FIQUE ATENTO</p>
          <h2 className="mt-2 font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--ink)]">
            Padrões comuns de golpes digitais
          </h2>
          <p className="mt-2 max-w-[680px] text-sm md:text-base text-[var(--soft)]">
            Golpistas podem se passar por bancos, empresas, órgãos públicos, conhecidos ou serviços
            de entrega. Veja os padrões que a ferramenta procura.
          </p>

          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
            {COMMON_SCAMS.map((scam) => (
              <article
                key={scam.num}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"
              >
                <span className="text-xs font-bold tracking-widest text-[var(--accent)] tabular-nums">
                  {scam.num}
                </span>
                <h3 className="mt-2 font-display text-base font-bold text-[var(--ink)]">
                  {scam.title}
                </h3>
                <p className="mt-1.5 text-sm text-[var(--soft)]">{scam.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How to Protect Yourself */}
      <section id="proteja-se" className="border-t border-[var(--line)] py-14">
        <div className="mx-auto max-w-[1060px] px-5">
          <p className="text-xs font-bold tracking-[0.14em] text-[var(--accent)]">
            PARE, CONFIRA, SÓ ENTÃO AJA
          </p>
          <h2 className="mt-2 font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--ink)]">
            O que fazer se a mensagem parecer suspeita
          </h2>

          <ol className="mt-7 grid max-w-[820px] gap-5">
            {SAFETY_STEPS.map((step) => (
              <li key={step.num} className="flex items-start gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[var(--accent)] text-sm font-bold text-[var(--accent-ink)] tabular-nums">
                  {step.num}
                </span>
                <div>
                  <strong className="block text-base text-[var(--ink)]">{step.title}</strong>
                  <p className="mt-1 text-sm text-[var(--soft)]">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-9 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
            <h3 className="font-display text-base font-bold text-[var(--ink)]">
              Fontes para se informar
            </h3>
            <p className="mt-2 text-sm text-[var(--soft)]">
              As orientações gerais desta página foram inspiradas em materiais de prevenção a
              fraudes. Consulte as fontes oficiais para informações completas e atualizadas:
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href="https://www.gov.br/anatel/pt-br/assuntos/dicas-contra-fraudes/golpes-atuais-mais-comuns"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--link)] hover:underline break-words"
                >
                  Anatel — Golpes atuais mais comuns
                </a>
              </li>
              <li>
                <a
                  href="https://bbprevidencia.com.br/seguranca/artigo/os-golpes-digitais-mais-praticados-em-2026-e-como-se-proteger-de-cada-um"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--link)] hover:underline break-words"
                >
                  BB Previdência — Golpes digitais mais praticados em 2026
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
