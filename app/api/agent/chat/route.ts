import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { getActiveTools, executeDynamicTool } from '@/lib/tool-storage';
import { JSONSchemaProperty } from '@/lib/mcp-types';

function mapPropertyType(prop: JSONSchemaProperty): any {
  switch (prop.type) {
    case 'string':
      return Type.STRING;
    case 'number':
      return Type.NUMBER;
    case 'integer':
      return Type.INTEGER;
    case 'boolean':
      return Type.BOOLEAN;
    case 'array':
      return Type.ARRAY;
    case 'object':
      return Type.OBJECT;
    default:
      return Type.STRING;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'User message is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'GEMINI_API_KEY is not configured in the environment. Please check the Secrets panel.',
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // 1. Fetch all active dynamic tools from the centralized database
    const activeTools = getActiveTools();

    // 2. Convert active dynamic tools to Gemini FunctionDeclarations
    const functionDeclarations: FunctionDeclaration[] = activeTools.map(tool => {
      const properties: Record<string, any> = {};
      const toolProperties = tool.inputSchema.properties || {};

      for (const [propName, propDef] of Object.entries(toolProperties)) {
        properties[propName] = {
          type: mapPropertyType(propDef),
          description: propDef.description || propName,
          ...(propDef.enum ? { enum: propDef.enum } : {}),
        };
      }

      return {
        name: tool.name,
        description: `${tool.descriptionEn || tool.descriptionAr} (Database Category: ${tool.category}, Execution: ${tool.executionType})`,
        parameters: {
          type: Type.OBJECT,
          properties,
          required: tool.inputSchema.required || [],
        },
      };
    });

    const systemInstruction = `You are an enterprise AI Agent operating over the Model Context Protocol (MCP) powered by FastMCP.
You have direct access to dynamic, database-driven tools registered in the central system database.
The tools allow you to inspect customer records, query product inventory for reorders, fetch customer orders, compute dynamic tier loyalty discounts, and query support tickets.

Guidelines:
1. Always use available tools when the user asks for facts, customer data, inventory levels, or financial calculations.
2. Respond in the same language as the user (Arabic or English). If Arabic is used, provide clear, professional, and elegant Arabic responses with key figures formatted cleanly.
3. If tool execution returns structured records, synthesize the findings clearly with key metrics and actionable summaries.`;

    // 3. Build contents history
    const contents: any[] = [];
    for (const msg of conversationHistory) {
      if (msg.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: msg.content }] });
      } else if (msg.role === 'assistant') {
        contents.push({ role: 'model', parts: [{ text: msg.content }] });
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    // 4. Call Gemini with dynamic database tools
    const initialResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
        tools: functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined,
      },
    });

    const toolCalls = initialResponse.functionCalls;

    // If Gemini decided to call a dynamic MCP tool:
    if (toolCalls && toolCalls.length > 0) {
      const call = toolCalls[0];
      const toolName = call.name;
      if (!toolName) {
        return NextResponse.json({
          success: true,
          text: initialResponse.text || 'No tool name found in call.',
          toolInvoked: null,
        });
      }
      const toolArgs = (call.args as Record<string, any>) || {};

      // Execute tool against our dynamic database engine
      const toolExecution = await executeDynamicTool(toolName, toolArgs);

      // Now feed the tool result back into Gemini to generate the final human answer
      const followUpContents = [
        ...contents,
        initialResponse.candidates?.[0]?.content,
        {
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: toolName,
                response: {
                  output: toolExecution.success ? toolExecution.data : { error: toolExecution.error },
                },
              },
            },
          ],
        },
      ];

      const finalResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: followUpContents,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      return NextResponse.json({
        success: true,
        text: finalResponse.text || 'Tool executed successfully.',
        toolInvoked: {
          name: toolName,
          arguments: toolArgs,
          result: toolExecution.data,
          error: toolExecution.error,
          latencyMs: toolExecution.executionTimeMs,
          success: toolExecution.success,
        },
      });
    }

    // Direct answer without tool call
    return NextResponse.json({
      success: true,
      text: initialResponse.text || 'No response generated.',
      toolInvoked: null,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Error communicating with Gemini Agent.',
      },
      { status: 500 }
    );
  }
}
