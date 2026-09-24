import { NextResponse } from 'next/server';
import { getActiveTools } from '@/lib/tool-storage';

/**
 * Standard Model Context Protocol (MCP) Tools Discovery Endpoint
 * Complies with the MCP specification for tools/list
 */
export async function GET() {
  try {
    const activeTools = getActiveTools();
    const formattedTools = activeTools.map(tool => ({
      name: tool.name,
      description: tool.descriptionEn || tool.descriptionAr,
      inputSchema: tool.inputSchema,
      metadata: {
        category: tool.category,
        executionType: tool.executionType,
        version: tool.version,
        titleAr: tool.titleAr,
        titleEn: tool.titleEn,
      },
    }));

    return NextResponse.json({
      tools: formattedTools,
      protocolVersion: '2024-11-05',
      serverInfo: {
        name: 'FastMCP-Database-Dynamic-Server',
        version: '1.0.0',
        capabilities: {
          tools: {
            listChanged: true,
          },
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: -32603, message: err.message } },
      { status: 500 }
    );
  }
}
