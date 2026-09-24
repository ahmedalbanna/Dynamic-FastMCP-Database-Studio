import { NextResponse } from 'next/server';
import { resetToolsToDefault } from '@/lib/tool-storage';
import { resetDatabase } from '@/lib/database-engine';

export async function POST() {
  try {
    const tools = resetToolsToDefault();
    resetDatabase();
    return NextResponse.json({
      success: true,
      message: 'Tools registry and sample database reset to initial state.',
      tools,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
