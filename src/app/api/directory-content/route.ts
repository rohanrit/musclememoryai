import { NextRequest, NextResponse } from 'next/server';
import { listDirectory } from '@/lib/build-file-tree';
import path from 'path';

export async function GET(req: NextRequest) {
  const dirPath = req.nextUrl.searchParams.get('path');
  if (!dirPath) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
  }

  const resolved = path.resolve(process.cwd(), dirPath);
  const root = path.resolve(process.cwd());

  if (!resolved.startsWith(root)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
  }

  try {
    const children = listDirectory(resolved, root);
    return NextResponse.json({ children });
  } catch {
    return NextResponse.json({ error: 'Directory not found' }, { status: 404 });
  }
}
