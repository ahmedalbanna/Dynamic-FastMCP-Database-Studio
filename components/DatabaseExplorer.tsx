'use client';

import React, { useState, useEffect } from 'react';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { Database, Play, RefreshCw, Table, Terminal, CheckCircle2, Layers } from 'lucide-react';

interface DatabaseExplorerProps {
  lang: Language;
}

export const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            {t.dbHeadline}
          </h3>
          <p className="text-xs text-slate-400">
            {t.dbSubtitle}
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={isResetting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{t.resetDbBtn}</span>
        </button>
      </div>

      {/* Table Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
        {tablesData &&
          Object.keys(tablesData).map(tableName => {
            const table = tablesData[tableName];
            const isSelected = selectedTable === tableName;
            return (
              <button
                key={tableName}
                onClick={() => setSelectedTable(tableName)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Table className="h-3.5 w-3.5" />
                <span className="font-mono">{tableName}</span>
                <span className="font-mono tabular-nums text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400">
                  {table.count} rows
                </span>
              </button>
            );
          })}
      </div>

      {/* Selected Table Content */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-mono">
          Loading database schema...
        </div>
      ) : currentTable ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">
              Table: <strong className="text-white">{selectedTable}</strong> · {currentTable.count} records total
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">Real-time Connected</span>
          </div>

          <div className="overflow-x-auto max-h-[380px]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/90 text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0">
                <tr>
                  {currentTable.columns.map((col: string) => (
                    <th key={col} className="px-3.5 py-2.5 whitespace-nowrap font-mono">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-mono tabular-nums">
                {currentTable.sample.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                    {currentTable.columns.map((col: string) => {
                      const val = row[col];
                      return (
                        <td key={col} className="px-3.5 py-2 whitespace-nowrap text-slate-200">
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
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <h4 className="text-xs font-semibold text-white">
              {lang === 'ar' ? 'محرر استعلامات SQL المباشر (Ad-Hoc SQL Console)' : 'Interactive SQL Query Console'}
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">PostgreSQL / SQLite Syntax</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <textarea
            rows={2}
            value={adhocQuery}
            onChange={e => setAdhocQuery(e.target.value)}
            className="flex-1 rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
          />
          <button
            onClick={handleRunAdhoc}
            disabled={isRunningAdhoc}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-colors cursor-pointer self-end sm:self-auto h-auto"
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
