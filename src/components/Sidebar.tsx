'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronRight, ChevronDown, FileText, Folder, FolderOpen,
  FileCode2, FileJson, FileType, Settings, Search, GitBranch, X, Loader2,
  RotateCcw,
} from 'lucide-react';
import { useIDEStore } from '@/lib/store';
import type { FileNode } from '@/lib/types';
import { getFileIconColor } from '@/lib/utils';

function FileIcon({ name, extension }: { name: string; extension?: string }) {
  const color = getFileIconColor(name);
  if (extension === '.tsx' || extension === '.jsx') return <FileCode2 size={14} style={{ color }} />;
  if (extension === '.ts' || extension === '.js' || extension === '.mjs') return <FileCode2 size={14} style={{ color }} />;
  if (extension === '.json') return <FileJson size={14} style={{ color }} />;
  if (extension === '.css' || extension === '.scss') return <FileType size={14} style={{ color }} />;
  if (extension === '.md') return <FileText size={14} className="text-zinc-400" />;
  if (extension === '.env') return <Settings size={14} className="text-amber-500" />;
  return <FileText size={14} style={{ color }} />;
}

function matchesQuery(node: FileNode, query: string): boolean {
  const lower = query.toLowerCase();
  if (node.name.toLowerCase().includes(lower)) return true;
  if (node.children) return node.children.some(c => matchesQuery(c, lower));
  return false;
}

function TreeNode({ node, depth = 0, query = '' }: { node: FileNode; depth?: number; query?: string }) {
  const { expandedDirs, loadingDirs, toggleDir, selectedFile, openFile, loadDirectory } = useIDEStore();
  const isExpanded = expandedDirs.has(node.path);
  const isSelected = selectedFile === node.path;
  const isDir = node.type === 'directory';
  const isLoading = loadingDirs.has(node.path);
  const isLoaded = isDir && node.children && node.children.length > 0;

  const filteredChildren = useMemo(() => {
    if (!node.children) return [];
    if (!query) return node.children;
    return node.children.filter(c => matchesQuery(c, query));
  }, [node.children, query]);

  if (query && !matchesQuery(node, query)) return null;

  const handleClick = async () => {
    if (isDir) {
      if (!isLoaded && !isExpanded) {
        await loadDirectory(node.path);
      }
      toggleDir(node.path);
    } else {
      openFile(node.path);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-1.5 py-[3px] pr-3 text-left text-[12px] hover:bg-white/[0.04] transition-colors group ${
          isSelected && !isDir ? 'bg-violet-500/10 text-violet-300 border-r-2 border-violet-500' : 'text-zinc-400'
        }`}
        style={{ paddingLeft: `${depth * 14 + 12}px` }}
      >
        {isDir ? (
          <>
            {isLoading ? (
              <Loader2 size={12} className="text-zinc-500 shrink-0 animate-spin" />
            ) : isExpanded ? (
              <ChevronDown size={12} className="text-zinc-600 shrink-0" />
            ) : (
              <ChevronRight size={12} className="text-zinc-600 shrink-0" />
            )}
            {isExpanded ? <FolderOpen size={14} className="text-violet-400 shrink-0" /> : <Folder size={14} className="text-zinc-500 shrink-0" />}
          </>
        ) : (
          <>
            <span className="w-3 shrink-0" />
            <FileIcon name={node.name} extension={node.extension} />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {isDir && !query && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.path} node={child} depth={depth + 1} query={query} />
          ))}
        </div>
      )}
      {isDir && query && isExpanded && (
        <div>
          {filteredChildren.map((child) => (
            <TreeNode key={child.path} node={child} depth={depth + 1} query={query} />
          ))}
        </div>
      )}
    </div>
  );
}

function MenuDropdown({ items, onClose }: {
  items: { label: string; shortcut?: string; separator?: boolean; disabled?: boolean; action: () => void }[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute top-full left-0 mt-0.5 min-w-[180px] bg-[#1a1a1f] border border-[#2a2a30] rounded-lg shadow-xl py-1 z-50 animate-fade-in">
      {items.map((item, i) =>
        item.separator ? (
          <div key={i} className="h-[1px] bg-[#2a2a30] my-1" />
        ) : (
          <button
            key={i}
            disabled={item.disabled}
            onClick={() => { if (!item.disabled) { item.action(); onClose(); } }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left transition-colors ${
              item.disabled ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100'
            }`}
          >
            <span className="truncate flex-1">{item.label}</span>
            {item.shortcut && <span className="text-[10px] text-zinc-600 font-mono">{item.shortcut}</span>}
          </button>
        )
      )}
    </div>
  );
}

