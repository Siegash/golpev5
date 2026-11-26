import React, { useEffect, useRef, useState } from 'react';
import { Download, Search, ShieldCheck, Trash2, Upload } from 'lucide-react';
import type { ScamReport, ThemeMode, UserPersona, UserProfile } from '../types/scam';
import { IMPACT_OPTIONS, SCAM_CHANNELS, SCAM_TYPES } from '../utils/scamAnalyzer';
import { buildExportPayload, parseImportedPayload } from '../utils/storage';

interface StartTemplateViewProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  userProfile: UserProfile | null;
  scamReports: ScamReport[];
  onSaveEntry: (profile: UserProfile, report: Omit<ScamReport, 'id' | 'criadoEm'>) => ScamReport;
  onUpdateProfileOnly: (profile: UserProfile) => void;
  onDeleteReport: (id: string) => void;
  onClearAll: () => void;
  onImportData: (profile: UserProfile | null, reports: ScamReport[]) => void;
  onAnalyzeText: (text: string) => void;
  onGoToAnalyzer: () => void;
}

const PERSONA_LABELS: Record<UserPersona, string> = {
  estudante: 'Estudante',
  cliente: 'Cliente / Consumidor',
  familiar: 'Familiar / Pessoa idosa',
  empresa: 'Empresa / Profissional',
};

