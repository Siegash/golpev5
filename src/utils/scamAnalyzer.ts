import type { AnalysisResult, RiskAssessment, ScamRule, TextSegment } from '../types/scam';

export const MAX_MESSAGE_CHARS = 12000;

export const SCAM_TYPES = [
  'Falsa central de atendimento / Banco',
  'WhatsApp falso / Número novo pedindo Pix',
  'Link ou página falsa (Phishing)',
  'Prêmio, taxa de liberação ou renda extra',
  'Roubo de conta ou código de verificação',
  'Compra online / Boleto falso',
  'Outro tipo de golpe',
] as const;

export const SCAM_CHANNELS = [
  'WhatsApp',
  'SMS',
  'Ligação telefônica',
  'E-mail',
  'Redes sociais',
  'Site ou anúncio',
] as const;

export const IMPACT_OPTIONS = [
  'Caí no golpe — fiz transferência / Pix',
  'Caí no golpe — informei senha, código ou dados',
  'Caí no golpe — instalei aplicativo ou cliquei em link',
  'Apenas tentativa — recebi a mensagem mas não agi',
  'Outro impacto',
] as const;

export const QUICK_EXAMPLES = [
  {
    label: 'Falsa conta bloqueada',
    text: 'URGENTE: sua conta será bloqueada hoje. Clique no link https://exemplo.invalid para confirmar seus dados e evitar o bloqueio.',
  },
  {
    label: 'Familiar pedindo Pix',
    text: 'Oi, troquei de número. Meu celular quebrou. Preciso que você faça um Pix agora e depois te explico.',
  },
  {
    label: 'Prêmio com taxa',
    text: 'Parabéns! Você ganhou um prêmio. Para liberar, pague uma taxa de cadastro via Pix e envie seu CPF.',
  },
] as const;

