import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const root = path.resolve(process.cwd());

function safeResolve(input: string): string {
  const resolved = path.resolve(root, input);
  if (!resolved.startsWith(root)) throw new Error('Invalid path');
  return resolved;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'create-file': {
        const filePath = safeResolve(body.path);
        if (fs.existsSync(filePath)) {
          return NextResponse.json({ error: 'File already exists' }, { status: 409 });
        }
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, body.content || '', 'utf-8');
        return NextResponse.json({ success: true });
      }

      case 'create-folder': {
        const dirPath = safeResolve(body.path);
        if (fs.existsSync(dirPath)) {
          return NextResponse.json({ error: 'Folder already exists' }, { status: 409 });
        }
        fs.mkdirSync(dirPath, { recursive: true });
        return NextResponse.json({ success: true });
      }

      case 'rename': {
        const oldPath = safeResolve(body.oldPath);
        const newPath = safeResolve(body.newPath);
        if (!fs.existsSync(oldPath)) {
          return NextResponse.json({ error: 'Source not found' }, { status: 404 });
        }
        if (fs.existsSync(newPath)) {
          return NextResponse.json({ error: 'Destination already exists' }, { status: 409 });
        }
        fs.mkdirSync(path.dirname(newPath), { recursive: true });
        fs.renameSync(oldPath, newPath);
        return NextResponse.json({ success: true });
      }

      case 'delete': {
        const delPath = safeResolve(body.path);
        if (!fs.existsSync(delPath)) {
          return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        const stat = fs.statSync(delPath);
        if (stat.isDirectory()) {
          fs.rmSync(delPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(delPath);
        }
        return NextResponse.json({ success: true });
      }

      case 'save': {
        const savePath = safeResolve(body.path);
        if (!fs.existsSync(savePath)) {
          return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        fs.writeFileSync(savePath, body.content || '', 'utf-8');
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
