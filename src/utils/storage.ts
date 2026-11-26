import type { ScamReport, ThemeMode, UserProfile } from '../types/scam';

const KEYS = {
  USER_PROFILE: 'issoegolpe_usuario_info',
  SCAM_REPORTS: 'issoegolpe_golpes_salvos',
  THEME: 'site-theme',
} as const;

export function loadTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(KEYS.THEME);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // Ignore storage access errors
  }
  return 'dark';
}

export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(KEYS.THEME, theme);
  } catch {
    // Ignore storage access errors
  }
}

export function loadUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(KEYS.USER_PROFILE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    if (!parsed || typeof parsed.nome !== 'string') return null;
    return {
      nome: parsed.nome || '',
      email: parsed.email || '',
      telefone: parsed.telefone || '',
      cidade: parsed.cidade || '',
      persona: parsed.persona || 'cliente',
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch {
    // Ignore storage access errors
  }
}

export function loadScamReports(): ScamReport[] {
  try {
    const raw = localStorage.getItem(KEYS.SCAM_REPORTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ScamReport =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.relato === 'string'
    );
  } catch {
    return [];
  }
}

export function saveScamReports(reports: ScamReport[]): void {
  try {
    localStorage.setItem(KEYS.SCAM_REPORTS, JSON.stringify(reports));
  } catch {
    // Ignore storage access errors
  }
}

export function clearStoredData(): void {
  try {
    localStorage.removeItem(KEYS.USER_PROFILE);
    localStorage.removeItem(KEYS.SCAM_REPORTS);
  } catch {
    // Ignore storage access errors
  }
}

export function buildExportPayload(profile: UserProfile | null, reports: ScamReport[]) {
  return {
    schema: 'IssoEGolpe-Registros-Locais',
    exportedAt: new Date().toISOString(),
    usuario: profile,
    golpesRegistrados: reports,
  };
}

export function parseImportedPayload(jsonText: string): {
  profile: UserProfile | null;
  reports: ScamReport[];
} {
  const parsed = JSON.parse(jsonText);

  if (Array.isArray(parsed)) {
    return {
      profile: null,
      reports: parsed.filter((item) => item && typeof item.relato === 'string'),
    };
  }

  if (parsed && typeof parsed === 'object') {
    const reports = Array.isArray(parsed.golpesRegistrados)
      ? parsed.golpesRegistrados.filter((item: unknown) => {
          return (
            Boolean(item) &&
            typeof item === 'object' &&
            typeof (item as ScamReport).relato === 'string'
          );
        })
      : [];

    const profile =
      parsed.usuario && typeof parsed.usuario === 'object' && typeof parsed.usuario.nome === 'string'
        ? (parsed.usuario as UserProfile)
        : null;

    return { profile, reports };
  }

  throw new Error('Formato de JSON não reconhecido.');
}
