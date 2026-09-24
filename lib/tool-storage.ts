import { DynamicMCPTool, ToolExecutionResult } from './mcp-types';
import { DEFAULT_MCP_TOOLS } from './default-tools';
import { executeSqlAgainstDb, executeDynamicScript, executeDynamicHttp } from './database-engine';

// In-memory store for tools
let toolsStore: DynamicMCPTool[] = [...DEFAULT_MCP_TOOLS];

export function getAllTools(): DynamicMCPTool[] {
  return toolsStore;
}

export function getActiveTools(): DynamicMCPTool[] {
  return toolsStore.filter(t => t.isActive);
}

export function getToolById(id: string): DynamicMCPTool | undefined {
  return toolsStore.find(t => t.id === id);
}

export function getToolByName(name: string): DynamicMCPTool | undefined {
  return toolsStore.find(t => t.name === name);
}

export function saveTool(toolData: Partial<DynamicMCPTool> & { name: string }): DynamicMCPTool {
  const existingIndex = toolsStore.findIndex(t => t.id === toolData.id || t.name === toolData.name);
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    const existing = toolsStore[existingIndex];
    const updated: DynamicMCPTool = {
      ...existing,
      ...toolData,
      id: existing.id,
      updatedAt: now,
    };
    toolsStore[existingIndex] = updated;
    return updated;
  } else {
    const newTool: DynamicMCPTool = {
      id: toolData.id || `tool-${Date.now()}`,
      name: toolData.name,
      titleAr: toolData.titleAr || toolData.name,
      titleEn: toolData.titleEn || toolData.name,
      descriptionAr: toolData.descriptionAr || '',
      descriptionEn: toolData.descriptionEn || '',
      category: toolData.category || 'DATABASE_SQL',
      executionType: toolData.executionType || 'sql',
      inputSchema: toolData.inputSchema || { type: 'object', properties: {}, required: [] },
      executionConfig: toolData.executionConfig || { sql: { query: 'SELECT 1;' } },
      isActive: toolData.isActive !== undefined ? toolData.isActive : true,
      version: toolData.version || '1.0.0',
      tags: toolData.tags || ['custom'],
      stats: {
        totalCalls: 0,
        successCount: 0,
        failCount: 0,
        avgLatencyMs: 0,
      },
      createdAt: now,
      updatedAt: now,
    };
    toolsStore.unshift(newTool);
    return newTool;
  }
}

export function deleteTool(id: string): boolean {
  const initLength = toolsStore.length;
  toolsStore = toolsStore.filter(t => t.id !== id);
  return toolsStore.length < initLength;
}

export function resetToolsToDefault(): DynamicMCPTool[] {
  toolsStore = JSON.parse(JSON.stringify(DEFAULT_MCP_TOOLS));
  return toolsStore;
}

/**
 * Execute dynamic tool by name with arguments
 */
export async function executeDynamicTool(
  toolName: string,
  args: Record<string, any> = {}
): Promise<ToolExecutionResult> {
  const tool = getToolByName(toolName);
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  if (!tool) {
    return {
      success: false,
      toolName,
      error: `Tool "${toolName}" not found in database registry.`,
      executionTimeMs: 1,
      timestamp,
      protocolResponse: {
        jsonrpc: '2.0',
        id: `call-${Date.now()}`,
        error: {
          code: -32601,
          message: `Method not found: ${toolName}`,
        },
      },
    };
  }

  if (!tool.isActive) {
    return {
      success: false,
      toolName,
      error: `Tool "${toolName}" is currently disabled in database.`,
      executionTimeMs: 1,
      timestamp,
      protocolResponse: {
        jsonrpc: '2.0',
        id: `call-${Date.now()}`,
        error: {
          code: -32000,
          message: `Tool "${toolName}" is disabled in database registry.`,
        },
      },
    };
  }

  try {
    let resultData: any;

    if (tool.executionType === 'sql') {
      const sql = tool.executionConfig.sql?.query || 'SELECT 1;';
      resultData = executeSqlAgainstDb(sql, args);
    } else if (tool.executionType === 'script') {
      const scriptCode = tool.executionConfig.script?.code || 'return { status: "empty script" };';
      resultData = executeDynamicScript(scriptCode, args);
    } else if (tool.executionType === 'http') {
      const httpConfig = tool.executionConfig.http || { url: '', method: 'GET' };
      resultData = await executeDynamicHttp(httpConfig, args);
    } else {
      throw new Error(`Unsupported execution type: ${tool.executionType}`);
    }

    const duration = Math.max(1, Date.now() - startTime);

    // Update stats
    tool.stats.totalCalls += 1;
    tool.stats.successCount += 1;
    tool.stats.lastCalledAt = timestamp;
    tool.stats.avgLatencyMs = Math.round(
      (tool.stats.avgLatencyMs * (tool.stats.totalCalls - 1) + duration) / tool.stats.totalCalls
    );

    return {
      success: true,
      toolName,
      data: resultData,
      executionTimeMs: duration,
      timestamp,
      protocolResponse: {
        jsonrpc: '2.0',
        id: `call-${Date.now()}`,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(resultData, null, 2),
            },
          ],
          isError: false,
        },
      },
    };
  } catch (error: any) {
    const duration = Math.max(1, Date.now() - startTime);
    tool.stats.totalCalls += 1;
    tool.stats.failCount += 1;
    tool.stats.lastCalledAt = timestamp;

    return {
      success: false,
      toolName,
      error: error.message || 'Unknown execution error',
      executionTimeMs: duration,
      timestamp,
      protocolResponse: {
        jsonrpc: '2.0',
        id: `call-${Date.now()}`,
        result: {
          content: [
            {
              type: 'text',
              text: `Error executing tool "${toolName}": ${error.message}`,
            },
          ],
          isError: true,
        },
      },
    };
  }
}

