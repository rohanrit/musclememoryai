'use client';
// BottomPanel — Terminal, Swarm Monitor, Problems, Output
import React from 'react';
import {
  Terminal as TerminalIcon, Radio, AlertCircle, FileOutput,
  ChevronDown, Maximize2, X,
} from 'lucide-react';
import { useIDEStore } from '@/lib/store';
import SwarmMonitor from './SwarmMonitor';

const PANELS = [
  { id: 'swarm' as const, label: 'Swarm Monitor', icon: <Radio size={13} /> },
  { id: 'terminal' as const, label: 'Terminal', icon: <TerminalIcon size={13} /> },
  { id: 'problems' as const, label: 'Problems', icon: <AlertCircle size={13} /> },
  { id: 'output' as const, label: 'Output', icon: <FileOutput size={13} /> },
];

function TerminalView() {
  const { terminalLines } = useIDEStore();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const typeColors: Record<string, string> = {
    input: 'text-cyan-400',
    output: 'text-zinc-300',
    error: 'text-rose-400',
    system: 'text-zinc-500',
    success: 'text-emerald-400',
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 font-mono text-[12px] leading-5">
      {terminalLines.map((line) => (
        <div key={line.id} className={`${typeColors[line.type] || 'text-zinc-400'} animate-fade-in`}>
          {line.content}
        </div>
      ))}
      <div className="flex items-center gap-1 mt-1">
        <span className="text-violet-400">❯</span>
        <span className="w-1.5 h-4 bg-violet-400/60 animate-pulse" />
      </div>
    </div>
  );
}

export default function BottomPanel() {
  const { bottomPanelOpen, activeBottomPanel, setActiveBottomPanel, toggleBottomPanel } = useIDEStore();

  if (!bottomPanelOpen) return null;

  return (
    <div className="h-[220px] bg-[#0a0a0d] border-t border-[#1e1e22] flex flex-col shrink-0">
      {/* Tab bar */}
      <div className="flex items-center border-b border-[#1e1e22] shrink-0">
        {PANELS.map((panel) => (
          <button
            key={panel.id}
            onClick={() => setActiveBottomPanel(panel.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] border-b-2 transition-colors ${
              activeBottomPanel === panel.id
                ? 'text-zinc-200 border-violet-500 bg-white/[0.02]'
                : 'text-zinc-600 border-transparent hover:text-zinc-400'
            }`}
          >
            {panel.icon}
            {panel.label}
            {panel.id === 'problems' && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[9px] font-mono ml-1">2</span>
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 pr-2">
          <button className="p-1 rounded hover:bg-white/5 text-zinc-600" onClick={toggleBottomPanel}>
            <ChevronDown size={13} />
          </button>
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {activeBottomPanel === 'terminal' && <TerminalView />}
        {activeBottomPanel === 'swarm' && <SwarmMonitor />}
        {activeBottomPanel === 'problems' && (
          <div className="p-3 text-[12px]">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <AlertCircle size={13} />
              <span className="font-mono">useAuth.ts:15 — Unused variable &apos;login&apos;</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle size={13} />
              <span className="font-mono">api.ts:2 — Hardcoded API key detected</span>
            </div>
          </div>
        )}
        {activeBottomPanel === 'output' && (
          <div className="p-3 text-[12px] text-zinc-500 font-mono">
            <p>Build output will appear here...</p>
          </div>
        )}
      </div>
    </div>
  );
}
