/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { ScamAnalyzerView } from './components/ScamAnalyzerView';
import { StartTemplateView } from './components/StartTemplateView';
import type { ActiveView, ScamReport, ThemeMode, UserProfile } from './types/scam';
import {
  clearStoredData,
  loadScamReports,
  loadTheme,
  loadUserProfile,
  saveScamReports,
  saveTheme,
  saveUserProfile,
} from './utils/storage';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('inicio');
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => loadUserProfile());
  const [scamReports, setScamReports] = useState<ScamReport[]>(() => loadScamReports());
  const [analyzerPrefill, setAnalyzerPrefill] = useState<string>('');

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark';
    root.classList.toggle('dark', isDark);
    root.dataset.theme = theme;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDark ? '#080d18' : '#f0f5f8');
    }
    saveTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleNavigateView = (view: ActiveView, sectionId?: string) => {
    setActiveView(view);
    if (sectionId) {
      requestAnimationFrame(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveEntry = (
    profile: UserProfile,
    reportInput: Omit<ScamReport, 'id' | 'criadoEm'>
  ): ScamReport => {
    saveUserProfile(profile);
    setUserProfile(profile);

    const newReport: ScamReport = {
      ...reportInput,
      id: `golpe_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      criadoEm: new Date().toISOString(),
    };

    const updatedReports = [newReport, ...scamReports];
    saveScamReports(updatedReports);
    setScamReports(updatedReports);
    return newReport;
  };

  const handleUpdateProfileOnly = (profile: UserProfile) => {
    saveUserProfile(profile);
    setUserProfile(profile);
  };

  const handleSaveAnalyzedMessage = (reportInput: Omit<ScamReport, 'id' | 'criadoEm'>) => {
    const newReport: ScamReport = {
      ...reportInput,
      id: `golpe_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      criadoEm: new Date().toISOString(),
    };
    const updatedReports = [newReport, ...scamReports];
    saveScamReports(updatedReports);
    setScamReports(updatedReports);
  };

  const handleDeleteReport = (id: string) => {
    const updated = scamReports.filter((item) => item.id !== id);
    saveScamReports(updated);
    setScamReports(updated);
  };

  const handleClearAll = () => {
    clearStoredData();
    setUserProfile(null);
    setScamReports([]);
  };

  const handleImportData = (importedProfile: UserProfile | null, importedReports: ScamReport[]) => {
    if (importedProfile) {
      saveUserProfile(importedProfile);
      setUserProfile(importedProfile);
    }
    if (importedReports.length > 0) {
      const existingIds = new Set(scamReports.map((r) => r.id));
      const merged = [
        ...importedReports.filter((r) => r.id && !existingIds.has(r.id)),
        ...scamReports,
      ];
      saveScamReports(merged);
      setScamReports(merged);
    }
  };

  const handleAnalyzeText = (text: string) => {
    setAnalyzerPrefill(text);
    setActiveView('analisador');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[var(--accent-ink)]"
      >
        Pular para o conteúdo
      </a>

      <Header activeView={activeView} onNavigateView={handleNavigateView} />

      <main id="conteudo-principal" className="flex-1">
        {activeView === 'inicio' ? (
          <StartTemplateView
            theme={theme}
            onToggleTheme={handleToggleTheme}
            userProfile={userProfile}
            scamReports={scamReports}
            onSaveEntry={handleSaveEntry}
            onUpdateProfileOnly={handleUpdateProfileOnly}
            onDeleteReport={handleDeleteReport}
            onClearAll={handleClearAll}
            onImportData={handleImportData}
            onAnalyzeText={handleAnalyzeText}
            onGoToAnalyzer={() => handleNavigateView('analisador')}
          />
        ) : (
          <ScamAnalyzerView
            theme={theme}
            onToggleTheme={handleToggleTheme}
            initialText={analyzerPrefill}
            userProfile={userProfile}
            scamReports={scamReports}
            onSaveAnalyzedMessage={handleSaveAnalyzedMessage}
            onBackToStart={() => handleNavigateView('inicio', 'inicio')}
          />
        )}
      </main>

      <footer className="border-t border-[var(--line)] px-5 py-6">
        <div className="mx-auto flex max-w-[1120px] flex-col justify-between gap-3 text-xs text-[var(--soft)] md:flex-row md:items-center">
          <span className="font-display font-bold text-[var(--ink)]">Isso é golpe?</span>
          <span>
            Ferramenta educativa — não substitui confirmação com a instituição envolvida e faça
            sempre sua denúncia na central de Polícia mais próxima para futuras investigações.
          </span>
        </div>
      </footer>
    </div>
  );
}
