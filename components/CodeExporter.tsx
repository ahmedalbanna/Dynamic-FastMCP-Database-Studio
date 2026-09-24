'use client';

import React, { useState } from 'react';
import { DynamicMCPTool } from '@/lib/mcp-types';
import { generateFastMCPPythonCode } from '@/lib/tool-storage';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { Copy, Check, Download, Server, FileCode, Terminal } from 'lucide-react';

interface CodeExporterProps {
  tools: DynamicMCPTool[];
  lang: Language;
  theme?: 'dark' | 'light';
}

export const CodeExporter: React.FC<CodeExporterProps> = ({ tools, lang, theme = 'dark' }) => {
  const t = TRANSLATIONS[lang];
  const isDark = theme === 'dark';
  const [selectedFile, setSelectedFile] = useState<'server' | 'config' | 'reqs'>('server');
  const [hasCopied, setHasCopied] = useState(false);

  const pythonCode = generateFastMCPPythonCode(tools);

  const claudeConfig = JSON.stringify(
    {
      mcpServers: {
        'enterprise-dynamic-database': {
          command: 'python',
          args: ['server.py'],
          env: {
            DATABASE_URL: 'postgresql://user:password@localhost:5432/mcp_production',
          },
        },
      },
    },
    null,
    2
  );

  const reqsTxt = `# FastMCP Dynamic Tool Management Framework
fastmcp>=0.1.0
sqlalchemy>=2.0.0
pydantic>=2.0.0
httpx>=0.27.0
uvicorn>=0.30.0
`;

  const getActiveContent = () => {
    switch (selectedFile) {
      case 'server':
        return pythonCode;
      case 'config':
        return claudeConfig;
      case 'reqs':
        return reqsTxt;
    }
  };

  const getFileName = () => {
    switch (selectedFile) {
      case 'server':
        return 'server.py';
      case 'config':
        return 'claude_desktop_config.json';
      case 'reqs':
        return 'requirements.txt';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([getActiveContent()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFileName();
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div
        className={`rounded-xl border p-6 transition-colors duration-200 ${
          isDark
            ? 'border-slate-800 bg-slate-900/60'
            : 'border-slate-200 bg-white shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3
              className={`text-base font-semibold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {lang === 'ar'
                ? 'كود خادم FastMCP بايثون الموجه بقاعدة البيانات'
                : 'Python FastMCP Production Server Code'}
            </h3>
            <p
              className={`text-xs mt-1 max-w-2xl leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {lang === 'ar'
                ? 'خادم بايثون مخصص يقوم بتحميل كافة الأدوات والاستعلامات ومخططات JSON ديناميكياً من قاعدة البيانات المركزية. يتيح إضافة وتعديل أدوات الذكاء الاصطناعي دون الحاجة لإعادة تشغيل الخادم على الإطلاق!'
                : 'Decoupled Python server utilizing the FastMCP framework. Reads tool definitions directly from the central database on-demand, allowing zero-restart tool deployment for Claude Desktop, Cursor, and AI Agents.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors duration-200 cursor-pointer ${
                isDark
                  ? 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border-slate-700/60'
                  : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200 shadow-2xs'
              }`}
            >
              {hasCopied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{hasCopied ? t.copied : t.copyCode}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors duration-200 cursor-pointer shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download {getFileName()}</span>
            </button>
          </div>
        </div>
      </div>

      {/* File Navigation Tabs */}
      <div
        className={`flex items-center gap-1 p-1 rounded-xl border w-fit transition-colors duration-200 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}
      >
        <button
          onClick={() => setSelectedFile('server')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors duration-200 cursor-pointer ${
            selectedFile === 'server'
              ? isDark
                ? 'bg-slate-800 text-emerald-400 shadow-sm font-semibold'
                : 'bg-white text-emerald-700 shadow-xs font-semibold'
              : isDark
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCode className="h-3.5 w-3.5" />
          <span>server.py</span>
        </button>
        <button
          onClick={() => setSelectedFile('config')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors duration-200 cursor-pointer ${
            selectedFile === 'config'
              ? isDark
                ? 'bg-slate-800 text-sky-400 shadow-sm font-semibold'
                : 'bg-white text-sky-700 shadow-xs font-semibold'
              : isDark
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>claude_desktop_config.json</span>
        </button>
        <button
          onClick={() => setSelectedFile('reqs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors duration-200 cursor-pointer ${
            selectedFile === 'reqs'
              ? isDark
                ? 'bg-slate-800 text-purple-400 shadow-sm font-semibold'
                : 'bg-white text-purple-700 shadow-xs font-semibold'
              : isDark
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Server className="h-3.5 w-3.5" />
          <span>requirements.txt</span>
        </button>
      </div>

      {/* Code Editor Preview Box */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-slate-300 font-semibold">{getFileName()}</span>
          </div>
          <span className="text-[11px] text-emerald-400">FastMCP Framework Ready</span>
        </div>

        <div className="p-4 max-h-[520px] overflow-y-auto">
          <pre className="text-xs font-mono text-slate-200 whitespace-pre leading-relaxed selection:bg-emerald-500/30">
            {getActiveContent()}
          </pre>
        </div>
      </div>
    </div>
  );
};
