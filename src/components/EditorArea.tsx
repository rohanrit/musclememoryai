'use client';
// EditorArea — Monaco editor with tabs
import React, { useCallback } from 'react';
import { X, Circle } from 'lucide-react';
import { useIDEStore } from '@/lib/store';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

function EditorTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useIDEStore();

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center bg-[#0c0c0f] border-b border-[#1e1e22] overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-3 py-2 text-[12px] border-r border-[#1e1e22] cursor-pointer group min-w-[120px] max-w-[200px] transition-colors ${
            tab.id === activeTabId
              ? 'bg-[#111114] text-zinc-200 border-t-2 border-t-violet-500'
              : 'text-zinc-500 hover:bg-white/[0.02] border-t-2 border-t-transparent'
          }`}
        >
          {tab.isDirty && <Circle size={7} className="text-violet-400 fill-violet-400 shrink-0" />}
          <span className="truncate">{tab.fileName}</span>
          <button
            onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
            className="ml-auto p-0.5 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  const { toggleCommandBar } = useIDEStore();
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0d]">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-white/[0.04] flex items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 opacity-20" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500/20 animate-pulse-glow" />
      </div>
      <h2 className="text-lg font-medium text-zinc-400 mb-2">No file open</h2>
      <p className="text-sm text-zinc-600 mb-6">Open a file from the explorer or vibe a command</p>
      <button
        onClick={toggleCommandBar}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm hover:bg-violet-500/20 transition-colors"
      >
        <span>Ctrl+K</span>
        <span className="text-zinc-500">to start vibing</span>
      </button>
    </div>
  );
}

export default function EditorArea() {
  const { tabs, activeTabId, updateFileContent } = useIDEStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (activeTab && value !== undefined) {
        updateFileContent(activeTab.filePath, value);
      }
    },
    [activeTab, updateFileContent]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <EditorTabs />
      {activeTab ? (
        <div className="flex-1 overflow-hidden">
          <MonacoEditor
            height="100%"
            language={activeTab.language}
            value={activeTab.content}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              minimap: { enabled: true, scale: 1, size: 'proportional' },
              lineNumbers: 'on',
              renderLineHighlight: 'gutter',
              scrollBeyondLastLine: false,
              padding: { top: 12 },
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true, indentation: true },
              wordWrap: 'off',
              tabSize: 2,
              automaticLayout: true,
            }}
          />
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