export const SCAM_RULES: ScamRule[] = [
  {
    id: 'credential',
    title: 'Pedido de senha ou código de autenticação',
    weight: 5,
    pattern:
      /\b(?:senha|password|token|c[oó]digo\s+(?:de\s+)?(?:verifica(?:ç[aã]o|r)?|seguran[cç]a|acesso|autentica[cç][aã]o)|c[oó]digo\s+que\s+(?:chegou|recebeu)|confirme\s+(?:seus\s+)?dados|informe\s+(?:sua\s+)?senha)\b/giu,
    explanation:
      'Compartilhar senhas ou códigos de autenticação pode permitir que alguém invada sua conta. Não os envie por mensagem nem por telefone.',
  },
  {
    id: 'remote-access',
    title: 'Pedido para instalar aplicativo ou dar acesso ao aparelho',
    weight: 5,
    pattern:
      /\b(?:instale|baix(?:e|ar)|acesse|abra)\b.{0,65}\b(?:anydesk|teamviewer|rustdesk|aplicativo|app|acesso remoto)\b|\b(?:compartilhe|libere|conceda)\b.{0,35}\b(?:tela|acesso remoto|acesso ao celular)\b/giu,
    explanation:
      'Um falso atendente pode tentar controlar seu dispositivo ou visualizar aplicativos bancários. Só instale ferramentas quando você mesmo tiver confirmado a necessidade com uma fonte confiável.',
  },
  {
    id: 'payment-pressure',
    title: 'Pagamento ou transferência com pressão',
    weight: 4,
    pattern:
      /\b(?:fa[cç]a|realize|envie|transfira|pague|deposite)\b.{0,55}\b(?:pix|transfer[eê]ncia|dep[oó]sito|pagamento|taxa|boleto|dinheiro)\b|\b(?:pague|pagamento)\b.{0,35}\b(?:taxa|libera[cç][aã]o|cadastro|entrega|pr[eê]mio)\b/giu,
    explanation:
      'Confirme a cobrança por um canal oficial que você já conheça antes de pagar. A urgência não é prova de legitimidade.',
  },
  {
    id: 'new-number',
    title: 'Possível golpe do número novo',
    weight: 5,
    pattern:
      /\b(?:troquei de n[uú]mero|n[uú]mero novo|meu celular quebrou|perdi meu celular|salva(?: aí| este n[uú]mero)?|este [ée] meu novo n[uú]mero)\b/giu,
    explanation:
      'Criminosos podem usar a foto de um conhecido em outro número e pedir dinheiro. Confirme a identidade ligando para o número antigo ou por outro canal.',
  },
  {
    id: 'urgent-threat',
    title: 'Urgência, ameaça ou medo de bloqueio',
    weight: 2,
    pattern:
      /\b(?:urgente|imediatamente|agora|última chance|bloquead[oa]|suspens[oa]|ser[aá]\s+(?:bloquead[oa]|cancelad[oa])|evite o bloqueio|prazo final|em \d+\s*(?:minutos?|horas?))\b/giu,
    explanation:
      'Golpistas costumam criar pressão para impedir que você confira a informação. Pare e procure o canal oficial separadamente.',
  },
  {
    id: 'link',
    title: 'Link ou endereço para resolver um suposto problema',
    weight: 2,
    pattern:
      /\b(?:clique|acesse|entre|confira|regularize|atualize)\b.{0,45}\b(?:link|aqui|cadastro|conta|entrega|benef[ií]cio)\b|https?:\/\/[^\s<>"']+|(?:bit\.ly|tinyurl\.com|cutt\.ly)\/[^\s<>"']*/giu,
    explanation:
      'Um link pode levar a uma página falsa, mesmo quando a mensagem parece oficial. Não use o link recebido; abra o aplicativo oficial ou digite o endereço conhecido.',
  },
  {
    id: 'prize-fee',
    title: 'Prêmio, benefício ou oferta que exige pagamento',
    weight: 4,
    pattern:
      /\b(?:voc[eê]\s+ganhou|parab[eé]ns|foi\s+selecionad[oa]|pr[eê]mio|renda extra|vaga garantida|benef[ií]cio liberado)\b/giu,
    explanation:
      'Promessas inesperadas que exigem taxa, Pix ou dados pessoais são um sinal importante de alerta. Verifique a oferta com a organização por um canal oficial.',
  },
  {
    id: 'fake-support',
    title: 'Possível falsa central ou falso representante',
    weight: 3,
    pattern:
      /\b(?:central de atendimento|setor de seguran[cç]a|suporte t[eé]cnico|representante do banco|funcion[aá]rio do banco|conta com problema|compra suspeita|atividade suspeita|proteger sua conta)\b/giu,
    explanation:
      'O nome de uma instituição ou de um setor não comprova a identidade de quem entrou em contato. Encerre o contato e procure o atendimento oficial.',
  },
  {
    id: 'personal-data',
    title: 'Pedido de dados pessoais ou bancários',
    weight: 3,
    pattern:
      /\b(?:cpf|n[uú]mero do cart[aã]o|dados banc[aá]rios|dados pessoais|c[oó]digo de seguran[cç]a|validar sua identidade|confirmar identidade|informe seus dados)\b/giu,
    explanation:
      'Não envie documentos, dados bancários ou códigos a um contato inesperado. Confirme primeiro a necessidade diretamente com a instituição.',
  },
  {
    id: 'spoofing',
    title: 'Contato que afirma ser de banco, governo ou empresa',
    weight: 1,
    pattern:
      /\b(?:anatel|banco|receita federal|inss|pol[ií]cia|correios|transportadora|operadora|gov\.br|suporte|atendimento)\b/giu,
    explanation:
      'A menção a uma instituição não prova fraude nem autenticidade. Verifique o remetente, o endereço e a solicitação por um canal oficial independente.',
  },
  {
    id: 'account-takeover',
    title: 'Possível tentativa de tomar uma conta',
    weight: 4,
    pattern:
      /\b(?:recuperar sua conta|reativar sua conta|verifica[cç][aã]o em duas etapas|desativar a autentica[cç][aã]o|perdi acesso|invadiram minha conta|c[oó]digo de login)\b/giu,
    explanation:
      'Mensagens sobre recuperação de conta podem ser usadas para roubar acesso. Não compartilhe códigos e abra o aplicativo ou site oficial diretamente.',
  },
];

interface RuleMatch {
  start: number;
  end: number;
  ruleIndex: number;
}

export function analyzeMessage(text: string): AnalysisResult {
  const matches: RuleMatch[] = [];

  SCAM_RULES.forEach((rule, index) => {
    rule.pattern.lastIndex = 0;
    for (const match of text.matchAll(rule.pattern)) {
      if (typeof match.index === 'number') {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          ruleIndex: index,
        });
      }
    }
  });

  matches.sort((a, b) => a.start - b.start || b.end - a.end);

  const segments: TextSegment[] = [];
  let cursor = 0;
  const markedRuleIndices = new Set<number>();

  for (const hit of matches) {
    if (hit.start < cursor) continue;
    if (hit.start > cursor) {
      segments.push({ text: text.slice(cursor, hit.start), highlighted: false });
    }
    segments.push({ text: text.slice(hit.start, hit.end), highlighted: true });
    cursor = hit.end;
    markedRuleIndices.add(hit.ruleIndex);
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlighted: false });
  }

  const matchedIndices = [...markedRuleIndices];
  const matchedRules = matchedIndices.map((idx) => SCAM_RULES[idx]);

  const uniqueWeight = matchedIndices.reduce((sum, idx) => sum + SCAM_RULES[idx].weight, 0);
  const has = (id: string) => matchedIndices.some((i) => SCAM_RULES[i].id === id);

  const hasCredential = has('credential');
  const hasRemote = has('remote-access');
  const hasNewNumber = has('new-number');
  const hasPrizeFee = has('prize-fee');
  const hasPayment = has('payment-pressure');
  const hasLink = has('link');
  const hasUrgency = has('urgent-threat');
  const hasPersonal = has('personal-data');
  const hasFakeSupport = has('fake-support');

  let score = Math.min(100, uniqueWeight * 8);
  if (hasCredential) score += 28;
  if (hasRemote) score += 25;
  if (hasNewNumber && hasPayment) score += 25;
  if (hasPrizeFee && hasPayment) score += 20;
  if (hasLink && (hasUrgency || hasPersonal || hasFakeSupport)) score += 15;
  if (hasFakeSupport && (hasCredential || hasRemote || hasPayment)) score += 15;
  if (hasPersonal && hasPayment) score += 10;
  score = Math.min(100, score);

  const specific =
    hasCredential ||
    hasRemote ||
    (hasNewNumber && hasPayment) ||
    (hasPrizeFee && hasPayment) ||
    (hasLink && (hasUrgency || hasPersonal || hasFakeSupport));

  let risk: RiskAssessment;
  if (score >= 65 && specific) {
    risk = {
      score,
      level: 'high',
      title: 'Risco alto — fortes sinais de possível golpe',
      subtitle:
        'A mensagem combina sinais de risco concretos. Não aja antes de confirmar por um canal independente.',
      icon: '⚠',
      specific,
    };
  } else if (score >= 28 || markedRuleIndices.size >= 2) {
    risk = {
      score,
      level: 'medium',
      title: 'Risco moderado — confira com cuidado',
      subtitle:
        'Foram encontrados sinais suspeitos, mas o texto sozinho não permite confirmar que seja fraude.',
      icon: '!',
      specific,
    };
  } else if (score > 0) {
    risk = {
      score,
      level: 'low',
      title: 'Alguns sinais de atenção',
      subtitle:
        'Há elementos que merecem conferência. Eles também podem aparecer em mensagens legítimas.',
      icon: '◇',
      specific,
    };
  } else {
    risk = {
      score,
      level: 'none',
      title: 'Nenhum padrão conhecido foi identificado',
      subtitle:
        'Isso não significa que a mensagem seja segura: golpes novos ou escritos de outra forma podem passar despercebidos.',
      icon: '✓',
      specific,
    };
  }

  let advice: string;
  if (risk.level === 'high') {
    advice =
      'Não clique em links, não transfira dinheiro, não instale aplicativos e não compartilhe senhas ou códigos. Confirme a história diretamente com a instituição ou pessoa, usando um contato que você já conhecia.';
  } else if (risk.level === 'medium' || risk.level === 'low') {
    advice =
      'Pause antes de agir. Confira o endereço do remetente, não use links recebidos e procure a instituição pelo aplicativo ou site oficial. Se alguém conhecido pediu dinheiro, confirme por ligação no número já salvo.';
  } else {
    advice =
      'Não foram encontrados os padrões que esta ferramenta reconhece. Ainda assim, confirme pedidos inesperados de dinheiro ou dados por outro canal e não compartilhe códigos de autenticação.';
  }

  return { segments, matchedRules, risk, advice };
}
