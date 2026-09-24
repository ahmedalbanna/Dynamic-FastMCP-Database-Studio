'use client';

import React from 'react';
import Image from 'next/image';
import { Language } from '@/lib/translations';
import { Database, Server, Bot, CheckCircle, XCircle, Check, X } from 'lucide-react';

interface ArchitectureModalProps {
  lang: Language;
  theme?: 'dark' | 'light';
}

export const ArchitectureView: React.FC<ArchitectureModalProps> = ({ lang, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Visual Architectural Diagram Banner */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-2xl transition-colors duration-200 ${
          isDark
            ? 'border-slate-800 bg-slate-900/60'
            : 'border-slate-200 bg-white shadow-sm'
        }`}
      >
        <div className="relative aspect-video w-full max-h-[380px] bg-slate-950">
          <Image
            src="/assets/images/mcp_architecture_diagram.jpg"
            alt="FastMCP Database-Driven Dynamic Architecture"
            fill
            className="object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
            referrerPolicy="no-referrer"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="text-xs font-mono text-emerald-400 font-semibold tracking-wider uppercase block mb-1">
                Decoupled Architecture Blueprint
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {lang === 'ar'
                  ? 'معمارية FastMCP الموجهة بقواعد البيانات'
                  : 'Database-Driven FastMCP Tool Architecture'}
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-300 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-700 hidden sm:block">
              Zero Server Restarts · Live Hydration
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <p
            className={`text-sm leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            {lang === 'ar'
              ? 'في النماذج التقليدية لبروتوكول MCP، تتطلب أي إضافة أو تعديل على منطق الأدوات (Tool Definitions) تعديل الكود المصدري وإعادة نشر أو تشغيل خادم بايثون (Server Restart)، مما يتسبب في انقطاع جلسات المساعد الذكي. تقوم هذه المعمارية المبتكرة بفصل منطق الأدوات عن الكود المصدري وتخزينها في قاعدة بيانات مركزية، مما يتيح التعديل اللحظي وإدارة صلاحيات النماذج بسلاسة تامة.'
              : 'Traditional Model Context Protocol (MCP) implementations couple tool definitions directly with application source code. Any update to a SQL query, schema parameter, or API URL forces code edits, PR reviews, and server restarts. This database-driven architecture decouples tool logic completely into a central database, enabling instantaneous visual management, dynamic hydration in FastMCP, and zero-downtime scaling.'}
          </p>

          {/* 3-Step Flow Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div
              className={`rounded-xl border p-4 space-y-2 transition-colors duration-200 ${
                isDark
                  ? 'border-slate-800 bg-slate-950'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div
                className={`flex items-center gap-2 text-xs font-semibold ${
                  isDark ? 'text-emerald-400' : 'text-emerald-700'
                }`}
              >
                <Database className="h-4 w-4" />
                <span>{lang === 'ar' ? '1. قاعدة بيانات الأدوات' : '1. Central Tool Database'}</span>
              </div>
              <p
                className={`text-xs leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {lang === 'ar'
                  ? 'يتم حفظ أسماء الأدوات، مخططات JSON Schema، واستعلامات SQL أو الأكواد البرمجية كسجلات بيانات منظمة.'
                  : 'Tool names, JSON schemas, parameterized queries, and scripts are stored as queryable database records.'}
              </p>
            </div>

            <div
              className={`rounded-xl border p-4 space-y-2 transition-colors duration-200 ${
                isDark
                  ? 'border-slate-800 bg-slate-950'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div
                className={`flex items-center gap-2 text-xs font-semibold ${
                  isDark ? 'text-sky-400' : 'text-sky-700'
                }`}
              >
                <Server className="h-4 w-4" />
                <span>{lang === 'ar' ? '2. خادم FastMCP الديناميكي' : '2. FastMCP Dynamic Engine'}</span>
              </div>
              <p
                className={`text-xs leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {lang === 'ar'
                  ? 'يقوم الخادم بقراءة الأدوات النشطة من قاعدة البيانات وتوليد دوال التنفيذ لحظياً دون إعادة تشغيل الخدمة.'
                  : 'FastMCP loads active tools, constructs executable closures dynamically, and emits listChanged events.'}
              </p>
            </div>

            <div
              className={`rounded-xl border p-4 space-y-2 transition-colors duration-200 ${
                isDark
                  ? 'border-slate-800 bg-slate-950'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div
                className={`flex items-center gap-2 text-xs font-semibold ${
                  isDark ? 'text-purple-400' : 'text-purple-700'
                }`}
              >
                <Bot className="h-4 w-4" />
                <span>{lang === 'ar' ? '3. وكلاء الذكاء الاصطناعي' : '3. AI Agents & MCP Clients'}</span>
              </div>
              <p
                className={`text-xs leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {lang === 'ar'
                  ? 'يكتشف Gemini أو Claude الأدوات الجديدة تلقائياً عبر بروتوكول MCP وينفذها بدقة متناهية.'
                  : 'Gemini, Claude, or Cursor discover the new tools automatically through standard MCP protocol frames.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison: Static vs. Database-Driven */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* The Old Static Approach */}
        <div
          className={`rounded-xl border p-6 space-y-4 transition-colors duration-200 ${
            isDark
              ? 'border-rose-900/30 bg-slate-950/80'
              : 'border-rose-200 bg-rose-50/40'
          }`}
        >
          <div
            className={`flex items-center gap-2 text-sm font-semibold ${
              isDark ? 'text-rose-400' : 'text-rose-700'
            }`}
          >
            <XCircle className="h-4 w-4" />
            <span>{lang === 'ar' ? 'الطريقة التقليدية (Static Code)' : 'Traditional Static Approach'}</span>
          </div>

          <ul
            className={`space-y-2.5 text-xs ${
              isDark ? 'text-slate-400' : 'text-slate-700'
            }`}
          >
            <li className="flex items-start gap-2">
              <X className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
              <span>
                {lang === 'ar'
                  ? 'كل أداة جديدة تتطلب كتابة كود بايثون صلب (@mcp.tool) داخل ملف الخادم.'
                  : 'Hardcoded python functions decorated with @mcp.tool directly in source.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <X className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
              <span>
                {lang === 'ar'
                  ? 'تعديل استعلام SQL أو إضافة متغير مدخل يستلزم إعادة تشغيل خادم FastMCP بالكامل.'
                  : 'Updating a query parameter forces server restarts, terminating live client SSE sessions.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <X className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
              <span>
                {lang === 'ar'
                  ? 'صعوبة منح مدراء المنتجات أو المطورين صلاحية إضافة أدوات مرئياً بدون صلاحيات Git/CI-CD.'
                  : 'Requires full code deployments, Git PR cycles, and engineering overhead.'}
              </span>
            </li>
          </ul>
        </div>

        {/* The Dynamic Database Approach */}
        <div
          className={`rounded-xl border p-6 space-y-4 transition-colors duration-200 ${
            isDark
              ? 'border-emerald-900/40 bg-slate-950/80'
              : 'border-emerald-200 bg-emerald-50/40'
          }`}
        >
          <div
            className={`flex items-center gap-2 text-sm font-semibold ${
              isDark ? 'text-emerald-400' : 'text-emerald-700'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            <span>
              {lang === 'ar' ? 'الحل الموجه بقاعدة البيانات (Dynamic FastMCP)' : 'Dynamic Database-Driven Solution'}
            </span>
          </div>

          <ul
            className={`space-y-2.5 text-xs ${
              isDark ? 'text-slate-300' : 'text-slate-800'
            }`}
          >
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                {lang === 'ar'
                  ? 'تخزين كافة الأدوات في قاعدة بيانات مركزية (PostgreSQL / SQLite).'
                  : 'All tool definitions stored centrally in relational database records.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                {lang === 'ar'
                  ? 'واجهة إدارية مرئية متكاملة لإنشاء وتعديل واختبار الأدوات بدون لمس كود البايثون.'
                  : 'Visual Admin UI to create, update, and test tools with interactive JSON Schema builder.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                {lang === 'ar'
                  ? 'تحميل الأدوات لحظياً وإشعار عملاء MCP عبر listChanged دون انقطاع الخدمة.'
                  : 'Hot-reload & runtime hydration without server restarts or connection drops.'}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
