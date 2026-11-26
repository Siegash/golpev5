import React from 'react';
import type { ActiveView } from '../types/scam';

interface HeaderProps {
  activeView: ActiveView;
  onNavigateView: (view: ActiveView, sectionId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, onNavigateView }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-8 px-5 py-3.5">
        <a
          href="#inicio"
          onClick={(e) => {
            e.preventDefault();
            onNavigateView('inicio', 'inicio');
          }}
          className="font-display text-lg font-extrabold tracking-tight text-[var(--ink)] whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity"
        >
          Isso é golpe?
        </a>

        <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-6">
          <a
            href="#destaques"
            onClick={(e) => {
              e.preventDefault();
              onNavigateView('inicio', 'destaques');
            }}
            className="text-sm font-semibold text-[var(--soft)] hover:text-[var(--ink)] hover:underline underline-offset-4 whitespace-nowrap shrink-0 transition-colors"
          >
            Destaques
          </a>
          <a
            href="#guia"
            onClick={(e) => {
              e.preventDefault();
              onNavigateView('inicio', 'guia');
            }}
            className="text-sm font-semibold text-[var(--soft)] hover:text-[var(--ink)] hover:underline underline-offset-4 whitespace-nowrap shrink-0 transition-colors"
          >
            Como funciona
          </a>
          <a
            href="#cadastro"
            onClick={(e) => {
              e.preventDefault();
              onNavigateView('inicio', 'cadastro');
            }}
            className="text-sm font-semibold text-[var(--soft)] hover:text-[var(--ink)] hover:underline underline-offset-4 whitespace-nowrap shrink-0 transition-colors"
          >
            Registrar Golpe
          </a>
          <a
            href="#registros"
            onClick={(e) => {
              e.preventDefault();
              onNavigateView('inicio', 'registros');
            }}
            className="text-sm font-semibold text-[var(--soft)] hover:text-[var(--ink)] hover:underline underline-offset-4 whitespace-nowrap shrink-0 transition-colors"
          >
            Meus Registros
          </a>
          <a
            href="#analisador"
            onClick={(e) => {
              e.preventDefault();
              onNavigateView('analisador');
            }}
            className={`text-sm font-semibold hover:underline underline-offset-4 whitespace-nowrap shrink-0 transition-colors ${
              activeView === 'analisador'
                ? 'text-[var(--accent)]'
                : 'text-[var(--soft)] hover:text-[var(--ink)]'
            }`}
          >
            Analisador
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          {activeView === 'inicio' ? (
            <button
              type="button"
              onClick={() => onNavigateView('analisador')}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Analisar Mensagem
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigateView('inicio', 'cadastro')}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[var(--accent-ink)] hover:bg-[var(--accent-hover)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Registrar Caso
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
