'use client';
// SwarmMonitor — Real-time P2P computation dashboard
import React, { useEffect, useRef } from 'react';
import {
  Cpu, HardDrive, Wifi, Activity, Zap, Shield,
  CheckCircle2, Clock, AlertTriangle, Globe,
} from 'lucide-react';
import { useSwarmStore } from '@/lib/swarm-store';
import { formatDuration } from '@/lib/utils';

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      <div className={`p-1.5 rounded-md`} style={{ background: `${color}15` }}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-zinc-500">{label}</p>
        <p className="text-[13px] font-semibold text-zinc-200 font-mono">{value}</p>
        {sub && <p className="text-[10px] text-zinc-600">{sub}</p>}
      </div>
    </div>
  );
}

function PeerRow({ peer }: { peer: { displayName: string; status: string; latency: number; cpuUsage: number; location?: string; chunksProcessed: number } }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/[0.02] rounded text-[11px] transition-colors">
      <div className={`status-dot ${peer.status}`} />
          <span className="text-zinc-300 w-12 sm:w-16 truncate font-mono">{peer.displayName}</span>
          <span className="text-zinc-600 w-12 sm:w-16 truncate hidden sm:block">{peer.location}</span>
          <span className="text-zinc-500 w-10 sm:w-12 text-right font-mono">{Math.round(peer.latency)}ms</span>
          <div className="flex-1 mx-1 sm:mx-2">
            <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${peer.cpuUsage}%`,
                  background: peer.cpuUsage > 70 ? '#f43f5e' : peer.cpuUsage > 40 ? '#f59e0b' : '#10b981',
                }}
              />
            </div>
          </div>
          <span className="text-zinc-600 w-8 sm:w-10 text-right font-mono">{peer.chunksProcessed}</span>
    </div>
  );
}

export default function SwarmMonitor() {
  const { peers, stats, chunks, updateSimulation } = useSwarmStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(updateSimulation, 2000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [updateSimulation]);

  const activeChunks = chunks.filter((c) => c.status !== 'complete' && c.status !== 'failed');
  const topPeers = peers.slice(0, 8);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Stats row */}
      <div className="flex gap-2 px-3 py-2 border-b border-[#1e1e22] overflow-x-auto flex-wrap">
        <StatCard icon={<Globe size={13} className="text-violet-400" />} label="Peers" value={`${stats.activePeers}/${stats.totalPeers}`} color="#7c3aed" />
        <StatCard icon={<Cpu size={13} className="text-cyan-400" />} label="CPU Saved" value={`${stats.cpuSaved}%`} color="#06b6d4" />
        <StatCard icon={<HardDrive size={13} className="text-emerald-400" />} label="RAM Saved" value={`${stats.ramSaved} MB`} color="#10b981" />
        <StatCard icon={<Activity size={13} className="text-amber-400" />} label="Latency" value={`${stats.avgLatency}ms`} color="#f59e0b" />
        <StatCard icon={<Zap size={13} className="text-rose-400" />} label="Bandwidth" value={`${stats.bandwidth} KB/s`} color="#f43f5e" />
        <StatCard icon={<Shield size={13} className="text-blue-400" />} label="Encrypted" value="100%" color="#3b82f6" />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Peer list */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          <div className="flex items-center gap-2 px-2 py-1 text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">
            <span className="w-3" />
            <span className="w-16">Peer</span>
            <span className="w-16">Region</span>
            <span className="w-12 text-right">Ping</span>
            <span className="flex-1 mx-2">CPU</span>
            <span className="w-10 text-right">Chunks</span>
          </div>
          {topPeers.map((p) => <PeerRow key={p.id} peer={p} />)}
        </div>

        {/* Chunk activity */}
        <div className="w-[180px] lg:w-[220px] border-l border-[#1e1e22] px-2 lg:px-3 py-2 overflow-y-auto hidden md:block">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-2">Active Chunks</p>
          {activeChunks.length === 0 ? (
            <p className="text-[11px] text-zinc-600 italic">No active tasks</p>
          ) : (
            activeChunks.slice(0, 6).map((c) => (
              <div key={c.id} className="mb-2">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-zinc-500 font-mono truncate">
                    {c.id.slice(0, 12)}
                  </span>
                  {c.status === 'complete' ? <CheckCircle2 size={10} className="text-emerald-400" /> :
                   c.status === 'failed' ? <AlertTriangle size={10} className="text-rose-400" /> :
                   <Clock size={10} className="text-zinc-500" />}
                </div>
                <div className="chunk-bar">
                  <div className={`chunk-bar-fill ${c.status}`} style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            ))
          )}

          <div className="mt-3 pt-2 border-t border-white/[0.04]">
            <div className="flex justify-between text-[10px]">
              <span className="text-zinc-600">Completed</span>
              <span className="text-emerald-400 font-mono">{stats.completedChunks}</span>
            </div>
            <div className="flex justify-between text-[10px] mt-1">
              <span className="text-zinc-600">Failed</span>
              <span className="text-rose-400 font-mono">{stats.failedChunks}</span>
            </div>
            <div className="flex justify-between text-[10px] mt-1">
              <span className="text-zinc-600">Uptime</span>
              <span className="text-zinc-400 font-mono">{formatDuration(stats.uptime * 1000)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
