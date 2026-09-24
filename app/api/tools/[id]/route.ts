import { NextRequest, NextResponse } from 'next/server';
import { getToolById, saveTool, deleteTool } from '@/lib/tool-storage';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tool = getToolById(id);
    if (!tool) {
      return NextResponse.json({ success: false, error: 'Tool not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, tool });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = saveTool({ ...body, id });
    return NextResponse.json({
      success: true,
      tool: updated,
      message: 'Tool updated successfully in database registry.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteTool(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Tool not found or already removed' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Tool deleted from database registry.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