export const StartTemplateView: React.FC<StartTemplateViewProps> = ({
  theme,
  onToggleTheme,
  userProfile,
  scamReports,
  onSaveEntry,
  onUpdateProfileOnly,
  onDeleteReport,
  onClearAll,
  onImportData,
  onAnalyzeText,
  onGoToAnalyzer,
}) => {
  const [nome, setNome] = useState(userProfile?.nome ?? '');
  const [email, setEmail] = useState(userProfile?.email ?? '');
  const [telefone, setTelefone] = useState(userProfile?.telefone ?? '');
  const [cidade, setCidade] = useState(userProfile?.cidade ?? '');
  const [persona, setPersona] = useState<UserPersona>(userProfile?.persona ?? 'cliente');

  const [tipoGolpe, setTipoGolpe] = useState<string>(SCAM_TYPES[0]);
  const [canal, setCanal] = useState<string>(SCAM_CHANNELS[0]);
  const [dataOcorrencia, setDataOcorrencia] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [impacto, setImpacto] = useState<string>(IMPACT_OPTIONS[0]);
  const [valorPrejuizo, setValorPrejuizo] = useState('');
  const [relato, setRelato] = useState('');

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastSavedRelato, setLastSavedRelato] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (userProfile) {
      setNome((prev) => prev || userProfile.nome);
      setEmail((prev) => prev || userProfile.email);
      setTelefone((prev) => prev || userProfile.telefone);
      setCidade((prev) => prev || userProfile.cidade);
      setPersona(userProfile.persona);
    }
  }, [userProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setStatusMessage(null);

    const trimmedNome = nome.trim();
    const trimmedEmail = email.trim();
    const trimmedRelato = relato.trim();

    if (!trimmedNome || !trimmedEmail) {
      setFormError('Informe seu nome e um e-mail válido para salvar seus dados.');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setFormError('Digite um endereço de e-mail válido.');
      return;
    }

    const nextProfile: UserProfile = {
      nome: trimmedNome,
      email: trimmedEmail,
      telefone: telefone.trim(),
      cidade: cidade.trim(),
      persona,
      updatedAt: new Date().toISOString(),
    };

    if (!trimmedRelato) {
      onUpdateProfileOnly(nextProfile);
      setStatusMessage('Seus dados pessoais foram salvos no armazenamento local do navegador.');
      setLastSavedRelato(null);
      return;
    }

    const saved = onSaveEntry(nextProfile, {
      nome: trimmedNome,
      email: trimmedEmail,
      telefone: telefone.trim(),
      persona,
      tipoGolpe,
      canal,
      dataOcorrencia,
      impacto,
      valorPrejuizo: valorPrejuizo.trim(),
      relato: trimmedRelato,
    });

    setStatusMessage('Informações pessoais e relato do golpe salvos no localStorage.');
    setLastSavedRelato(saved.relato);
    setRelato('');
    setValorPrejuizo('');
  };

  const handleExportJson = () => {
    const payload = buildExportPayload(userProfile, scamReports);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `registros-golpe-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = parseImportedPayload(String(reader.result || ''));
        onImportData(result.profile, result.reports);
        setStatusMessage(
          `Importação concluída: ${result.reports.length} registro(s) carregado(s) para o navegador.`
        );
        setFormError(null);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Erro ao ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        id="inicio"
        className="border-b border-[var(--line)] bg-[var(--surface-2)]/50 py-14 md:py-20"
      >
        <div className="mx-auto max-w-[1120px] px-5">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs font-bold tracking-[0.14em] text-[var(--accent)]">
              PREVENÇÃO DIGITAL E REGISTRO LOCAL
            </p>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-pressed={theme === 'light'}
              className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-xs font-bold text-[var(--ink)] hover:border-[var(--accent)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {theme === 'dark' ? '☀ Tema claro' : '☾ Tema escuro'}
            </button>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
            <div className="flex flex-col justify-center lg:col-span-7">
              <h1 className="font-display text-[clamp(2.1rem,4.5vw,3.4rem)] font-extrabold leading-[1.08] tracking-tight text-[var(--ink)]">
                Registre o golpe que aconteceu e verifique mensagens suspeitas
              </h1>
              <p className="mt-4 max-w-2xl text-base md:text-lg text-[var(--soft)]">
                Nesta tela inicial você informa seus dados e documenta o golpe que sofreu ou
                recebeu. Tudo fica salvo apenas no seu navegador para consulta rápida e análise
                imediata.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#cadastro"
                  className="rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] transition-colors whitespace-nowrap shrink-0"
                >
                  Registrar informações →
                </a>
                <button
                  type="button"
                  onClick={onGoToAnalyzer}
                  className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-5 py-3 text-sm font-bold text-[var(--ink)] hover:border-[var(--accent)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Ir para o Analisador
                </button>
              </div>
            </div>

            <aside className="flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 lg:col-span-5">
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--ink)]">
                  Por que registrar nesta página?
                </h2>
                <ul className="mt-4 space-y-3 text-sm text-[var(--soft)]">
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-[var(--good)]" aria-hidden="true">
                      ✓
                    </span>
                    <span>
                      Organize data, canal, tipo de abordagem e relato completo antes de registrar
                      boletim de ocorrência.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-[var(--good)]" aria-hidden="true">
                      ✓
                    </span>
                    <span>
                      Seus dados e ocorrências ficam salvos exclusivamente no{' '}
                      <strong className="text-[var(--ink)]">localStorage</strong> do seu aparelho.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-[var(--good)]" aria-hidden="true">
                      ✓
                    </span>
                    <span>
                      Envie qualquer relato salvo diretamente para o analisador{' '}
                      <strong className="text-[var(--ink)]">Isso é golpe?</strong> com um clique.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 border-t border-[var(--line)] pt-4 text-xs text-[var(--soft)] tabular-nums">
                {scamReports.length === 0
                  ? 'Nenhum golpe registrado neste navegador ainda.'
                  : `${scamReports.length} registro(s) salvo(s) localmente`}
                {userProfile ? ` · Cadastro ativo de ${userProfile.nome}` : ''}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Destaques Section */}
      <section id="destaques" className="border-b border-[var(--line)] py-14">
        <div className="mx-auto max-w-[1120px] px-5">
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--ink)]">
            O que você faz por aqui
          </h2>
          <p className="mt-2 max-w-2xl text-[var(--soft)]">
            Fluxo pensado para documentar ocorrências com clareza e identificar sinais de fraude em
            mensagens recebidas.
          </p>

          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
            <article className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6">
              <p className="text-xs font-bold tracking-wider text-[var(--accent)]">01</p>
              <h3 className="mt-2 font-display text-lg font-bold text-[var(--ink)]">
                Cadastro no navegador
              </h3>
              <p className="mt-2 text-sm text-[var(--soft)]">
                Preencha seus dados básicos uma única vez para manter seus registros organizados sem
                precisar criar conta ou enviar dados para servidores externos.
              </p>
            </article>

            <article className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6">
              <p className="text-xs font-bold tracking-wider text-[var(--accent)]">02</p>
              <h3 className="mt-2 font-display text-lg font-bold text-[var(--ink)]">
                Histórico do golpe sofrido
              </h3>
              <p className="mt-2 text-sm text-[var(--soft)]">
                Salve qual foi o tipo de golpe, o canal utilizado, se houve prejuízo ou envio de
                senhas e o texto completo da conversa ou abordagem.
              </p>
            </article>

            <article className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6">
              <p className="text-xs font-bold tracking-wider text-[var(--accent)]">03</p>
              <h3 className="mt-2 font-display text-lg font-bold text-[var(--ink)]">
                Análise heurística local
              </h3>
              <p className="mt-2 text-sm text-[var(--soft)]">
                Compare a mensagem recebida com padrões conhecidos de phishing, falso suporte,
                pedido urgente de Pix e roubo de códigos de autenticação.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Guia rápido Section */}
      <section id="guia" className="border-b border-[var(--line)] bg-[var(--surface-2)]/40 py-14">
        <div className="mx-auto max-w-[1120px] px-5">
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--ink)]">
              Como funciona na prática?
            </h2>
            <p className="mt-3 text-[var(--soft)]">
              Esta ferramenta reúne o registro pessoal da ocorrência e o verificador preventivo de
              mensagens em um fluxo contínuo.
            </p>

            <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-display text-base font-bold text-[var(--ink)]">
                  1. Quem deve preencher o formulário?
                </h3>
                <p className="mt-1.5 text-sm text-[var(--soft)]">
                  Qualquer pessoa que tenha caído em um golpe digital, sofrido uma tentativa recente
                  ou queira ajudar um familiar a documentar o ocorrido antes de procurar o banco ou
                  a delegacia.
                </p>
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[var(--ink)]">
                  2. Onde os dados ficam guardados?
                </h3>
                <p className="mt-1.5 text-sm text-[var(--soft)]">
                  Todas as informações ficam armazenadas localmente via{' '}
                  <strong className="text-[var(--ink)]">localStorage</strong>. Você pode exportar
                  seus registros em JSON para guardar uma cópia ou importar novamente quando precisar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulário de Cadastro e Registro do Golpe */}
      <section id="cadastro" className="border-b border-[var(--line)] py-14">
        <div className="mx-auto max-w-[1120px] px-5">
          <div className="mx-auto max-w-2xl rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold text-[var(--ink)]">
              Suas informações e registro do golpe
            </h2>
            <p className="mt-1.5 text-sm text-[var(--soft)]">
              Preencha seus dados e conte sobre o golpe em que você caiu ou que tentaram aplicar. As
              informações serão salvas no armazenamento local do navegador.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
              <fieldset className="space-y-4">
                <legend className="text-xs font-bold tracking-wider text-[var(--accent)]">
                  SEUS DADOS PESSOAIS
                </legend>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="nome"
                      className="mb-1.5 block text-xs font-bold text-[var(--ink)]"
                    >
                      Nome completo *
                    </label>
                    <input
                      id="nome"
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-bold text-[var(--ink)]"
                    >
                      E-mail *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="voce@email.com"
                      className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="telefone"
                      className="mb-1.5 block text-xs font-bold text-[var(--ink)]"
                    >
                      Telefone / WhatsApp
                    </label>
                    <input
                      id="telefone"
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cidade"
                      className="mb-1.5 block text-xs font-bold text-[var(--ink)]"
                    >
                      Cidade / UF
                    </label>
                    <input
                      id="cidade"
                      type="text"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="Ex: Belo Horizonte / MG"
                      className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="persona"
                      className="mb-1.5 block text-xs font-bold text-[var(--ink)]"
                    >
                      Perfil
                    </label>
                    <select
                      id="persona"
                      value={persona}
                      onChange={(e) => setPersona(e.target.value as UserPersona)}
                      className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                    >
                      <option value="cliente">Cliente / Consumidor</option>
                      <option value="estudante">Estudante</option>
                      <option value="familiar">Familiar / Pessoa idosa</option>
                      <option value="empresa">Empresa / Profissional</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              <div className="border-t border-[var(--line)] pt-5">
                <fieldset className="space-y-4">
                  <legend className="text-xs font-bold tracking-wider text-[var(--accent)]">
                    SOBRE O GOLPE QUE VOCÊ SOFREU (OU TENTATIVA)
                  </legend>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="tipoGolpe"
                        className="mb-1.5 block text-xs font-bold text-[var(--ink)]"
                      >
                        Tipo de golpe
                      </label>
                      <select
                        id="tipoGolpe"
                        value={tipoGolpe}
                        onChange={(e) => setTipoGolpe(e.target.value)}
                        className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                      >
                        {SCAM_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="canal"
                        className="mb-1.5 block text-xs font-bold text-[var(--ink)]"
                      >
                        Canal usado pelo golpista
                      </label>
                      <select
                        id="canal"
                        value={canal}
                        onChange={(e) => setCanal(e.target.value)}
                        className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                      >
                        {SCAM_CHANNELS.map((ch) => (
                          <option key={ch} value={ch}>
                            {ch}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label
                        htmlFor="dataOcorrencia"
                        className="mb-1.5 block text-xs font-bold text-[var(--ink)]"
                      >
                        Data aproximada
                      </label>
                      <input
                        id="dataOcorrencia"
                        type="date"
                        value={dataOcorrencia}
                        onChange={(e) => setDataOcorrencia(e.target.value)}
                        className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="impacto"
                        className="mb-1.5 block text-xs font-bold text-[var(--ink)]"
                      >
                        O que aconteceu?
                      </label>
                      <select
                        id="impacto"
                        value={impacto}
                        onChange={(e) => setImpacto(e.target.value)}
                        className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                      >
                        {IMPACT_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="valorPrejuizo"
                      className="mb-1.5 block text-xs font-bold text-[var(--ink)]"
                    >
                      Valor envolvido (opcional)
                    </label>
                    <input
                      id="valorPrejuizo"
                      type="text"
                      value={valorPrejuizo}
                      onChange={(e) => setValorPrejuizo(e.target.value)}
                      placeholder="Ex: R$ 450,00 ou Não houve valor"
                      className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="relato"
                      className="mb-1.5 block text-xs font-bold text-[var(--ink)]"
                    >
                      Relato do golpe ou mensagem recebida
                    </label>
                    <textarea
                      id="relato"
                      rows={4}
                      value={relato}
                      onChange={(e) => setRelato(e.target.value)}
                      placeholder="Descreva como o golpe aconteceu ou cole aqui a mensagem que o golpista enviou..."
                      className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                    />
                    <p className="mt-1 text-xs text-[var(--soft)]">
                      Dica: se você colar o texto exato da mensagem, poderá analisá-lo no Golpe 3.0
                      em seguida.
                    </p>
                  </div>
                </fieldset>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-lg border border-[var(--danger)] bg-[var(--danger)]/10 px-4 py-3 text-sm font-semibold text-[var(--danger)]"
                >
                  {formError}
                </div>
              )}

              {statusMessage && (
                <div
                  role="status"
                  className="rounded-lg border border-[var(--good)] bg-[var(--good)]/10 px-4 py-3 text-sm text-[var(--ink)]"
                >
                  <p className="font-bold text-[var(--good)]">✓ {statusMessage}</p>
                  {lastSavedRelato && (
                    <button
                      type="button"
                      onClick={() => onAnalyzeText(lastSavedRelato)}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--link)] hover:underline cursor-pointer"
                    >
                      <Search className="h-3.5 w-3.5" aria-hidden="true" />
                      Analisar esse relato agora no Golpe 3.0 →
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] transition-colors whitespace-nowrap cursor-pointer"
                >
                  Salvar informações no navegador
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Meus Dados & Golpes Salvos (localStorage) */}
      <section id="registros" className="py-14">
        <div className="mx-auto max-w-[1120px] px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[var(--ink)]">
                Registros salvos neste navegador
              </h2>
              <p className="mt-1.5 text-sm text-[var(--soft)]">
                Dados armazenados localmente em <code className="font-mono">localStorage</code>.
                Exporte ou importe seu arquivo JSON a qualquer momento.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-xs font-bold text-[var(--ink)] hover:border-[var(--accent)] transition-colors whitespace-nowrap cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Exportar JSON
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-xs font-bold text-[var(--ink)] hover:border-[var(--accent)] transition-colors whitespace-nowrap cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                Importar JSON
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => setShowJsonPreview((prev) => !prev)}
                className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-xs font-bold text-[var(--ink)] hover:border-[var(--accent)] transition-colors whitespace-nowrap cursor-pointer"
              >
                {showJsonPreview ? 'Ocultar JSON' : 'Ver JSON'}
              </button>

              {(userProfile || scamReports.length > 0) && !confirmClear && (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-xs font-bold text-[var(--danger)] hover:border-[var(--danger)] transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Limpar dados
                </button>
              )}

              {confirmClear && (
                <div className="flex items-center gap-2 rounded-lg border border-[var(--danger)] bg-[var(--surface)] px-3 py-1.5">
                  <span className="text-xs font-semibold text-[var(--ink)]">Confirmar limpeza?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setConfirmClear(false);
                      setNome('');
                      setEmail('');
                      setTelefone('');
                      setCidade('');
                      setStatusMessage('Todos os registros locais foram removidos.');
                    }}
                    className="rounded bg-[var(--danger)] px-2.5 py-1 text-xs font-bold text-white cursor-pointer"
                  >
                    Sim, apagar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="text-xs font-semibold text-[var(--soft)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Saved User Profile Summary */}
          <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                <h3 className="font-display text-sm font-bold text-[var(--ink)]">
                  Perfil salvo no navegador
                </h3>
              </div>
              {userProfile && (
                <span className="text-xs text-[var(--soft)] tabular-nums">
                  Atualizado em {new Date(userProfile.updatedAt).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>

            {userProfile ? (
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--ink)]">
                <strong>{userProfile.nome}</strong>
                <span className="text-[var(--soft)]" aria-hidden="true">
                  ·
                </span>
                <span>{userProfile.email}</span>
                {userProfile.telefone && (
                  <>
                    <span className="text-[var(--soft)]" aria-hidden="true">
                      ·
                    </span>
                    <span className="tabular-nums">{userProfile.telefone}</span>
                  </>
                )}
                {userProfile.cidade && (
                  <>
                    <span className="text-[var(--soft)]" aria-hidden="true">
                      ·
                    </span>
                    <span>{userProfile.cidade}</span>
                  </>
                )}
                <span className="text-[var(--soft)]" aria-hidden="true">
                  ·
                </span>
                <span className="text-[var(--soft)]">{PERSONA_LABELS[userProfile.persona]}</span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-[var(--soft)]">
                Nenhum perfil salvo ainda. Preencha o formulário acima para registrar seus dados.
              </p>
            )}
          </div>

          {showJsonPreview && (
            <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="mb-2 text-xs font-bold text-[var(--soft)]">
                Visualização do JSON salvo localmente
              </p>
              <pre className="max-h-64 overflow-auto rounded-lg bg-[var(--bg)] p-3 font-mono text-xs text-[var(--link)]">
                {JSON.stringify(buildExportPayload(userProfile, scamReports), null, 2)}
              </pre>
            </div>
          )}

          {/* Saved Scam Reports List */}
          <div className="mt-6 space-y-4">
            {scamReports.length === 0 ? (
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center">
                <p className="font-semibold text-[var(--ink)]">
                  Nenhum relato de golpe salvo até o momento.
                </p>
                <p className="mt-1 text-sm text-[var(--soft)]">
                  Use o formulário acima para registrar o golpe em que você caiu ou uma tentativa
                  suspeita.
                </p>
              </div>
            ) : (
              scamReports.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--soft)] tabular-nums">
                        <span className="font-bold text-[var(--accent)]">{item.canal}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.dataOcorrencia || 'Data não informada'}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.impacto}</span>
                        {item.valorPrejuizo && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Valor: {item.valorPrejuizo}</span>
                          </>
                        )}
                      </div>
                      <h3 className="mt-1.5 font-display text-base font-bold text-[var(--ink)]">
                        {item.tipoGolpe}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onAnalyzeText(item.relato)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-bold text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Search className="h-3.5 w-3.5" aria-hidden="true" />
                        Analisar relato
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteReport(item.id)}
                        aria-label={`Remover registro ${item.tipoGolpe}`}
                        className="rounded-lg border border-[var(--line)] p-1.5 text-[var(--soft)] hover:border-[var(--danger)] hover:text-[var(--danger)] transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3.5 text-sm text-[var(--ink)]">
                    {item.relato}
                  </p>

                  <p className="mt-2.5 text-xs text-[var(--soft)]">
                    Registrado por <strong className="text-[var(--ink)]">{item.nome}</strong> (
                    {item.email}) em {new Date(item.criadoEm).toLocaleString('pt-BR')}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
