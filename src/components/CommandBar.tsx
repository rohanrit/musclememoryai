'use client';
// CommandBar — the Vibe Command Bar for NLP-driven coding
import React, { useState, useEffect, useRef } from 'react';
import {
  Command, Zap, Wrench, Moon, TestTube, Bug, Gauge, ArrowRight,
  GitBranch, Sparkles, X, Loader2,
} from 'lucide-react';
import { useIDEStore } from '@/lib/store';
import { DEFAULT_SUGGESTIONS } from '@/lib/constants';
import { callAI } from '@/lib/ai';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  refactor: <Wrench size={14} className="text-amber-400" />,
  style: <Moon size={14} className="text-violet-400" />,
  generate: <Zap size={14} className="text-cyan-400" />,
  test: <TestTube size={14} className="text-emerald-400" />,
  optimize: <Gauge size={14} className="text-blue-400" />,
  debug: <Bug size={14} className="text-rose-400" />,
};

export default function CommandBar() {
  const { commandBarOpen, toggleCommandBar, addTerminalLine, selectedFile, fileContents, tabs, activeTabId } = useIDEStore();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandBar();
      }
      if (e.key === 'Escape' && commandBarOpen) {
        toggleCommandBar();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandBarOpen, toggleCommandBar]);

  useEffect(() => {
    if (commandBarOpen) {
      inputRef.current?.focus();
    } else {
      setInput('');
      setIsProcessing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commandBarOpen]);

  const handleSubmit = async () => {
    if (!input.trim() || isProcessing) return;
    setIsProcessing(true);

    addTerminalLine(`$ vibe "${input}"`, 'input');

    const activeFile = tabs.find(t => t.id === activeTabId);
    const context = activeFile
      ? `The currently open file is "${activeFile.filePath}" with the following content:\n\`\`\`\n${activeFile.content}\n\`\`\``
      : '';

    try {
      const response = await callAI(
        [{ role: 'user', content: input }],
        {
          system: `You are Bappa, an AI coding assistant inside a distributed IDE. The user has issued a coding command via the command palette.${context ? `\n\n${context}` : ''}\n\nRespond with the specific code changes needed. If modifying a file, show the exact code to write. Be concise and precise.`,
        },
      );

      addTerminalLine(response, 'output');
      addTerminalLine('✅ Task complete', 'success');
    } catch (e: unknown) {
      const err = e as Error;
      addTerminalLine(`Error: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
      toggleCommandBar();
    }
  };

  const filtered = DEFAULT_SUGGESTIONS.filter((s) =>
    !input || s.label.toLowerCase().includes(input.toLowerCase()) || s.description.toLowerCase().includes(input.toLowerCase())
  );

  if (!commandBarOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={toggleCommandBar}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[580px] glass rounded-xl overflow-hidden glow-violet animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          {isProcessing ? (
            <div className="relative w-5 h-5">
              <Sparkles size={16} className="text-violet-400 animate-pulse" />
            </div>
          ) : (
            <Command size={16} className="text-violet-400 shrink-0" />
          )}
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="What do you want to vibe?"
            className="flex-1 bg-transparent text-[14px] text-zinc-200 placeholder:text-zinc-600 outline-none"
            disabled={isProcessing}
          />
          {input && !isProcessing && (
            <button onClick={handleSubmit} className="p-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 transition-colors">
              <ArrowRight size={14} />
            </button>
          )}
          <button onClick={toggleCommandBar} className="p-1 rounded hover:bg-white/5 text-zinc-600">
            <X size={14} />
          </button>
        </div>

        {/* Processing state */}
        {isProcessing && (
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <div className="animate-shimmer w-full h-1 rounded bg-violet-500/20" />
            </div>
            <div className="flex items-center gap-2 text-[12px] text-zinc-500">
              <Loader2 size={12} className="text-violet-400 animate-spin" />
              <span>Calling AI via OpenRouter...</span>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {!isProcessing && (
          <div className="max-h-[300px] overflow-y-auto py-1">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => { setInput(s.label); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-colors text-left group"
              >
                <div className="p-1.5 rounded-md bg-white/[0.03] border border-white/[0.04]">
                  {CATEGORY_ICONS[s.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-zinc-300 group-hover:text-zinc-100 transition-colors">{s.label}</p>
                  <p className="text-[11px] text-zinc-600 truncate">{s.description}</p>
                </div>
                <ArrowRight size={12} className="text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 px-4 py-2 border-t border-white/[0.06] bg-white/[0.01]">
          <div className="flex items-center gap-1.5">
            <GitBranch size={10} className="text-zinc-600" />
            <span className="text-[10px] text-zinc-600 font-mono">main</span>
          </div>
          <div className="w-px h-3 bg-white/[0.06]" />
          <span className="text-[10px] text-zinc-600">
            {selectedFile ? selectedFile.split('/').pop() : 'No file selected'}
          </span>
          <span className="ml-auto text-[10px] text-zinc-700">
            <kbd className="px-1 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] font-mono">Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
