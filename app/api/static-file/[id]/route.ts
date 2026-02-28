import { NextRequest, NextResponse } from 'next/server';
import { loadStaticMarkdownFile } from '@/lib/serverMarkdown';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const file = await loadStaticMarkdownFile(id);

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  return NextResponse.json(file);
}
