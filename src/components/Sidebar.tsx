'use client';
// Sidebar — File Explorer with tree navigation
import React from 'react';
import {
  ChevronRight, ChevronDown, FileText, Folder, FolderOpen,
  FileCode2, FileJson, FileType, Settings, Search, GitBranch,
} from 'lucide-react';
import { useIDEStore } from '@/lib/store';
import type { FileNode } from '@/lib/types';
import { getFileIconColor } from '@/lib/utils';

function FileIcon({ name, extension }: { name: string; extension?: string }) {
  const color = getFileIconColor(name);
  if (extension === '.tsx' || extension === '.jsx') return <FileCode2 size={14} style={{ color }} />;
  if (extension === '.ts' || extension === '.js') return <FileCode2 size={14} style={{ color }} />;
  if (extension === '.json') return <FileJson size={14} style={{ color }} />;
  if (extension === '.css' || extension === '.scss') return <FileType size={14} style={{ color }} />;
  if (extension === '.md') return <FileText size={14} className="text-zinc-400" />;
  if (extension === '.env') return <Settings size={14} className="text-amber-500" />;
  return <FileText size={14} style={{ color }} />;
}

function TreeNode({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const { expandedDirs, toggleDir, selectedFile, openFile } = useIDEStore();
  const isExpanded = expandedDirs.has(node.path);
  const isSelected = selectedFile === node.path;
  const isDir = node.type === 'directory';

  const handleClick = () => {
    if (isDir) {
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
            {isExpanded ? <ChevronDown size={12} className="text-zinc-600 shrink-0" /> : <ChevronRight size={12} className="text-zinc-600 shrink-0" />}
            {isExpanded ? <FolderOpen size={14} className="text-violet-400 shrink-0" /> : <Folder size={14} className="text-zinc-500 shrink-0" />}
          </>
        ) : (
          <>
            <span className="w-3 shrink-0" />
            <FileIcon name={node.name} extension={node.extension} />
          </>
        )}
        <span className={`truncate ${isDir ? 'font-medium text-zinc-300' : ''}`}>
          {node.name}
        </span>
      </button>
      {isDir && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { fileTree } = useIDEStore();

  return (
    <div className="w-full h-full bg-[#0c0c0f] flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e22]">
        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Explorer</span>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-white/5 text-zinc-600 hover:text-zinc-400 transition-colors">
            <Search size={13} />
          </button>
          <button className="p-1 rounded hover:bg-white/5 text-zinc-600 hover:text-zinc-400 transition-colors">
            <GitBranch size={13} />
          </button>
        </div>
      </div>

      {/* Branch indicator */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-[#1e1e22] bg-white/[0.01]">
        <GitBranch size={11} className="text-cyan-400" />
        <span className="text-[11px] text-zinc-500 font-mono">main</span>
        <span className="text-[10px] text-emerald-400 ml-auto font-mono">✓ clean</span>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {fileTree.map((node) => (
          <TreeNode key={node.path} node={node} />
        ))}
      </div>

      {/* Footer stats */}
      <div className="px-3 py-2 border-t border-[#1e1e22] flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-[10px] text-zinc-600 font-mono">12 files · 18.2 KB</span>
      </div>
    </div>
  );
}
