'use client';
// StatusBar — bottom status bar with file info, encoding, position
import React from 'react';
import { GitBranch, Shield, Cpu, Wifi, ChevronUp, ChevronDown, Terminal } from 'lucide-react';
import { useIDEStore } from '@/lib/store';
import { useSwarmStore } from '@/lib/swarm-store';

export default function StatusBar() {
  const { tabs, activeTabId, bottomPanelOpen, toggleBottomPanel } = useIDEStore();
  const { isConnected, stats } = useSwarmStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="h-[22px] flex items-center bg-[#07070a] border-t border-[#1e1e22] px-2 sm:px-3 text-[11px] select-none shrink-0">
      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-1 text-zinc-500 shrink-0">
          <GitBranch size={11} className="text-cyan-400" />
          <span className="hidden sm:inline">main</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isConnected ? (
            <>
              <Wifi size={10} className="text-emerald-400" />
              <span className="text-emerald-400">{stats.activePeers}p</span>
            </>
          ) : (
            <span className="text-rose-400 truncate">Disc</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-zinc-600 shrink-0 hidden sm:flex">
          <Shield size={10} className="text-violet-400" />
          <span>E2E</span>
        </div>
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4 text-zinc-600 min-w-0">
        {activeTab && (
          <>
            <span className="hidden sm:inline">Ln 1, Col 1</span>
            <span className="hidden md:inline">Spaces: 2</span>
            <span className="hidden md:inline">UTF-8</span>
            <span className="capitalize truncate max-w-[60px] sm:max-w-none">{activeTab.language}</span>
          </>
        )}
        <div className="flex items-center gap-1 shrink-0 hidden sm:flex">
          <Cpu size={10} />
          <span>Local: 12%</span>
        </div>
        <button
          onClick={toggleBottomPanel}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors shrink-0 ${
            bottomPanelOpen ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title={bottomPanelOpen ? 'Close panel' : 'Open panel'}
        >
          <Terminal size={10} />
          {bottomPanelOpen ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
        </button>
      </div>
    </div>
  );
}
