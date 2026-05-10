import type { FileNode } from './types';

export interface FileHandles {
  root: unknown;
  files: Map<string, unknown>;
}

export interface DirectoryHandles {
  root: unknown;
  files: Map<string, unknown>;
  dirs: Map<string, unknown>;
}

export async function pickDirectory(): Promise<DirectoryHandles | null> {
  try {
    const w = window as unknown as { showDirectoryPicker(opts?: { mode: string }): Promise<unknown> };
    const handle = await w.showDirectoryPicker({ mode: 'readwrite' });
    const files = new Map<string, unknown>();
    const dirs = new Map<string, unknown>();
    return { root: handle, files, dirs };
  } catch {
    return null;
  }
}

async function scanHandle(
  dirHandle: unknown,
  rootPath: string,
  files: Map<string, unknown>,
  dirs: Map<string, unknown>,
): Promise<FileNode[]> {
  const nodes: FileNode[] = [];
  const dirEntries: [string, unknown][] = [];
  const fileEntries: [string, unknown][] = [];

  const h = dirHandle as { values(): AsyncIterableIterator<{ kind: string; name: string }> };

  for await (const handle of h.values()) {
    if (handle.kind === 'directory') {
      dirEntries.push([handle.name, handle]);
    } else {
      fileEntries.push([handle.name, handle]);
    }
  }

  for (const [name, handle] of dirEntries) {
    const childPath = rootPath ? `${rootPath}/${name}` : name;
    dirs.set(childPath, handle);
    const children = await scanHandle(handle, childPath, files, dirs);
    nodes.push({
      name,
      path: childPath,
      type: 'directory',
      children,
    });
  }

  for (const [name, handle] of fileEntries) {
    const filePath = rootPath ? `${rootPath}/${name}` : name;
    files.set(filePath, handle);
    nodes.push({
      name,
      path: filePath,
      type: 'file',
      extension: name.includes('.') ? name.split('.').pop()?.toLowerCase() : undefined,
    });
  }

  return nodes;
}

export async function readPickedDirectory(dirHandle: unknown): Promise<{
  tree: FileNode[];
  handles: Map<string, unknown>;
  dirs: Map<string, unknown>;
}> {
  const files = new Map<string, unknown>();
  const dirs = new Map<string, unknown>();
  dirs.set('.', dirHandle);
  const tree = await scanHandle(dirHandle, '', files, dirs);
  return { tree, handles: files, dirs };
}

export async function readFileFromHandle(handle: unknown): Promise<string> {
  const h = handle as { getFile(): Promise<File> };
  const file = await h.getFile();
  return file.text();
}

export async function refreshDirHandle(
  dirHandle: unknown,
  dirPath: string,
  files: Map<string, unknown>,
  dirs: Map<string, unknown>,
): Promise<FileNode[]> {
  const prefix = dirPath ? dirPath + '/' : '';
  for (const key of files.keys()) {
    if (prefix ? key.startsWith(prefix) : !key.includes('/')) {
      files.delete(key);
    }
  }
  for (const key of dirs.keys()) {
    if (key === dirPath) continue;
    if (prefix ? key.startsWith(prefix) : !key.includes('/')) {
      dirs.delete(key);
    }
  }
  return scanHandle(dirHandle, dirPath, files, dirs);
}

export async function saveFileToHandle(handle: unknown, content: string): Promise<void> {
  const h = handle as { createWritable(): Promise<{ write(data: string): Promise<void>; close(): Promise<void> }> };
  const writable = await h.createWritable();
  await writable.write(content);
  await writable.close();
}

export async function createFileInDir(
  dirHandle: unknown,
  name: string,
  content?: string,
): Promise<unknown> {
  const h = dirHandle as { getFileHandle(name: string, opts: { create: boolean }): Promise<unknown> };
  const fileHandle = await h.getFileHandle(name, { create: true });
  if (content !== undefined) {
    await saveFileToHandle(fileHandle, content);
  }
  return fileHandle;
}

export async function createDirInDir(
  dirHandle: unknown,
  name: string,
): Promise<unknown> {
  const h = dirHandle as { getDirectoryHandle(name: string, opts: { create: boolean }): Promise<unknown> };
  return h.getDirectoryHandle(name, { create: true });
}

export async function deleteDirEntry(
  dirHandle: unknown,
  name: string,
): Promise<void> {
  const h = dirHandle as { removeEntry(name: string, opts: { recursive: boolean }): Promise<void> };
  await h.removeEntry(name, { recursive: true });
}

export async function renameDirEntry(
  dirHandle: unknown,
  oldName: string,
  newName: string,
): Promise<void> {
  const h = dirHandle as {
    getFileHandle(name: string, opts?: { create?: boolean }): Promise<unknown>;
    getDirectoryHandle(name: string, opts?: { create?: boolean }): Promise<unknown>;
    removeEntry(name: string, opts?: { recursive?: boolean }): Promise<void>;
    values(): AsyncIterableIterator<{ kind: string; name: string }>;
  };

  let kind: 'file' | 'directory' = 'file';
  for await (const entry of h.values()) {
    if (entry.name === oldName) {
      kind = entry.kind === 'directory' ? 'directory' : 'file';
      break;
    }
  }

  if (kind === 'file') {
    const oldHandle = await h.getFileHandle(oldName);
    const file = await (oldHandle as { getFile(): Promise<File> }).getFile();
    const content = await file.text();
    const newHandle = await h.getFileHandle(newName, { create: true });
    await saveFileToHandle(newHandle, content);
  } else {
    const oldDirHandle = await h.getDirectoryHandle(oldName);
    const newDirHandle = await h.getDirectoryHandle(newName, { create: true });
    await copyDirContents(oldDirHandle, newDirHandle);
  }

  await h.removeEntry(oldName, { recursive: true });
}

async function copyDirContents(srcHandle: unknown, destHandle: unknown): Promise<void> {
  const src = srcHandle as { values(): AsyncIterableIterator<{ kind: string; name: string }> };
  const dest = destHandle as {
    getFileHandle(name: string, opts: { create: boolean }): Promise<unknown>;
    getDirectoryHandle(name: string, opts: { create: boolean }): Promise<unknown>;
  };

  for await (const entry of src.values()) {
    if (entry.kind === 'directory') {
      const childSrc = await (srcHandle as { getDirectoryHandle(name: string): Promise<unknown> }).getDirectoryHandle(entry.name);
      const childDest = await dest.getDirectoryHandle(entry.name, { create: true });
      await copyDirContents(childSrc, childDest);
    } else {
      const fileSrc = await (srcHandle as { getFileHandle(name: string): Promise<unknown> }).getFileHandle(entry.name);
      const fileDest = await dest.getFileHandle(entry.name, { create: true });
      const file = await (fileSrc as { getFile(): Promise<File> }).getFile();
      await saveFileToHandle(fileDest, await file.text());
    }
  }
}
