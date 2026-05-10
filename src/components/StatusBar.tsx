'use client';
// StatusBar — bottom status bar with file info, encoding, position
import React from 'react';
import { GitBranch, Shield, Cpu } from 'lucide-react';
import { useIDEStore } from '@/lib/store';

export default function StatusBar() {
  const { tabs, activeTabId } = useIDEStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="h-[22px] flex items-center bg-[#07070a] border-t border-[#1e1e22] px-2 sm:px-3 text-[11px] select-none shrink-0">
      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-1 text-zinc-500 shrink-0">
          <GitBranch size={11} className="text-cyan-400" />
          <span className="hidden sm:inline">main</span>
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
      </div>
    </div>
  );
}
