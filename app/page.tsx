'use client';

import React, { useState, useEffect } from 'react';
import { DynamicMCPTool } from '@/lib/mcp-types';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { ToolCatalog } from '@/components/ToolCatalog';
import { ToolEditorModal } from '@/components/ToolEditorModal';
import { ToolTester } from '@/components/ToolTester';
import { AgentSandbox } from '@/components/AgentSandbox';
import { DatabaseExplorer } from '@/components/DatabaseExplorer';
import { CodeExporter } from '@/components/CodeExporter';
import { ArchitectureView } from '@/components/ArchitectureModal';
import {
  Server,
  Database,
  Terminal,
  Bot,
  Plus,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  const [lang, setLang] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<string>('catalog');
  const [tools, setTools] = useState<DynamicMCPTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<DynamicMCPTool | null>(null);

  // Tester pre-selected tool
  const [testToolId, setTestToolId] = useState<string | undefined>(undefined);

  const t = TRANSLATIONS[lang];

  // Fetch all tools from API
  const loadTools = async () => {
    try {
      const res = await fetch('/api/tools');
      const data = await res.json();
      if (data.success && Array.isArray(data.tools)) {
        setTools(data.tools);
      }
    } catch (err) {
      console.error('Failed to fetch tools:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch('/api/tools')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success && Array.isArray(data.tools)) {
          setTools(data.tools);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to fetch tools:', err);
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleLang = () => {
    setLang(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const handleOpenCreateModal = () => {
    setEditingTool(null);
    setIsEditorOpen(true);
  };

  const handleEditTool = (tool: DynamicMCPTool) => {
    setEditingTool(tool);
    setIsEditorOpen(true);
  };

  const handleDuplicateTool = async (tool: DynamicMCPTool) => {
    const clonePayload = {
      ...tool,
      id: undefined,
      name: `${tool.name}_copy`,
      titleAr: `${tool.titleAr} (نسخة)`,
      titleEn: `${tool.titleEn} (Copy)`,
    };
    try {
      const res = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clonePayload),
      });
      const data = await res.json();
      if (data.success) {
        await loadTools();
      }
    } catch (err) {
      console.error('Failed to clone tool:', err);
    }
  };

  const handleDeleteTool = async (toolId: string) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      const res = await fetch(`/api/tools/${toolId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTools(prev => prev.filter(t => t.id !== toolId));
      }
    } catch (err) {
      console.error('Failed to delete tool:', err);
    }
  };

  const handleToggleStatus = async (toolId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Optimistic update
    setTools(prev =>
      prev.map(t => (t.id === toolId ? { ...t, isActive: newStatus } : t))
    );

    try {
      await fetch(`/api/tools/${toolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
    } catch (err) {
      console.error('Failed to toggle status:', err);
      // rollback
      setTools(prev =>
        prev.map(t => (t.id === toolId ? { ...t, isActive: currentStatus } : t))
      );
    }
  };

  const handleSaveTool = async (toolData: Partial<DynamicMCPTool> & { name: string }) => {
    const isEdit = !!toolData.id;
    const url = isEdit ? `/api/tools/${toolData.id}` : '/api/tools';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toolData),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to save tool');
    }

    await loadTools();
  };

  const handleSelectToolForTest = (tool: DynamicMCPTool) => {
    setTestToolId(tool.id);
    setActiveTab('tester');
  };

  const activeCount = tools.filter(t => t.isActive).length;

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200"
    >
      {/* Top Navbar */}
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenCreateModal={handleOpenCreateModal}
        activeToolsCount={activeCount}
        totalToolsCount={tools.length}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <section className="relative rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-900/40 to-slate-950 p-6 sm:p-8 overflow-hidden">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>FastMCP Protocol v2024-11-05</span>
                <span>·</span>
                <span>Dynamic Database Hydration</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                {t.appTitle}
              </h1>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
                {lang === 'ar'
                  ? 'منظومة مبتكرة تفصل منطق أدوات بروتوكول MCP عن الكود المصدري عبر تخزينها في قاعدة بيانات مركزية. يمكنك إنشاء وتحديث وفحص أدوات الذكاء الاصطناعي لحظياً دون الحاجة لإعادة تشغيل الخادم على الإطلاق.'
                  : 'An innovative architectural system decoupling MCP tool logic from rigid source code by storing all definitions in a central database. Create, update, and test AI tools visually with zero server restarts.'}
              </p>

              {/* Unboxed Status & Telemetry Row (Zero-pill compliant: unboxed metadata with separators) */}
              <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400 pt-1">
                <span className="font-semibold text-white font-mono tabular-nums">
                  {tools.length} {t.toolsCount}
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-emerald-400 font-mono tabular-nums font-semibold">
                  {activeCount} {t.activeCount}
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400">
                  {t.connectedDb}
                </span>
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap md:flex-col gap-2.5 shrink-0">
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-md"
              >
                <Plus className="h-4 w-4" />
                <span>{t.createToolBtn}</span>
              </button>

              <button
                onClick={() => setActiveTab('agent')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700/70 rounded-lg transition-colors cursor-pointer"
              >
                <Bot className="h-4 w-4 text-emerald-400" />
                <span>{lang === 'ar' ? 'تشغيل المساعد الذكي' : 'Test AI Agent'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* View Content Renderer */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mb-3" />
            <span className="text-xs font-mono text-slate-400">
              Hydrating tools from database registry...
            </span>
          </div>
        ) : (
          <div>
            {activeTab === 'catalog' && (
              <ToolCatalog
                tools={tools}
                lang={lang}
                onSelectToolForTest={handleSelectToolForTest}
                onEditTool={handleEditTool}
                onDuplicateTool={handleDuplicateTool}
                onDeleteTool={handleDeleteTool}
                onToggleStatus={handleToggleStatus}
                onCreateNew={handleOpenCreateModal}
              />
            )}

            {activeTab === 'tester' && (
              <ToolTester
                tools={tools}
                selectedToolId={testToolId}
                lang={lang}
              />
            )}

            {activeTab === 'agent' && (
              <AgentSandbox tools={tools} lang={lang} />
            )}

            {activeTab === 'database' && <DatabaseExplorer lang={lang} />}

            {activeTab === 'code' && <CodeExporter tools={tools} lang={lang} />}

            {activeTab === 'arch' && <ArchitectureView lang={lang} />}
          </div>
        )}
      </main>

      {/* Tool Editor & Schema Builder Modal */}
      {isEditorOpen && (
        <ToolEditorModal
          key={editingTool?.id || 'new-tool'}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveTool}
          initialTool={editingTool}
          lang={lang}
        />
      )}

      {/* Subtle Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 mt-16 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">FastMCP Dynamic Database Studio</span>
            <span>·</span>
            <span>Model Context Protocol Specification</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('arch')}
              className="hover:text-slate-300 transition-colors"
            >
              {lang === 'ar' ? 'المعمارية التقنية' : 'Architecture'}
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className="hover:text-slate-300 transition-colors"
            >
              {lang === 'ar' ? 'كود بايثون' : 'Python Server'}
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className="hover:text-slate-300 transition-colors"
            >
              {lang === 'ar' ? 'قاعدة البيانات' : 'Database'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