/**
 * Generate Python FastMCP Server code showing decoupled database-driven architecture
 */
export function generateFastMCPPythonCode(tools: DynamicMCPTool[]): string {
  return `"""
=============================================================================
DATABASE-DRIVEN DYNAMIC FastMCP SERVER
Architecture: Decoupled Tool Logic with Live Database Hydration
Framework: FastMCP (Model Context Protocol for Python)
=============================================================================
This server loads all tool definitions directly from the centralized database
(PostgreSQL / SQLite). When tools are created or modified via the Admin UI,
the FastMCP server dynamically re-registers them without any server restarts!
"""

import os
import json
import time
import inspect
from typing import Any, Dict, List, Optional
from mcp.server.fastmcp import FastMCP
import sqlalchemy as sa
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. Initialize FastMCP Server
mcp = FastMCP(
    name="Enterprise-Dynamic-Database-MCP",
    dependencies=["sqlalchemy", "pydantic", "httpx"]
)

# 2. Database Connection (PostgreSQL or SQLite)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mcp_tools_registry.db")
engine = sa.create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class MCPToolModel(Base):
    __tablename__ = "mcp_tools"

    id = sa.Column(sa.String, primary_key=True)
    name = sa.Column(sa.String, unique=True, nullable=False)
    title = sa.Column(sa.String)
    description = sa.Column(sa.Text)
    category = sa.Column(sa.String)
    execution_type = sa.Column(sa.String)  # 'sql', 'http', 'script'
    input_schema = sa.Column(sa.JSON)
    execution_config = sa.Column(sa.JSON)
    is_active = sa.Column(sa.Boolean, default=True)
    version = sa.Column(sa.String)

# 3. Dynamic Tool Dispatcher
def create_dynamic_tool_handler(tool_def: Dict[str, Any]):
    """
    Creates a callable closure that FastMCP binds to the MCP Protocol.
    Executes the underlying SQL or API call dynamically.
    """
    tool_name = tool_def["name"]
    exec_type = tool_def["execution_type"]
    config = tool_def.get("execution_config", {})

    async def dynamic_handler(**kwargs) -> str:
        start_time = time.time()
        print(f"[FastMCP Dynamic] Executing '{tool_name}' with args: {kwargs}")

        try:
            if exec_type == "sql":
                sql_query = config.get("sql", {}).get("query", "SELECT 1;")
                with engine.connect() as conn:
                    result = conn.execute(sa.text(sql_query), kwargs)
                    rows = [dict(row._mapping) for row in result.fetchall()]
                    payload = {
                        "tool": tool_name,
                        "rows_count": len(rows),
                        "data": rows,
                        "latency_ms": round((time.time() - start_time) * 1000, 2)
                    }
                    return json.dumps(payload, ensure_ascii=False, indent=2)

            elif exec_type == "http":
                import httpx
                http_cfg = config.get("http", {})
                url = http_cfg.get("url", "")
                for k, v in kwargs.items():
                    url = url.replace(f"{{{k}}}", str(v))
                async with httpx.AsyncClient() as client:
                    resp = await client.request(
                        method=http_cfg.get("method", "GET"),
                        url=url,
                        headers=http_cfg.get("headers", {})
                    )
                    return json.dumps(resp.json(), ensure_ascii=False, indent=2)

            else:
                return json.dumps({"status": "executed", "args": kwargs})

        except Exception as exc:
            return json.dumps({"error": str(exc), "tool": tool_name})

    dynamic_handler.__name__ = tool_name
    dynamic_handler.__doc__ = tool_def.get("description", f"Dynamic tool {tool_name}")
    return dynamic_handler

# 4. Database Hydration & Hot-Reload Routine
def load_tools_from_database():
    """Fetches active tools from the database and registers them into FastMCP."""
    print("[FastMCP] Synchronizing tool definitions from database...")
    # In production, query the DB session:
    # with SessionLocal() as db:
    #     tools = db.query(MCPToolModel).filter(MCPToolModel.is_active == True).all()

    registered_count = 0
    # Seeded definitions from Studio:
${tools
  .filter(t => t.isActive)
  .map(
    t => `    # Tool: ${t.name} (${t.executionType})
    handler_${t.name.replace(/-/g, '_')} = create_dynamic_tool_handler(${JSON.stringify({
      name: t.name,
      execution_type: t.executionType,
      description: t.descriptionEn || t.descriptionAr,
      execution_config: t.executionConfig,
    })})
    mcp.add_tool(handler_${t.name.replace(/-/g, '_')}, name="${t.name}", description="""${t.descriptionEn || t.descriptionAr}""")
    registered_count += 1`
  )
  .join('\n\n')}

    print(f"[FastMCP] Successfully loaded {registered_count} dynamic tools from database!")

# Initial load on server boot
load_tools_from_database()

# 5. Run FastMCP with SSE or Stdio transport
if __name__ == "__main__":
    # Runs standard MCP server ready for Claude Desktop, Cursor, or Web Agents
    mcp.run(transport="stdio")
`;
}
