'use client';

import React, { useState, useEffect } from 'react';
import { DynamicMCPTool, ExecutionType, ToolCategory, JSONSchemaProperty } from '@/lib/mcp-types';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { X, Plus, Trash2, Play, Check, Database, Globe, Code2, AlertCircle } from 'lucide-react';

interface ToolEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tool: Partial<DynamicMCPTool> & { name: string }) => Promise<void>;
  initialTool?: DynamicMCPTool | null;
  lang: Language;
}

interface ParamItem {
  id: string;
  name: string;
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array';
  description: string;
  required: boolean;
  defaultValue?: string;
  enumOptions?: string;
}

export const ToolEditorModal: React.FC<ToolEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTool,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = useState<'config' | 'schema' | 'logic' | 'preview'>('config');
  const [name, setName] = useState(() => initialTool ? initialTool.name : 'query_custom_data');
  const [titleAr, setTitleAr] = useState(() => initialTool ? initialTool.titleAr || '' : 'استعلام مخصص جديد');
  const [titleEn, setTitleEn] = useState(() => initialTool ? initialTool.titleEn || '' : 'New Custom Dynamic Tool');
  const [descAr, setDescAr] = useState(() => initialTool ? initialTool.descriptionAr || '' : 'استعلام مخصص يجلب بيانات محددة من قاعدة البيانات بناء على مدخلات المستخدم.');
  const [descEn, setDescEn] = useState(() => initialTool ? initialTool.descriptionEn || '' : 'Custom dynamic tool executing against centralized database tables.');
  const [category, setCategory] = useState<ToolCategory>(() => initialTool ? initialTool.category : 'DATABASE_SQL');
  const [executionType, setExecutionType] = useState<ExecutionType>(() => initialTool ? initialTool.executionType : 'sql');
  const [version, setVersion] = useState(() => initialTool ? initialTool.version || '1.0.0' : '1.0.0');

  // Schema properties list
  const [paramsList, setParamsList] = useState<ParamItem[]>(() => {
    if (initialTool) {
      const props = initialTool.inputSchema?.properties || {};
      const requiredArr = initialTool.inputSchema?.required || [];
      return Object.entries(props).map(([propName, propDef]) => ({
        id: propName,
        name: propName,
        type: propDef.type as any,
        description: propDef.description || '',
        required: requiredArr.includes(propName),
        defaultValue: propDef.default !== undefined ? String(propDef.default) : '',
        enumOptions: propDef.enum ? propDef.enum.join(', ') : '',
      }));
    }
    return [
      {
        id: 'limit',
        name: 'limit',
        type: 'integer',
        description: 'Max records count',
        required: false,
        defaultValue: '10',
      },
    ];
  });

  // Execution Configs
  const [sqlQuery, setSqlQuery] = useState(() => initialTool?.executionConfig.sql?.query || 'SELECT * FROM customers WHERE lifetime_spend > :min_spend LIMIT :limit;');
  const [httpUrl, setHttpUrl] = useState(() => initialTool?.executionConfig.http?.url || 'https://api.internal/v1/data');
  const [httpMethod, setHttpMethod] = useState<'GET' | 'POST'>(() => (initialTool?.executionConfig.http?.method as any) || 'GET');
  const [scriptCode, setScriptCode] = useState(() => initialTool?.executionConfig.script?.code || '// Access arguments via args and database via db\nreturn { status: "success", count: db.customers.length };');

  // Dry Run state
  const [dryRunArgs, setDryRunArgs] = useState<Record<string, any>>({});
  const [dryRunResult, setDryRunResult] = useState<any>(null);
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddParam = () => {
    const newId = `param_${Date.now()}`;
    setParamsList([
      ...paramsList,
      {
        id: newId,
        name: `param_${paramsList.length + 1}`,
        type: 'string',
        description: '',
        required: false,
      },
    ]);
  };

  const handleRemoveParam = (id: string) => {
    setParamsList(paramsList.filter(p => p.id !== id));
  };

  const handleUpdateParam = (id: string, updates: Partial<ParamItem>) => {
    setParamsList(paramsList.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const constructSchema = () => {
    const properties: Record<string, JSONSchemaProperty> = {};
    const required: string[] = [];

    for (const p of paramsList) {
      if (!p.name.trim()) continue;
      const propDef: JSONSchemaProperty = {
        type: p.type,
        description: p.description,
      };
      if (p.enumOptions && p.enumOptions.trim()) {
        propDef.enum = p.enumOptions.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (p.defaultValue !== undefined && p.defaultValue !== '') {
        if (p.type === 'number' || p.type === 'integer') {
          propDef.default = Number(p.defaultValue);
        } else if (p.type === 'boolean') {
          propDef.default = p.defaultValue === 'true';
        } else {
          propDef.default = p.defaultValue;
        }
      }
      properties[p.name.trim()] = propDef;
      if (p.required) {
        required.push(p.name.trim());
      }
    }

    return {
      type: 'object' as const,
      properties,
      required,
      additionalProperties: false,
    };
  };

  const handleSave = async () => {
    setErrorMsg('');
    const cleanName = name.trim().replace(/\s+/g, '_').toLowerCase();
    if (!cleanName) {
      setErrorMsg(lang === 'ar' ? 'اسم الأداة مطلوب' : 'Tool name is required');
      return;
    }

    const schema = constructSchema();

    const executionConfig: any = {};
    if (executionType === 'sql') {
      executionConfig.sql = {
        query: sqlQuery,
        readOnly: true,
      };
    } else if (executionType === 'http') {
      executionConfig.http = {
        url: httpUrl,
        method: httpMethod,
      };
    } else if (executionType === 'script') {
      executionConfig.script = {
        code: scriptCode,
        runtime: 'javascript',
      };
    }

    setIsSaving(true);
    try {
      await onSave({
        ...(initialTool ? { id: initialTool.id } : {}),
        name: cleanName,
        titleAr: titleAr || cleanName,
        titleEn: titleEn || cleanName,
        descriptionAr: descAr,
        descriptionEn: descEn,
        category,
        executionType,
        version,
        inputSchema: schema,
        executionConfig,
        isActive: true,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving tool');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDryRun = async () => {
    setIsDryRunning(true);
    setDryRunResult(null);
    setErrorMsg('');

    try {
      const res = await fetch('/api/mcp/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim().toLowerCase(),
          arguments: dryRunArgs,
        }),
      });
      const data = await res.json();
      setDryRunResult(data);
    } catch (err: any) {
      setDryRunResult({ error: err.message });
    } finally {
      setIsDryRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/50">
          <div>
            <h3 className="text-base font-semibold text-white">
              {initialTool
                ? lang === 'ar'
                  ? `تعديل أداة: ${initialTool.name}`
                  : `Edit Tool: ${initialTool.name}`
                : lang === 'ar'
                ? 'إنشاء أداة FastMCP جديدة بقاعدة البيانات'
                : 'Create Database-Driven FastMCP Tool'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ar'
                ? 'يتم تخزين التعريف في قاعدة البيانات وتحديثه لحظياً بدون الحاجة لإعادة تشغيل الخادم'
                : 'Stored in central database & dynamically hydrated without server restart'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/30 gap-2">
          {[
            { id: 'config', label: lang === 'ar' ? '1. الإعدادات والوصف' : '1. General & Info' },
            { id: 'schema', label: lang === 'ar' ? '2. مخطط المتغيرات Schema' : '2. Parameters Schema' },
            { id: 'logic', label: lang === 'ar' ? '3. منطق التنفيذ Execution' : '3. Execution Logic' },
            { id: 'preview', label: lang === 'ar' ? '4. فحص واختبار سريع' : '4. Dry Run' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: General Info */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t.toolName} *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. query_vip_customers"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-emerald-400 focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {lang === 'ar' ? 'المعرف الفريد لاستدعاء MCP بالنموذج' : 'Unique identifier for MCP function calls'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {lang === 'ar' ? 'الإصدار (Version)' : 'Version'}
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={e => setVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t.category}
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="DATABASE_SQL">DATABASE_SQL (قواعد بيانات)</option>
                    <option value="REST_API">REST_API (واجهات برمجية)</option>
                    <option value="BUSINESS_LOGIC">BUSINESS_LOGIC (منطق عمليات)</option>
                    <option value="SYSTEM_AUTOMATION">SYSTEM_AUTOMATION (أتمتة النظام)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t.executionType}
                  </label>
                  <select
                    value={executionType}
                    onChange={e => setExecutionType(e.target.value as any)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="sql">SQL Query (PostgreSQL / SQLite)</option>
                    <option value="http">HTTP REST API (Webhooks / Services)</option>
                    <option value="script">Dynamic Script Function (Sandboxed JS)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {lang === 'ar' ? 'العنوان بالعربية' : 'Title (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={titleAr}
                    onChange={e => setTitleAr(e.target.value)}
                    placeholder="عنوان واضح للأداة"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {lang === 'ar' ? 'العنوان بالإنجليزية' : 'Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={e => setTitleEn(e.target.value)}
                    placeholder="Clear Tool Title"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {lang === 'ar' ? 'وصف الأداة لنموذج الذكاء الاصطناعي (عربي)' : 'AI Tool Description (Arabic)'}
                </label>
                <textarea
                  rows={2}
                  value={descAr}
                  onChange={e => setDescAr(e.target.value)}
                  placeholder="اشرح بدقة متى وكيف يستدعي النموذج هذه الأداة وما الذي تعيده..."
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {lang === 'ar' ? 'وصف الأداة بالإنجليزية (LLM System Prompt)' : 'AI Tool Description (English)'}
                </label>
                <textarea
                  rows={2}
                  value={descEn}
                  onChange={e => setDescEn(e.target.value)}
                  placeholder="Explain clearly to the LLM when and how to invoke this tool..."
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Parameters Schema */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">{t.parametersSchema}</h4>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'ar'
                      ? 'حدد المتغيرات التي يطلبها الخادم من النموذج لاستدعاء الأداة بنجاح.'
                      : 'Define expected tool arguments with types and validation rules.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddParam}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t.addProperty}</span>
                </button>
              </div>

              {paramsList.length === 0 ? (
                <div className="text-center py-8 rounded-lg border border-dashed border-slate-800 text-xs text-slate-500">
                  {lang === 'ar' ? 'لا توجد متغيرات محددة (الأداة بدون مدخلات)' : 'No parameters defined (Zero-arg tool)'}
                </div>
              ) : (
                <div className="space-y-3">
                  {paramsList.map(param => (
                    <div
                      key={param.id}
                      className="p-3 rounded-lg border border-slate-850 bg-slate-950/60 space-y-2.5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-slate-400 mb-0.5">{t.propName}</label>
                          <input
                            type="text"
                            value={param.name}
                            onChange={e => handleUpdateParam(param.id, { name: e.target.value })}
                            placeholder="customer_id"
                            className="w-full rounded bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">{t.propType}</label>
                          <select
                            value={param.type}
                            onChange={e => handleUpdateParam(param.id, { type: e.target.value as any })}
                            className="w-full rounded bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="string">string</option>
                            <option value="number">number</option>
                            <option value="integer">integer</option>
                            <option value="boolean">boolean</option>
                            <option value="array">array</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 pt-4">
                          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={param.required}
                              onChange={e => handleUpdateParam(param.id, { required: e.target.checked })}
                              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                            />
                            <span>{t.propRequired}</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveParam(param.id)}
                            className="p-1 text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">{t.propDesc}</label>
                          <input
                            type="text"
                            value={param.description}
                            onChange={e => handleUpdateParam(param.id, { description: e.target.value })}
                            placeholder="e.g. Target customer ID to filter orders"
                            className="w-full rounded bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">
                            {lang === 'ar' ? 'خيارات محددة Enum (مفصولة بفواصل)' : 'Enum Values (comma-separated)'}
                          </label>
                          <input
                            type="text"
                            value={param.enumOptions || ''}
                            onChange={e => handleUpdateParam(param.id, { enumOptions: e.target.value })}
                            placeholder="Platinum, Gold, Silver"
                            className="w-full rounded bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Execution Logic */}
          {activeTab === 'logic' && (
            <div className="space-y-4">
              {executionType === 'sql' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-300">
                      {t.sqlQuery}
                    </label>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      {t.sqlHint}
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={sqlQuery}
                    onChange={e => setSqlQuery(e.target.value)}
                    placeholder="SELECT * FROM customers WHERE tier = :tier LIMIT :limit;"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
                  />
                  <div className="text-[11px] text-slate-500 space-y-1">
                    <span className="font-semibold text-slate-400 block">
                      {lang === 'ar' ? 'الجداول المتاحة في قاعدة البيانات:' : 'Available Database Tables:'}
                    </span>
                    <p className="font-mono">customers · orders · products · support_tickets</p>
                  </div>
                </div>
              )}

              {executionType === 'http' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        {t.httpMethod}
                      </label>
                      <select
                        value={httpMethod}
                        onChange={e => setHttpMethod(e.target.value as any)}
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        {t.httpUrl}
                      </label>
                      <input
                        type="text"
                        value={httpUrl}
                        onChange={e => setHttpUrl(e.target.value)}
                        placeholder="https://api.domain.com/v1/data?param={param_name}"
                        className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-sky-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {executionType === 'script' && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-300">
                    {t.scriptCode}
                  </label>
                  <textarea
                    rows={8}
                    value={scriptCode}
                    onChange={e => setScriptCode(e.target.value)}
                    placeholder="return { result: args.amount * 1.15 };"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs font-mono text-purple-300 focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 block">
                    {lang === 'ar'
                      ? 'البيئة تتيح كائن args للمدخلات وكائن db للوصول إلى بيانات الجداول الحية.'
                      : 'Script has access to arguments via args and database tables via db.'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Dry Run Preview */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-white mb-1">
                  {lang === 'ar' ? 'اختبار المعاينة السريعة (Dry Run)' : 'Quick Dry Run Preview'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ar'
                    ? 'جرب تنفيذ الأداة قبل تثبيتها للتأكد من صحة استعلام SQL أو منطق الكود البرمجي.'
                    : 'Execute the logic against sample data to verify parameters before saving.'}
                </p>
              </div>

              {paramsList.length > 0 && (
                <div className="space-y-2 rounded-lg bg-slate-950/70 border border-slate-850 p-3">
                  <span className="text-[11px] font-semibold text-slate-300 block">
                    {lang === 'ar' ? 'مدخلات التجربة (Test Arguments):' : 'Test Arguments:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {paramsList.map(p => (
                      <div key={p.id}>
                        <label className="block text-[10px] text-slate-400 mb-0.5">
                          {p.name} ({p.type})
                        </label>
                        <input
                          type="text"
                          defaultValue={p.defaultValue || ''}
                          onChange={e =>
                            setDryRunArgs({
                              ...dryRunArgs,
                              [p.name]: p.type === 'number' || p.type === 'integer' ? Number(e.target.value) : e.target.value,
                            })
                          }
                          className="w-full rounded bg-slate-900 border border-slate-800 px-2 py-1 text-xs text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleDryRun}
                disabled={isDryRunning}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
              >
                <Play className="h-3.5 w-3.5" />
                <span>{isDryRunning ? t.executing : t.dryRun}</span>
              </button>

              {dryRunResult && (
                <div className="rounded-lg bg-slate-950 border border-slate-800 p-3">
                  <span className="text-[11px] font-semibold text-emerald-400 block mb-1">
                    {t.testResults}
                  </span>
                  <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
                    {JSON.stringify(dryRunResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            {t.cancel}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 disabled:opacity-50 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>{isSaving ? '...' : t.saveTool}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
