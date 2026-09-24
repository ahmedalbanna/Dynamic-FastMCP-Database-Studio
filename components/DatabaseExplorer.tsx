'use client';

import React, { useState, useEffect } from 'react';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { Play, RefreshCw, Table, Terminal } from 'lucide-react';

interface DatabaseExplorerProps {
  lang: Language;
  theme?: 'dark' | 'light';
}

export const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({ lang, theme = 'dark' }) => {
  const t = TRANSLATIONS[lang];
  const isDark = theme === 'dark';

  const [selectedTable, setSelectedTable] = useState<string>('customers');
  const [tablesData, setTablesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adhocQuery, setAdhocQuery] = useState(
    'SELECT * FROM customers WHERE lifetime_spend > 5000 LIMIT 10;'
  );
  const [adhocResult, setAdhocResult] = useState<any>(null);
  const [isRunningAdhoc, setIsRunningAdhoc] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/database');
      const data = await res.json();
      if (data.success) {
        setTablesData(data.tables);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetch('/api/database')
      .then(res => res.json())
      .then(data => {
        if (active && data.success) {
          setTablesData(data.tables);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleRunAdhoc = async () => {
    setIsRunningAdhoc(true);
    try {
      const res = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: adhocQuery }),
      });
      const data = await res.json();
      if (data.success) {
        setAdhocResult(data.result);
      }
    } catch {
      // ignore
    } finally {
      setIsRunningAdhoc(false);
    }
  };

  const handleReset = async () => {
    if (!confirm(lang === 'ar' ? 'هل تريد استعادة البيانات الافتراضية للجداول؟' : 'Reset sample database to default records?')) {
      return;
    }
    setIsResetting(true);
    try {
      await fetch('/api/tools/reset', { method: 'POST' });
      await fetchTables();
    } catch {
      // ignore
    } finally {
      setIsResetting(false);
    }
  };

  const currentTable = tablesData ? tablesData[selectedTable] : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 transition-colors duration-200 ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}
      >
        <div>
          <h3
            className={`text-base font-semibold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {t.dbHeadline}
          </h3>
          <p
            className={`text-xs ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {t.dbSubtitle}
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={isResetting}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors duration-200 cursor-pointer self-start sm:self-auto ${
            isDark
              ? 'text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border-slate-800'
              : 'text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border-slate-200 shadow-2xs'
          }`}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{t.resetDbBtn}</span>
        </button>
      </div>

      {/* Table Tabs */}
      <div
        className={`flex items-center gap-2 overflow-x-auto p-1 rounded-xl border transition-colors duration-200 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}
      >
        {tablesData &&
          Object.keys(tablesData).map(tableName => {
            const table = tablesData[tableName];
            const isSelected = selectedTable === tableName;
            return (
              <button
                key={tableName}
                onClick={() => setSelectedTable(tableName)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors duration-200 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60 font-semibold'
                      : 'bg-white text-emerald-700 shadow-xs border border-slate-200 font-semibold'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table className="h-3.5 w-3.5" />
                <span className="font-mono">{tableName}</span>
                <span
                  className={`font-mono tabular-nums text-[10px] px-1.5 py-0.5 rounded ${
                    isDark ? 'bg-slate-950 text-slate-400' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {table.count} rows
                </span>
              </button>
            );
          })}
      </div>

      {/* Selected Table Content */}
      {isLoading ? (
        <div
          className={`p-12 text-center text-xs font-mono ${
            isDark ? 'text-slate-500' : 'text-slate-600'
          }`}
        >
          Loading database schema...
        </div>
      ) : currentTable ? (
        <div
          className={`rounded-xl border overflow-hidden transition-colors duration-200 ${
            isDark
              ? 'border-slate-800 bg-slate-900/60'
              : 'border-slate-200 bg-white shadow-xs'
          }`}
        >
          <div
            className={`px-5 py-3 border-b flex items-center justify-between text-xs transition-colors duration-200 ${
              isDark
                ? 'border-slate-800 bg-slate-950/60 text-slate-400'
                : 'border-slate-200 bg-slate-50/80 text-slate-700'
            }`}
          >
            <span className="font-mono">
              Table: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{selectedTable}</strong> ·{' '}
              {currentTable.count} records total
            </span>
            <span
              className={`text-[11px] font-mono ${
                isDark ? 'text-emerald-400' : 'text-emerald-700 font-semibold'
              }`}
            >
              Real-time Connected
            </span>
          </div>

          <div className="overflow-x-auto max-h-[380px]">
            <table className="w-full text-left text-xs">
              <thead
                className={`border-b text-[11px] font-semibold uppercase tracking-wider sticky top-0 ${
                  isDark
                    ? 'border-slate-800 bg-slate-950/90 text-slate-400'
                    : 'border-slate-200 bg-slate-100 text-slate-700'
                }`}
              >
                <tr>
                  {currentTable.columns.map((col: string) => (
                    <th key={col} className="px-3.5 py-2.5 whitespace-nowrap font-mono">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody
                className={`divide-y font-mono tabular-nums ${
                  isDark ? 'divide-slate-850' : 'divide-slate-100'
                }`}
              >
                {currentTable.sample.map((row: any, idx: number) => (
                  <tr
                    key={idx}
                    className={`transition-colors duration-200 ${
                      isDark ? 'hover:bg-slate-850/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    {currentTable.columns.map((col: string) => {
                      const val = row[col];
                      return (
                        <td
                          key={col}
                          className={`px-3.5 py-2 whitespace-nowrap ${
                            isDark ? 'text-slate-200' : 'text-slate-800'
                          }`}
                        >
                          {typeof val === 'number'
                            ? val.toLocaleString()
                            : String(val !== undefined && val !== null ? val : '')}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Ad-Hoc SQL Runner */}
      <div
        className={`rounded-xl border p-5 space-y-3 transition-colors duration-200 ${
          isDark
            ? 'border-slate-800 bg-slate-900/60'
            : 'border-slate-200 bg-white shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal
              className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}
            />
            <h4
              className={`text-xs font-semibold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {lang === 'ar' ? 'محرر استعلامات SQL المباشر (Ad-Hoc SQL Console)' : 'Interactive SQL Query Console'}
            </h4>
          </div>
          <span
            className={`text-[11px] font-mono ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            PostgreSQL / SQLite Syntax
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <textarea
            rows={2}
            value={adhocQuery}
            onChange={e => setAdhocQuery(e.target.value)}
            className={`flex-1 rounded-lg border p-2.5 text-xs font-mono transition-colors duration-200 focus:border-emerald-500 focus:outline-none ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-emerald-400'
            }`}
          />
          <button
            onClick={handleRunAdhoc}
            disabled={isRunningAdhoc}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-colors duration-200 cursor-pointer self-end sm:self-auto h-auto shadow-xs"
          >
            <Play className="h-3.5 w-3.5" />
            <span>{isRunningAdhoc ? 'Running...' : 'Run SQL'}</span>
          </button>
        </div>

        {adhocResult && (
          <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-850 pb-1.5">
              <span>{adhocResult.executionPlan}</span>
              <span className="text-emerald-400">{adhocResult.affectedCount} rows returned</span>
            </div>
            <pre className="text-xs font-mono text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
              {JSON.stringify(adhocResult.rows, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
