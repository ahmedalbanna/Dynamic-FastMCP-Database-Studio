import { NextRequest, NextResponse } from 'next/server';
import { getAllTools, saveTool } from '@/lib/tool-storage';

export async function GET() {
  try {
    const tools = getAllTools();
    return NextResponse.json({
      success: true,
      total: tools.length,
      activeCount: tools.filter(t => t.isActive).length,
      tools,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Tool name is required and must be a string.' },
        { status: 400 }
      );
    }

    const saved = saveTool(body);
    return NextResponse.json({
      success: true,
      tool: saved,
      message: 'Tool saved successfully to database registry.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
