'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DynamicMCPTool, AgentChatMessage } from '@/lib/mcp-types';
import { Language, TRANSLATIONS } from '@/lib/translations';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Database,
  ArrowRight,
  Clock,
  Terminal,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';

interface AgentSandboxProps {
  tools: DynamicMCPTool[];
  lang: Language;
}

export const AgentSandbox: React.FC<AgentSandboxProps> = ({ tools, lang }) => {
  const t = TRANSLATIONS[lang];
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        lang === 'ar'
          ? 'مرحباً بك! أنا مساعد ذكي متصل بقاعدة أدوات FastMCP الديناميكية. يمكنك أن تطلب مني الاستعلام عن العملاء، أو فحص المخزون، أو حساب الخصومات البرمجية، أو تفقد تذاكر الدعم الفني، وسأقوم باستدعاء الأداة المناسبة مباشرة من قاعدة البيانات!'
          : 'Hello! I am an AI Assistant connected to your dynamic FastMCP tool registry. You can ask me to inspect enterprise customers, check low-stock inventory, compute custom loyalty discounts, or monitor support tickets—I will call the right database tool dynamically!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const samplePrompts =
    lang === 'ar'
      ? [
          'استعلم عن أكبر العملاء إنفاقاً في فئة Platinum',
          'هل هناك منتجات في المخزون انخفضت عن حد إعادة الطلب؟',
          'احسب الخصم المستحق للعميل CUST-102 لسلة مشتريات بقيمة 3200 دولار',
          'اعرض لي تذاكر الدعم الفني المفتوحة ذات الأهمية القصوى CRITICAL',
        ]
      : [
          'List top enterprise customers in the Platinum tier',
          'Check which inventory products are below reorder level',
          'Calculate loyalty discount for customer CUST-102 with a $3,200 cart',
          'Show open support tickets with CRITICAL priority and SLA hours',
        ];

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    const userMsg: AgentChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          conversationHistory: historyPayload,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `⚠️ Error: ${data.error || 'Failed to communicate with AI agent.'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        return;
      }

      const assistantMsg: AgentChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolDetails: data.toolInvoked
          ? {
              toolName: data.toolInvoked.name,
              args: data.toolInvoked.arguments,
              result: data.toolInvoked.result,
              latencyMs: data.toolInvoked.latencyMs,
            }
          : undefined,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Network error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          lang === 'ar'
            ? 'تمت إعادة تهيئة المحادثة. يمكنك توجيه أي سؤال لاختبار استدعاء الأدوات الحية.'
            : 'Conversation reset. Ask any question to test live tool execution against the database.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[740px] rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/70">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              {t.agentHeadline}
            </h3>
            <p className="text-[11px] text-slate-400">
              Gemini 3.8 Flash · Model Context Protocol · {tools.filter(t => t.isActive).length} active tools
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Reset Conversation"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{lang === 'ar' ? 'مسح المحادثة' : 'Clear Chat'}</span>
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="border-b border-slate-800/80 px-6 py-2.5 bg-slate-950/40 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-medium text-slate-400 shrink-0">
          {t.suggestedQueries}
        </span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="shrink-0 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-emerald-400 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-md transition-colors whitespace-nowrap cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
            }`}
          >
            {msg.role !== 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mt-1">
                <Bot className="h-3.5 w-3.5" />
              </div>
            )}

            <div
              className={`rounded-2xl p-4 space-y-2.5 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {/* If a tool was invoked, display rich execution step */}
              {msg.toolDetails && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-2 text-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono text-emerald-400 text-[11px]">
                      <Terminal className="h-3.5 w-3.5" />
                      <span>
                        {lang === 'ar' ? 'تم استدعاء أداة:' : 'Invoked Tool:'} {msg.toolDetails.toolName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 tabular-nums">
                        <Clock className="h-3 w-3" />
                        {msg.toolDetails.latencyMs}ms
                      </span>
                      <button
                        onClick={() =>
                          setExpandedToolId(expandedToolId === msg.id ? null : msg.id)
                        }
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        {expandedToolId === msg.id ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Arguments summary */}
                  <div className="text-[11px] font-mono text-slate-300">
                    <span className="text-slate-400">args: </span>
                    {JSON.stringify(msg.toolDetails.args)}
                  </div>

                  {/* Expanded payload */}
                  {expandedToolId === msg.id && (
                    <div className="mt-2 pt-2 border-t border-emerald-500/20 max-h-48 overflow-y-auto">
                      <pre className="text-[10px] font-mono text-slate-300 leading-normal">
                        {JSON.stringify(msg.toolDetails.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Main text content */}
              <div className="whitespace-pre-wrap leading-relaxed text-sm">
                {msg.content}
              </div>

              <div
                className={`text-[10px] font-mono ${
                  msg.role === 'user' ? 'text-slate-800' : 'text-slate-500'
                } text-right`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-400 text-slate-950 font-bold text-xs mt-1">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 mr-auto max-w-sm">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Bot className="h-3.5 w-3.5 animate-pulse" />
            </div>
            <div className="rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>
                {lang === 'ar'
                  ? 'جاري تحليل السؤال واستدعاء أدوات قاعدة البيانات...'
                  : 'Analyzing prompt and executing dynamic tools...'}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Prompt Box */}
      <div className="border-t border-slate-800 p-4 bg-slate-950/80">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            disabled={isLoading}
            placeholder={t.askAgentPlaceholder}
            className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="flex items-center justify-center h-10 px-5 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
