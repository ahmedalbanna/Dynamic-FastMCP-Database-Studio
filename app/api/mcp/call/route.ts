import { NextRequest, NextResponse } from 'next/server';
import { executeDynamicTool } from '@/lib/tool-storage';

/**
 * Standard Model Context Protocol (MCP) Tool Execution Endpoint
 * Complies with the MCP specification for tools/call
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const toolName = body.name || body.params?.name;
    const args = body.arguments || body.params?.arguments || {};

    if (!toolName) {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id: body.id || null,
          error: {
            code: -32602,
            message: 'Invalid params: tool "name" is required',
          },
        },
        { status: 400 }
      );
    }

    const result = await executeDynamicTool(toolName, args);

    return NextResponse.json({
      jsonrpc: '2.0',
      id: body.id || `call-${Date.now()}`,
      result: {
        content: [
          {
            type: 'text',
            text: result.success
              ? JSON.stringify(result.data, null, 2)
              : `Error executing ${toolName}: ${result.error}`,
          },
        ],
        isError: !result.success,
      },
      meta: {
        executionTimeMs: result.executionTimeMs,
        toolName: result.toolName,
        timestamp: result.timestamp,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: err.message || 'Internal MCP tool execution failure',
        },
      },
      { status: 500 }
    );
  }
}
