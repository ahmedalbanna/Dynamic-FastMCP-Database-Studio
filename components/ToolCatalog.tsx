'use client';

import React, { useState } from 'react';
import { DynamicMCPTool, ToolCategory } from '@/lib/mcp-types';
import { Language, TRANSLATIONS } from '@/lib/translations';
import {
  Search,
  Database,
  Globe,
  Code2,
  Play,
  Pencil,
  Copy,
  Trash2,
  Clock,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ToolCatalogProps {
  tools: DynamicMCPTool[];
  lang: Language;
  theme?: 'dark' | 'light';
  onSelectToolForTest: (tool: DynamicMCPTool) => void;
  onEditTool: (tool: DynamicMCPTool) => void;
  onDuplicateTool: (tool: DynamicMCPTool) => void;
  onDeleteTool: (toolId: string) => void;
  onToggleStatus: (toolId: string, currentStatus: boolean) => void;
  onCreateNew: () => void;
}

export const ToolCatalog: React.FC<ToolCatalogProps> = ({
  tools,
  lang,
  theme = 'dark',
  onSelectToolForTest,
  onEditTool,
  onDuplicateTool,
  onDeleteTool,
  onToggleStatus,
  onCreateNew,
}) => {
  const t = TRANSLATIONS[lang];
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'DATABASE_SQL' | 'REST_API' | 'BUSINESS_LOGIC'>('ALL');

  const filteredTools = tools.filter(tool => {
    const matchesCategory = categoryFilter === 'ALL' || tool.category === categoryFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      tool.name.toLowerCase().includes(term) ||
      tool.titleAr.toLowerCase().includes(term) ||
      tool.titleEn.toLowerCase().includes(term) ||
      tool.descriptionAr.toLowerCase().includes(term) ||
      tool.descriptionEn.toLowerCase().includes(term) ||
      tool.tags.some(tag => tag.toLowerCase().includes(term));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: ToolCategory) => {
    switch (category) {
      case 'DATABASE_SQL':
        return Database;
      case 'REST_API':
        return Globe;
      case 'BUSINESS_LOGIC':
      default:
        return Code2;
    }
  };

  const getCategoryLabel = (category: ToolCategory) => {
    switch (category) {
      case 'DATABASE_SQL':
        return lang === 'ar' ? 'استعلام SQL' : 'SQL Query';
      case 'REST_API':
        return lang === 'ar' ? 'واجهة REST API' : 'REST API';
      case 'BUSINESS_LOGIC':
        return lang === 'ar' ? 'منطق برمجي Script' : 'Logic Script';
      default:
        return category;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search and Category Tabs */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 transition-colors duration-200 ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}
      >
        {/* Interactive Segmented Filter */}
        <div
          className={`flex items-center gap-1 p-1 rounded-lg border overflow-x-auto transition-colors duration-200 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 whitespace-nowrap cursor-pointer ${
              categoryFilter === 'ALL'
                ? isDark
                  ? 'bg-slate-800 text-white shadow-sm font-semibold'
                  : 'bg-white text-slate-900 shadow-xs font-semibold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.filterAll} ({tools.length})
          </button>
          <button
            onClick={() => setCategoryFilter('DATABASE_SQL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 whitespace-nowrap cursor-pointer ${
              categoryFilter === 'DATABASE_SQL'
                ? isDark
                  ? 'bg-slate-800 text-emerald-400 shadow-sm font-semibold'
                  : 'bg-white text-emerald-700 shadow-xs font-semibold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>{t.filterSql}</span>
          </button>
          <button
            onClick={() => setCategoryFilter('REST_API')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 whitespace-nowrap cursor-pointer ${
              categoryFilter === 'REST_API'
                ? isDark
                  ? 'bg-slate-800 text-sky-400 shadow-sm font-semibold'
                  : 'bg-white text-sky-700 shadow-xs font-semibold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{t.filterHttp}</span>
          </button>
          <button
            onClick={() => setCategoryFilter('BUSINESS_LOGIC')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 whitespace-nowrap cursor-pointer ${
              categoryFilter === 'BUSINESS_LOGIC'
                ? isDark
                  ? 'bg-slate-800 text-purple-400 shadow-sm font-semibold'
                  : 'bg-white text-purple-700 shadow-xs font-semibold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>{t.filterScript}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full rounded-lg border py-1.5 pl-9 pr-3 text-xs transition-colors duration-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
            }`}
          />
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div
          className={`rounded-xl border border-dashed p-12 text-center transition-colors duration-200 ${
            isDark
              ? 'border-slate-800 bg-slate-950/40 text-slate-400'
              : 'border-slate-300 bg-white/60 text-slate-600 shadow-xs'
          }`}
        >
          <Layers
            className={`mx-auto h-10 w-10 mb-3 ${
              isDark ? 'text-slate-600' : 'text-slate-400'
            }`}
          />
          <h3
            className={`text-sm font-semibold mb-1 ${
              isDark ? 'text-slate-300' : 'text-slate-900'
            }`}
          >
            {lang === 'ar' ? 'لم يتم العثور على أدوات تطابق البحث' : 'No dynamic tools found'}
          </h3>
          <p
            className={`text-xs mb-4 max-w-sm mx-auto ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {lang === 'ar'
              ? 'يمكنك إنشاء أداة جديدة الآن وربطها بقاعدة البيانات دون إعادة تشغيل الخادم.'
              : 'Create a new dynamic tool now to register it in the database without restarting the server.'}
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors duration-200 cursor-pointer shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.createToolBtn}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTools.map(tool => {
            const CategoryIcon = getCategoryIcon(tool.category);
            const title = lang === 'ar' ? tool.titleAr : tool.titleEn;
            const description = lang === 'ar' ? tool.descriptionAr : tool.descriptionEn;
            const propertiesCount = Object.keys(tool.inputSchema.properties || {}).length;

            return (
              <div
                key={tool.id}
                className={`group relative rounded-xl border transition-colors duration-200 p-5 ${
                  isDark
                    ? tool.isActive
                      ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
                      : 'border-slate-900 bg-slate-950/40 opacity-75'
                    : tool.isActive
                    ? 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                    : 'border-slate-200 bg-slate-100/60 opacity-75'
                }`}
              >
                {/* Header Row: Category, Name, Active Toggle */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                        tool.category === 'DATABASE_SQL'
                          ? isDark
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : tool.category === 'REST_API'
                          ? isDark
                            ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                            : 'bg-sky-50 border-sky-200 text-sky-700'
                          : isDark
                          ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                          : 'bg-purple-50 border-purple-200 text-purple-700'
                      }`}
                    >
                      <CategoryIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4
                        className={`text-sm font-semibold tracking-tight ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {title || tool.name}
                      </h4>
                      <code
                        className={`text-[11px] font-mono block ${
                          isDark ? 'text-emerald-400/90' : 'text-emerald-700'
                        }`}
                      >
                        {tool.name}
                      </code>
                    </div>
                  </div>

                  {/* Active Toggle Switch */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleStatus(tool.id, tool.isActive)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        tool.isActive
                          ? isDark
                            ? 'bg-emerald-500'
                            : 'bg-emerald-600'
                          : isDark
                          ? 'bg-slate-700'
                          : 'bg-slate-300'
                      }`}
                      title={tool.isActive ? t.activeStatus : t.disabledStatus}
                      aria-label={tool.isActive ? t.activeStatus : t.disabledStatus}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          tool.isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p
                  className={`text-xs line-clamp-2 mb-3 min-h-[32px] leading-relaxed ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {description ||
                    (lang === 'ar'
                      ? 'أداة ديناميكية مسجلة في قاعدة البيانات'
                      : 'Dynamic tool registered in central database')}
                </p>

                {/* Execution preview snippet */}
                <div
                  className={`rounded-lg p-2.5 mb-3 font-mono text-[11px] overflow-x-auto max-h-20 select-all border ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-850 text-slate-300'
                      : 'bg-slate-900 border-slate-800 text-slate-200'
                  }`}
                >
                  {tool.executionType === 'sql' && (
                    <span className="text-emerald-400">
                      {tool.executionConfig.sql?.query.split('\n')[0] || 'SELECT * FROM ...'}
                    </span>
                  )}
                  {tool.executionType === 'http' && (
                    <span className="text-sky-300">
                      [{tool.executionConfig.http?.method || 'GET'}]{' '}
                      {tool.executionConfig.http?.url || 'https://...'}
                    </span>
                  )}
                  {tool.executionType === 'script' && (
                    <span className="text-purple-300">
                      function(args, db) {'{'} ... dynamic logic {'}'}
                    </span>
                  )}
                </div>

                {/* Unboxed Metadata Row (Zero-Pill compliant: clean unboxed text with typographic separators) */}
                <div
                  className={`flex items-center flex-wrap gap-2 text-[11px] border-t pt-3 mb-3 ${
                    isDark
                      ? 'border-slate-800/60 text-slate-400'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <span className={isDark ? 'text-slate-300' : 'text-slate-800 font-medium'}>
                    {getCategoryLabel(tool.category)}
                  </span>
                  <span aria-hidden="true" className={isDark ? 'text-slate-600' : 'text-slate-300'}>
                    ·
                  </span>
                  <span className="font-mono tabular-nums">v{tool.version}</span>
                  <span aria-hidden="true" className={isDark ? 'text-slate-600' : 'text-slate-300'}>
                    ·
                  </span>
                  <span className="font-mono tabular-nums">
                    {propertiesCount} {lang === 'ar' ? 'متغيرات' : 'params'}
                  </span>
                  <span aria-hidden="true" className={isDark ? 'text-slate-600' : 'text-slate-300'}>
                    ·
                  </span>
                  <span className="font-mono tabular-nums flex items-center gap-1">
                    <Clock className={`h-3 w-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    {tool.stats.avgLatencyMs}ms
                  </span>
                  <span aria-hidden="true" className={isDark ? 'text-slate-600' : 'text-slate-300'}>
                    ·
                  </span>
                  <span className="font-mono tabular-nums flex items-center gap-1">
                    <Activity className={`h-3 w-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    {tool.stats.totalCalls} {lang === 'ar' ? 'استدعاء' : 'calls'}
                  </span>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectToolForTest(tool)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors duration-200 cursor-pointer border ${
                        isDark
                          ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                      }`}
                    >
                      <Play className="h-3 w-3" />
                      <span>{t.testTool}</span>
                    </button>
                    <button
                      onClick={() => onEditTool(tool)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors duration-200 cursor-pointer border ${
                        isDark
                          ? 'text-slate-300 bg-slate-800 hover:bg-slate-700 border-slate-700/60'
                          : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-200'
                      }`}
                    >
                      <Pencil className="h-3 w-3" />
                      <span>{t.editTool}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicateTool(tool)}
                      className={`p-1.5 rounded-md transition-colors duration-200 cursor-pointer ${
                        isDark
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      title={t.duplicateTool}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTool(tool.id)}
                      className={`p-1.5 rounded-md transition-colors duration-200 cursor-pointer ${
                        isDark
                          ? 'text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10'
                          : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'
                      }`}
                      title={t.deleteTool}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