async function apiFs(action: string, body: Record<string, unknown>) {
  const res = await fetch('/api/fs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...body }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Operation failed');
  }
  return res.json();
}

export default function Sidebar() {
  const { fileTree, selectedFile, refreshDirectory, setPickedDirectory, tabs, activeTabId, updateFileContent, fileHandles, dirHandles } = useIDEStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<'file' | 'edit' | null>(null);
  const activeTab = tabs.find(t => t.id === activeTabId);

  const handleSearchToggle = () => {
    setSearchOpen(prev => !prev);
    if (searchOpen) setQuery('');
  };

  const getParentDir = (path?: string | null): string => {
    if (!path) return '.';
    const parts = path.split('/');
    parts.pop();
    return parts.join('/') || '.';
  };

  const promptName = (message: string, defaultValue = ''): Promise<string | null> => {
    return new Promise((resolve) => {
      const result = prompt(message, defaultValue);
      resolve(result !== null && result.trim() ? result.trim() : null);
    });
  };

  const menuItems = {
    file: [
      {
        label: 'New File', shortcut: 'Ctrl+N',
        action: async () => {
          const name = await promptName('Enter file name:');
          if (!name) return;
          const parent = getParentDir(selectedFile);
          const dirHandle = dirHandles.get(parent);
          if (dirHandle) {
            try {
              const { createFileInDir } = await import('@/lib/file-system-access');
              await createFileInDir(dirHandle, name, '');
              await refreshDirectory(parent);
            } catch (e: unknown) {
              const err = e as Error;
              alert(err.message);
            }
          } else {
            try {
              await apiFs('create-file', { path: `${parent}/${name}`, content: '' });
              await refreshDirectory(parent);
            } catch (e: unknown) {
              const err = e as Error;
              alert(err.message);
            }
          }
        },
      },
      {
        label: 'New Folder', shortcut: 'Ctrl+Shift+N',
        action: async () => {
          const name = await promptName('Enter folder name:');
          if (!name) return;
          const parent = getParentDir(selectedFile);
          const dirHandle = dirHandles.get(parent);
          if (dirHandle) {
            try {
              const { createDirInDir } = await import('@/lib/file-system-access');
              await createDirInDir(dirHandle, name);
              await refreshDirectory(parent);
            } catch (e: unknown) {
              const err = e as Error;
              alert(err.message);
            }
          } else {
            try {
              await apiFs('create-folder', { path: `${parent}/${name}` });
              await refreshDirectory(parent);
            } catch (e: unknown) {
              const err = e as Error;
              alert(err.message);
            }
          }
        },
      },
      { separator: true as const, label: '', action: () => {} },
      {
        label: 'Save', shortcut: 'Ctrl+S',
        action: async () => {
          if (!activeTab) return;
          const handle = fileHandles.get(activeTab.filePath);
          if (handle) {
            try {
              const { saveFileToHandle } = await import('@/lib/file-system-access');
              await saveFileToHandle(handle, activeTab.content);
              updateFileContent(activeTab.filePath, activeTab.content);
            } catch (e: unknown) {
              const err = e as Error;
              alert(err.message);
            }
          } else {
            try {
              await apiFs('save', { path: activeTab.filePath, content: activeTab.content });
              updateFileContent(activeTab.filePath, activeTab.content);
            } catch (e: unknown) {
              const err = e as Error;
              alert(err.message);
            }
          }
        },
      },
      { separator: true as const, label: '', action: () => {} },
      {
        label: 'Open Folder...', shortcut: 'Ctrl+O',
        action: async () => {
          try {
            const { pickDirectory, readPickedDirectory } = await import('@/lib/file-system-access');
            const handles = await pickDirectory();
            if (!handles) return;
            const { tree, handles: fileHandles, dirs: dirHandles } = await readPickedDirectory(handles.root);
            setPickedDirectory(tree, fileHandles, dirHandles);
          } catch (e: unknown) {
            const err = e as Error;
            if (err.name !== 'AbortError') alert(err.message);
          }
        },
      },
      {
        label: 'Refresh', shortcut: 'Ctrl+R',
        action: async () => {
          await refreshDirectory('.');
        },
      },
    ],
    edit: [
      {
        label: 'Rename',
        action: async () => {
          const target = selectedFile;
          if (!target) { alert('Select a file or folder first'); return; }
          const oldName = target.split('/').pop() || '';
          const newName = await promptName('Rename to:', oldName);
          if (!newName || newName === oldName) return;
          const parent = getParentDir(target);
          const dirHandle = dirHandles.get(parent);
          if (dirHandle) {
            try {
              const { renameDirEntry } = await import('@/lib/file-system-access');
              await renameDirEntry(dirHandle, oldName, newName);
              await refreshDirectory(parent);
            } catch (e: unknown) {
              const err = e as Error;
              alert(err.message);
            }
          } else {
            try {
              await apiFs('rename', { oldPath: target, newPath: `${parent}/${newName}` });
              await refreshDirectory(parent);
            } catch (e: unknown) {
              const err = e as Error;
              alert(err.message);
            }
          }
        },
      },
      {
        label: 'Delete',
        action: async () => {
          const target = selectedFile;
          if (!target) { alert('Select a file or folder first'); return; }
          if (!confirm(`Delete "${target}"?`)) return;
          const parent = getParentDir(target);
          const dirHandle = dirHandles.get(parent);
          if (dirHandle) {
            try {
              const { deleteDirEntry } = await import('@/lib/file-system-access');
              await deleteDirEntry(dirHandle, target.split('/').pop()!);
              await refreshDirectory(parent);
            } catch (e: unknown) {
              const err = e as Error;
              alert(err.message);
            }
          } else {
            try {
              await apiFs('delete', { path: target });
              await refreshDirectory(parent);
            } catch (e: unknown) {
              const err = e as Error;
              alert(err.message);
            }
          }
        },
      },
    ],
  };

  return (
    <div className="w-full h-full bg-[#0c0c0f] flex flex-col overflow-hidden shrink-0">
      {/* Menu Bar */}
      <div className="flex items-center border-b border-[#1e1e22] bg-[#09090b] relative shrink-0">
        <button
          onClick={() => setOpenMenu(openMenu === 'file' ? null : 'file')}
          className={`px-3 py-1.5 text-[11px] transition-colors ${openMenu === 'file' ? 'text-zinc-100 bg-white/[0.04]' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'}`}
        >
          File
        </button>
        <button
          onClick={() => setOpenMenu(openMenu === 'edit' ? null : 'edit')}
          className={`px-3 py-1.5 text-[11px] transition-colors ${openMenu === 'edit' ? 'text-zinc-100 bg-white/[0.04]' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'}`}
        >
          Edit
        </button>
        {openMenu && (
          <MenuDropdown
            items={menuItems[openMenu]}
            onClose={() => setOpenMenu(null)}
          />
        )}
      </div>

      {/* Explorer Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e22]">
        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Explorer</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleSearchToggle}
            className={`p-1 rounded hover:bg-white/5 transition-colors ${searchOpen ? 'text-amber-400 bg-amber-400/10' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <Search size={13} />
          </button>
          <button
            onClick={() => refreshDirectory('.')}
            className="p-1 rounded hover:bg-white/5 text-zinc-600 hover:text-zinc-400 transition-colors"
            title="Refresh"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="px-2 py-1.5 border-b border-[#1e1e22] bg-white/[0.01]">
          <div className="relative">
            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full bg-[#131317] border border-[#2a2a30] rounded pl-6 pr-7 py-1 text-[11px] text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/40"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                <X size={11} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Branch indicator */}
      {fileTree.length > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-[#1e1e22] bg-white/[0.01]">
          <GitBranch size={11} className="text-cyan-400" />
          <span className="text-[11px] text-zinc-500 font-mono">main</span>
          <span className="text-[10px] text-emerald-400 ml-auto font-mono">✓ clean</span>
        </div>
      )}

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {fileTree.length === 0 ? (
          <div className="px-4 py-8 flex flex-col items-center gap-2 text-center">
            <FolderOpen size={28} className="text-zinc-700" />
            <span className="text-[12px] text-zinc-500">No folder open</span>
            <span className="text-[10px] text-zinc-700 leading-relaxed max-w-[180px]">
              Use <kbd className="text-zinc-600 bg-white/[0.04] px-1 rounded font-mono">File → Open Folder</kbd> to browse your project
            </span>
          </div>
        ) : (
          fileTree.map((node) => (
            <TreeNode key={node.path} node={node} query={query} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-2 sm:px-3 py-2 border-t border-[#1e1e22] flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${fileTree.length > 0 ? 'bg-emerald-400' : 'bg-zinc-700'}`} />
        <span className="text-[10px] text-zinc-600 font-mono truncate">
          {fileTree.length > 0 ? 'Ready' : 'No folder'}
        </span>
      </div>
    </div>
  );
}
