export type ThemeMode = 'dark' | 'light';

export type ActiveView = 'inicio' | 'analisador';

export type UserPersona = 'estudante' | 'cliente' | 'familiar' | 'empresa';

export interface UserProfile {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  persona: UserPersona;
  updatedAt: string;
}

export interface ScamReport {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  persona: UserPersona;
  tipoGolpe: string;
  canal: string;
  dataOcorrencia: string;
  impacto: string;
  valorPrejuizo: string;
  relato: string;
  criadoEm: string;
}

export interface ScamRule {
  id: string;
  title: string;
  weight: number;
  pattern: RegExp;
  explanation: string;
}

export type RiskLevel = 'high' | 'medium' | 'low' | 'none';

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  title: string;
  subtitle: string;
  icon: string;
  specific: boolean;
}

export interface TextSegment {
  text: string;
  highlighted: boolean;
}

export interface AnalysisResult {
  segments: TextSegment[];
  matchedRules: ScamRule[];
  risk: RiskAssessment;
  advice: string;
}
