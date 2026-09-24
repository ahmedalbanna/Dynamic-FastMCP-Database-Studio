export type ExecutionType = 'sql' | 'http' | 'script';

export type ToolCategory = 'DATABASE_SQL' | 'REST_API' | 'BUSINESS_LOGIC' | 'SYSTEM_AUTOMATION';

export interface JSONSchemaProperty {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
  description?: string;
  enum?: string[];
  default?: any;
  items?: {
    type: 'string' | 'number' | 'integer' | 'boolean';
  };
}

export interface JSONSchema {
  type: 'object';
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface SQLConfig {
  query: string;
  databaseTable?: string;
  readOnly?: boolean;
}

export interface HTTPConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  bodyTemplate?: string;
}

export interface ScriptConfig {
  code: string;
  runtime: 'javascript' | 'python_sandbox';
}

export interface ExecutionConfig {
  sql?: SQLConfig;
  http?: HTTPConfig;
  script?: ScriptConfig;
}

export interface ToolStats {
  totalCalls: number;
  successCount: number;
  failCount: number;
  avgLatencyMs: number;
  lastCalledAt?: string;
}

export interface DynamicMCPTool {
  id: string;
  name: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: ToolCategory;
  executionType: ExecutionType;
  inputSchema: JSONSchema;
  executionConfig: ExecutionConfig;
  isActive: boolean;
  version: string;
  tags: string[];
  stats: ToolStats;
  createdAt: string;
  updatedAt: string;
}

export interface ToolExecutionRequest {
  toolName: string;
  arguments: Record<string, any>;
}

export interface ToolExecutionResult {
  success: boolean;
  toolName: string;
  data?: any;
  error?: string;
  executionTimeMs: number;
  timestamp: string;
  protocolResponse?: {
    jsonrpc: string;
    id: string | number;
    result?: {
      content: Array<{
        type: string;
        text: string;
      }>;
      isError?: boolean;
    };
    error?: {
      code: number;
      message: string;
      data?: any;
    };
  };
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool_call' | 'tool_result';
  content: string;
  timestamp: string;
  toolDetails?: {
    toolName: string;
    args: Record<string, any>;
    result?: any;
    latencyMs?: number;
  };
}
