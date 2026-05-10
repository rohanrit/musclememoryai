import type { FileNode } from './types';
import fs from 'fs';
import path from 'path';

function makeNode(name: string, fullPath: string, rootDir: string, isDir: boolean): FileNode {
  const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
  if (isDir) {
    return { name, path: relPath, type: 'directory', children: [] };
  }
  const stats = fs.statSync(fullPath);
  return {
    name,
    path: relPath,
    type: 'file',
    extension: path.extname(name).toLowerCase() || undefined,
    size: stats.size,
    modified: stats.mtimeMs,
  };
}

export function listDirectory(dirPath: string, rootDir: string): FileNode[] {
  const nodes: FileNode[] = [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory());
    const files = entries.filter(e => e.isFile());

    for (const dir of dirs) {
      const fullPath = path.join(dirPath, dir.name);
      nodes.push(makeNode(dir.name, fullPath, rootDir, true));
    }

    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      nodes.push(makeNode(file.name, fullPath, rootDir, false));
    }
  } catch { /* skip inaccessible */ }
  return nodes;
}

function scanDir(dirPath: string, rootDir: string): FileNode[] {
  const nodes: FileNode[] = [];
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory());
    const files = entries.filter(e => e.isFile());

    for (const dir of dirs) {
      const fullPath = path.join(dirPath, dir.name);
      const children = scanDir(fullPath, rootDir);
      nodes.push({
        name: dir.name,
        path: path.relative(rootDir, fullPath).replace(/\\/g, '/'),
        type: 'directory',
        children,
      });
    }

    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      const stats = fs.statSync(fullPath);
      nodes.push({
        name: file.name,
        path: path.relative(rootDir, fullPath).replace(/\\/g, '/'),
        type: 'file',
        extension: path.extname(file.name).toLowerCase() || undefined,
        size: stats.size,
        modified: stats.mtimeMs,
      });
    }
  } catch { /* skip inaccessible */ }
  return nodes;
}

export function buildFileTree(rootDir: string): FileNode[] {
  const resolved = path.resolve(rootDir);
  if (!fs.existsSync(resolved)) return [];
  return listDirectory(resolved, resolved);
}

export function readFileContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

export function countFiles(tree: FileNode[]): number {
  let count = 0;
  for (const node of tree) {
    if (node.type === 'file') count++;
    if (node.children) count += countFiles(node.children);
  }
  return count;
}

export function totalSize(tree: FileNode[]): number {
  let size = 0;
  for (const node of tree) {
    if (node.type === 'file' && node.size) size += node.size;
    if (node.children) size += totalSize(node.children);
  }
  return size;
}
