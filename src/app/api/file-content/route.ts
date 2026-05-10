import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get('path');
  if (!filePath) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
  }

  const resolved = path.resolve(process.cwd(), filePath);
  const root = path.resolve(process.cwd());

  if (!resolved.startsWith(root)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
  }

  try {
    const content = fs.readFileSync(resolved, 'utf-8');
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
