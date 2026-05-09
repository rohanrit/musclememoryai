'use client';
// StatusBar — bottom status bar with file info, encoding, position
import React from 'react';
import { GitBranch, Shield, Cpu, Wifi } from 'lucide-react';
import { useIDEStore } from '@/lib/store';
import { useSwarmStore } from '@/lib/swarm-store';

export default function StatusBar() {
  const { tabs, activeTabId } = useIDEStore();
  const { isConnected, stats } = useSwarmStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="h-[22px] flex items-center bg-[#07070a] border-t border-[#1e1e22] px-3 text-[11px] select-none shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-zinc-500">
          <GitBranch size={11} className="text-cyan-400" />
          <span>main</span>
        </div>
        <div className="flex items-center gap-1">
          {isConnected ? (
            <>
              <Wifi size={10} className="text-emerald-400" />
              <span className="text-emerald-400">{stats.activePeers} peers</span>
            </>
          ) : (
            <span className="text-rose-400">Disconnected</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-zinc-600">
          <Shield size={10} className="text-violet-400" />
          <span>E2E</span>
        </div>
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-4 text-zinc-600">
        {activeTab && (
          <>
            <span>Ln 1, Col 1</span>
            <span>Spaces: 2</span>
            <span>UTF-8</span>
            <span className="capitalize">{activeTab.language}</span>
          </>
        )}
        <div className="flex items-center gap-1">
          <Cpu size={10} />
          <span>Local: 12%</span>
        </div>
      </div>
    </div>
  );
}
