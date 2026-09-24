'use client';

import React from 'react';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { Plus, Database, Sparkles, Layers, Terminal, Server, Bot, Globe } from 'lucide-react';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCreateModal: () => void;
  activeToolsCount: number;
  totalToolsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  activeTab,
  onSelectTab,
  onOpenCreateModal,
  activeToolsCount,
  totalToolsCount,
}) => {
  const t = TRANSLATIONS[lang];

  const navItems = [
    { id: 'catalog', label: t.navTools, icon: Layers },
    { id: 'tester', label: t.navTester, icon: Terminal },
    { id: 'agent', label: t.navAgent, icon: Bot },
    { id: 'database', label: t.navDatabase, icon: Database },
    { id: 'code', label: t.navCode, icon: Server },
    { id: 'arch', label: t.navArch, icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Top bar contract: Zone 1 (Wordmark) — Zone 2 (Clean nav items) — Zone 3 (Primary actions) */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('catalog')}
            className="text-left group flex items-center gap-2.5 focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight text-white block">
                {t.appTitle}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:block">
                FastMCP Database Driver
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links / segmented tabs */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-lg">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions + language switch */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="h-3.5 w-3.5 text-slate-400" />
            <span className="tabular-nums font-sans uppercase">
              {lang === 'ar' ? 'English' : 'العربية'}
            </span>
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{t.createToolBtn}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-850 px-3 py-1.5 gap-1 bg-slate-950">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
