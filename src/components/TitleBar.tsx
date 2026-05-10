'use client';
// TitleBar — the top bar of the IDE with branding, controls, and status
import React from 'react';
import {
  PanelLeftClose, PanelLeftOpen, Terminal, Layout,
  Wifi, WifiOff, Zap, Command, Sparkles,
} from 'lucide-react';
import { useIDEStore } from '@/lib/store';
import { useSwarmStore } from '@/lib/swarm-store';

export default function TitleBar() {
  const { sidebarOpen, rightSidebarOpen, bottomPanelOpen, toggleSidebar, toggleRightSidebar, toggleCommandBar, toggleBottomPanel, toggleAllPanels } = useIDEStore();
  const { isConnected, stats } = useSwarmStore();

  return (
    <div className="ide-titlebar flex items-center bg-[#0a0a0d] border-b border-[#1e1e22] px-2 sm:px-3 gap-1 sm:gap-2 select-none z-50">
      {/* Left: Brand */}
      <div className="flex items-center gap-1.5 mr-2 sm:mr-4 shrink-0">
        <div className="relative w-5 h-5">
          <div className="absolute inset-0 rounded bg-gradient-to-br from-violet-500 to-cyan-500 opacity-80" />
          <div className="absolute inset-[2px] rounded bg-[#0a0a0d] flex items-center justify-center">
            <Zap size={10} className="text-violet-400" />
          </div>
        </div>
        <span className="text-[13px] font-semibold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          Bappa
        </span>
        <span className="text-[10px] text-zinc-600 font-mono hidden sm:inline">v0.1α</span>
      </div>

      {/* Center: Command Bar Trigger */}
      <button
        onClick={toggleCommandBar}
        className="flex-1 min-w-0 max-w-xl mx-auto flex items-center gap-2 px-2 sm:px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-violet-500/30 hover:bg-white/[0.05] transition-all group cursor-text"
      >
        <Command size={12} className="text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
        <span className="text-[12px] text-zinc-600 group-hover:text-zinc-500 transition-colors truncate">
          Vibe a command...
        </span>
        <kbd className="ml-auto text-[10px] text-zinc-700 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] font-mono shrink-0 hidden sm:inline">
          Ctrl+K
        </kbd>
      </button>

      {/* Right: Toggle buttons */}
      <div className="flex items-center gap-1 sm:gap-2 ml-auto sm:ml-4">
        <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors shrink-0" title="Toggle Sidebar">
          {sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
        </button>
        <button onClick={toggleAllPanels} className={`p-1.5 rounded-md hover:bg-white/5 transition-colors shrink-0 ${
          sidebarOpen || rightSidebarOpen || bottomPanelOpen ? 'text-amber-400 bg-amber-400/10' : 'text-zinc-500 hover:text-zinc-300'
        }`} title="Toggle All Panels">
          <Layout size={14} />
        </button>
        <button onClick={toggleRightSidebar} className={`p-1.5 rounded-md hover:bg-white/5 transition-colors shrink-0 ${
          rightSidebarOpen ? 'text-amber-400 bg-amber-400/10' : 'text-zinc-500 hover:text-zinc-300'
        }`} title="Toggle Agent Chat">
          <Sparkles size={14} />
        </button>
        <button onClick={toggleBottomPanel} className={`p-1.5 rounded-md hover:bg-white/5 transition-colors shrink-0 hidden sm:block ${
          bottomPanelOpen ? 'text-amber-400 bg-amber-400/10' : 'text-zinc-500 hover:text-zinc-300'
        }`} title="Terminal">
          <Terminal size={14} />
        </button>

        <div className="w-px h-4 bg-white/[0.06] mx-0.5 sm:mx-1" />

        {/* Swarm Status */}
        <div className="flex items-center gap-1.5 px-1.5 sm:px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.04]">
          {isConnected ? (
            <Wifi size={12} className="text-emerald-400 shrink-0" />
          ) : (
            <WifiOff size={12} className="text-red-400 shrink-0" />
          )}
          <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
            {stats.activePeers} peers
          </span>
          <span className="text-[11px] text-zinc-500 font-mono sm:hidden">
            {stats.activePeers}
          </span>
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isConnected ? 'bg-emerald-400 animate-pulse-glow' : 'bg-red-400'}`} />
        </div>
      </div>
    </div>
  );
}
