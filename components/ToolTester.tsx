'use client';

import React, { useState, useEffect } from 'react';
import { DynamicMCPTool, ToolExecutionResult } from '@/lib/mcp-types';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { Play, Copy, Check, Terminal, Code2, Clock, CheckCircle2, AlertCircle, Database, Layers } from 'lucide-react';

interface ToolTesterProps {
  tools: DynamicMCPTool[];
  selectedToolId?: string;
  lang: Language;
}

export const ToolTester: React.FC<ToolTesterProps> = ({ tools, selectedToolId, lang }) => {
  const t = TRANSLATIONS[lang];
  const [selectedToolIdState, setSelectedToolIdState] = useState<string>(() => {
    return selectedToolId || (tools.length > 0 ? tools[0].id : '');
  });

  const selectedTool = tools.find(t => t.id === (selectedToolId || selectedToolIdState)) || tools[0] || null;

  const getInitialArgs = (tool: DynamicMCPTool | null) => {
    if (!tool) return {};
    const defaults: Record<string, any> = {};
    const props = tool.inputSchema.properties || {};
    for (const [key, def] of Object.entries(props)) {
      if (def.default !== undefined) {
        defaults[key] = def.default;
      } else if (def.enum && def.enum.length > 0) {
        defaults[key] = def.enum[0];
      } else if (def.type === 'number' || def.type === 'integer') {
        defaults[key] = 0;
      } else if (def.type === 'boolean') {
        defaults[key] = false;
      } else {
        defaults[key] = '';
      }
    }
    return defaults;
  };

  const [argValues, setArgValues] = useState<Record<string, any>>(() => getInitialArgs(selectedTool));
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ToolExecutionResult | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'json' | 'rpc'>('table');
  const [hasCopied, setHasCopied] = useState(false);

  const handleToolChange = (toolId: string) => {
    setSelectedToolIdState(toolId);
    const found = tools.find(t => t.id === toolId);
    if (found) {
      setArgValues(getInitialArgs(found));
      setExecutionResult(null);
    }
  };

  const handleExecute = async () => {
    if (!selectedTool) return;
    setIsExecuting(true);
    setExecutionResult(null);

    const startTime = Date.now();
    try {
      const res = await fetch('/api/mcp/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: `req-${Date.now()}`,
          name: selectedTool.name,
          arguments: argValues,
        }),
      });
      const resJson = await res.json();
      const duration = Date.now() - startTime;

      let parsedData: any = null;
      if (resJson.result?.content?.[0]?.text) {
        try {
          parsedData = JSON.parse(resJson.result.content[0].text);
        } catch {
          parsedData = resJson.result.content[0].text;
        }
      }

      setExecutionResult({
        success: !resJson.result?.isError && !resJson.error,
        toolName: selectedTool.name,
        data: parsedData,
        error: resJson.error?.message || (resJson.result?.isError ? resJson.result.content[0].text : undefined),
        executionTimeMs: resJson.meta?.executionTimeMs || duration,
        timestamp: new Date().toISOString(),
        protocolResponse: resJson,
      });
    } catch (err: any) {
      setExecutionResult({
        success: false,
        toolName: selectedTool.name,
        error: err.message || 'Execution failed',
        executionTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  // Helper to extract rows for table view
  const extractTableRows = (data: any): any[] | null => {
    if (!data) return null;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.rows)) return data.rows;
    if (Array.isArray(data.data)) return data.data;
    if (typeof data === 'object') return [data];
    return null;
  };

  const rows = executionResult?.data ? extractTableRows(executionResult.data) : null;
  const tableColumns = rows && rows.length > 0 && typeof rows[0] === 'object' ? Object.keys(rows[0]) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Tool Selector & Input Parameters Form */}
      <div className="lg:col-span-5 space-y-4">
        {/* Tool Selector */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white mb-1.5">
              {lang === 'ar' ? 'اختر الأداة للاختبار عبر بروتوكول MCP' : 'Select Tool to Test via MCP Protocol'}
            </label>
            <select
              value={selectedTool?.id || ''}
              onChange={e => handleToolChange(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-medium text-emerald-400 focus:border-emerald-500 focus:outline-none"
            >
              {tools.map(tool => (
                <option key={tool.id} value={tool.id}>
                  {tool.name} — {lang === 'ar' ? tool.titleAr : tool.titleEn}
                </option>
              ))}
            </select>
          </div>

          {/* Tool Info Card */}
          {selectedTool && (
            <div className="rounded-lg bg-slate-950/80 border border-slate-850 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-emerald-400 font-semibold">{selectedTool.name}</span>
                <span className="text-[11px] text-slate-400 font-mono">v{selectedTool.version}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'ar' ? selectedTool.descriptionAr : selectedTool.descriptionEn}
              </p>
              <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-2">
                <span>{selectedTool.category}</span>
                <span>·</span>
                <span className="uppercase">{selectedTool.executionType}</span>
                <span>·</span>
                <span>{selectedTool.isActive ? t.activeStatus : t.disabledStatus}</span>
              </div>
            </div>
          )}

          {/* Dynamic Arguments Form */}
          {selectedTool && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  {lang === 'ar' ? 'المدخلات (Parameters Schema)' : 'Input Arguments'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {Object.keys(selectedTool.inputSchema.properties || {}).length} variables
                </span>
              </div>

              {Object.keys(selectedTool.inputSchema.properties || {}).length === 0 ? (
                <p className="text-xs text-slate-500 py-3 italic text-center">
                  {lang === 'ar' ? 'هذه الأداة لا تتطلب أي متغيرات مدخلة' : 'This tool requires no parameters.'}
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(selectedTool.inputSchema.properties || {}).map(([key, propDef]) => {
                    const isRequired = selectedTool.inputSchema.required?.includes(key);
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-mono text-slate-300">
                            {key} {isRequired && <span className="text-rose-400">*</span>}
                          </label>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {propDef.type}
                          </span>
                        </div>

                        {propDef.enum ? (
                          <select
                            value={argValues[key] || ''}
                            onChange={e => setArgValues({ ...argValues, [key]: e.target.value })}
                            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                          >
                            {propDef.enum.map(opt => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : propDef.type === 'boolean' ? (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              checked={!!argValues[key]}
                              onChange={e => setArgValues({ ...argValues, [key]: e.target.checked })}
                              className="rounded border-slate-700 text-emerald-500"
                            />
                            <span className="text-xs text-slate-400">True / False</span>
                          </div>
                        ) : (
                          <input
                            type={propDef.type === 'number' || propDef.type === 'integer' ? 'number' : 'text'}
                            value={argValues[key] !== undefined ? argValues[key] : ''}
                            onChange={e =>
                              setArgValues({
                                ...argValues,
                                [key]:
                                  propDef.type === 'number' || propDef.type === 'integer'
                                    ? Number(e.target.value)
                                    : e.target.value,
                              })
                            }
                            placeholder={propDef.description || key}
                            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                          />
                        )}

                        {propDef.description && (
                          <p className="text-[10px] text-slate-500 leading-tight">
                            {propDef.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Run button */}
              <button
                type="button"
                onClick={handleExecute}
                disabled={isExecuting || !selectedTool?.isActive}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-4 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <Play className="h-4 w-4" />
                <span>{isExecuting ? t.executing : t.runTest}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Execution Output Console & RPC Frames */}
      <div className="lg:col-span-7 space-y-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 min-h-[480px] flex flex-col justify-between">
          {/* Console Header */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-semibold text-white tracking-tight">
                  {t.testResults}
                </h4>
                {executionResult && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-mono ${
                      executionResult.success ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {executionResult.success ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5" />
                    )}
                    <span>{executionResult.success ? '200 OK' : 'EXECUTION_FAILED'}</span>
                  </span>
                )}
              </div>

              {/* Segmented Output Format Tabs */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    viewMode === 'table'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('json')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    viewMode === 'json'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => setViewMode('rpc')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    viewMode === 'rpc'
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  JSON-RPC 2.0
                </button>
              </div>
            </div>

            {/* Execution Content */}
            {!executionResult ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Code2 className="h-10 w-10 text-slate-700 mb-3" />
                <p className="text-xs text-slate-400 font-medium">
                  {lang === 'ar'
                    ? 'اضغط على زر التنفيذ بالأعلى لبدء استدعاء الأداة المباشر'
                    : 'Click "Execute via MCP Protocol" to invoke the tool'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {lang === 'ar'
                    ? 'سيتم تتبع زمن الاستجابة وإطارات البروتوكول اللحظية'
                    : 'Latency and full Model Context Protocol frames will appear here.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Result metadata banner */}
                <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/70 border border-slate-850 px-3 py-2 rounded-lg font-mono tabular-nums">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>{t.latency}:</span>
                      <strong className="text-white">{executionResult.executionTimeMs}ms</strong>
                    </span>
                    <span>·</span>
                    <span>
                      {lang === 'ar' ? 'الأداة:' : 'Tool:'} <span className="text-emerald-400">{executionResult.toolName}</span>
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(
                          viewMode === 'rpc' ? executionResult.protocolResponse : executionResult.data,
                          null,
                          2
                        )
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition-colors"
                  >
                    {hasCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{hasCopied ? t.copied : t.copyCode}</span>
                  </button>
                </div>

                {/* Error Banner if any */}
                {executionResult.error && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                    {executionResult.error}
                  </div>
                )}

                {/* VIEW 1: Table View */}
                {viewMode === 'table' && rows && rows.length > 0 && tableColumns.length > 0 && (
                  <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-x-auto max-h-[380px]">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0">
                        <tr>
                          {tableColumns.map(col => (
                            <th key={col} className="px-3 py-2.5 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 font-mono tabular-nums">
                        {rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                            {tableColumns.map(col => {
                              const val = row[col];
                              return (
                                <td key={col} className="px-3 py-2 whitespace-nowrap text-slate-200">
                                  {val !== null && typeof val === 'object'
                                    ? JSON.stringify(val)
                                    : String(val !== undefined ? val : '')}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* VIEW 2: Formatted JSON */}
                {(viewMode === 'json' || (!rows && viewMode === 'table')) && (
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 max-h-[380px] overflow-y-auto">
                    <pre className="text-xs font-mono text-emerald-300/95 whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(executionResult.data, null, 2)}
                    </pre>
                  </div>
                )}

                {/* VIEW 3: Raw JSON-RPC 2.0 Protocol Frame */}
                {viewMode === 'rpc' && (
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 max-h-[380px] overflow-y-auto">
                    <div className="text-[10px] text-slate-500 font-mono mb-2 uppercase tracking-wider">
                      Model Context Protocol Wire Payload (tools/call response)
                    </div>
                    <pre className="text-xs font-mono text-sky-300/95 whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(executionResult.protocolResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-800/60 pt-3 flex items-center justify-between">
            <span>FastMCP JSON-RPC Dispatcher</span>
            <span>Zero Server Restarts Needed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
