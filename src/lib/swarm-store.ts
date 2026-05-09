// VibeCode Swarm Store — P2P state management
import { create } from 'zustand';
import type { Peer, ChunkStatus, SwarmStats, VibeTask } from './types';
import { generateId } from './utils';

const PEER_NAMES = ['Neptune', 'Orion', 'Pulsar', 'Quasar', 'Nebula', 'Cosmos', 'Photon', 'Stellar', 'Zenith', 'Aurora',
  'Cipher', 'Vector', 'Matrix', 'Prism', 'Helix', 'Vertex', 'Flux', 'Nova', 'Echo', 'Vortex'];
const LOCATIONS = ['US-East', 'US-West', 'EU-West', 'EU-Central', 'Asia-Pacific', 'South America', 'India-West', 'India-South'];

function randomPeer(i: number): Peer {
  return {
    id: `peer_${generateId()}`, displayName: PEER_NAMES[i % PEER_NAMES.length],
    status: (['idle', 'computing', 'verifying', 'seeding'] as const)[Math.floor(Math.random() * 4)],
    latency: 20 + Math.floor(Math.random() * 180), chunksProcessed: Math.floor(Math.random() * 500),
    uptime: Math.floor(Math.random() * 86400), cpuUsage: Math.floor(Math.random() * 80),
    location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)], joinedAt: Date.now() - Math.floor(Math.random() * 3600000),
  };
}

interface SwarmState {
  peers: Peer[];
  chunks: ChunkStatus[];
  tasks: VibeTask[];
  stats: SwarmStats;
  isConnected: boolean;
  initialized: boolean;
  connect: () => void;
  disconnect: () => void;
  submitTask: (prompt: string) => void;
  updateSimulation: () => void;
  initPeers: () => void;
}

export const useSwarmStore = create<SwarmState>((set, get) => ({
  peers: [],
  chunks: [],
  tasks: [],
  stats: {
    totalPeers: 47, activePeers: 32, totalChunks: 0, completedChunks: 0,
    failedChunks: 0, avgLatency: 67, cpuSaved: 78, ramSaved: 2048, bandwidth: 342, uptime: 14400,
  },
  isConnected: true,
  initialized: false,

  initPeers: () => {
    if (get().initialized) return;
    set({ peers: Array.from({ length: 47 }, (_, i) => randomPeer(i)), initialized: true });
  },

  connect: () => set({ isConnected: true }),
  disconnect: () => set({ isConnected: false }),

  submitTask: (prompt) => {
    const taskId = generateId();
    const numChunks = 10 + Math.floor(Math.random() * 20);
    const chunks: ChunkStatus[] = Array.from({ length: numChunks }, (_, i) => ({
      id: `chunk_${generateId()}`, taskId, index: i, totalChunks: numChunks,
      status: 'pending' as const, assignedPeers: [], hash: Math.random().toString(36).slice(2, 10),
      progress: 0, consensusReached: false, retries: 0,
    }));
    const task: VibeTask = {
      id: taskId, originalPrompt: prompt, fragments: [], status: 'fragmenting',
      progress: 0, createdAt: Date.now(), targetFiles: [], jigsawMap: {},
    };
    set((s) => ({
      chunks: [...s.chunks, ...chunks], tasks: [...s.tasks, task],
      stats: { ...s.stats, totalChunks: s.stats.totalChunks + numChunks },
    }));
  },

  updateSimulation: () => set((s) => {
    const peers = s.peers.map((p) => ({
      ...p,
      cpuUsage: Math.max(0, Math.min(100, p.cpuUsage + (Math.random() * 20 - 10))),
      latency: Math.max(10, p.latency + (Math.random() * 20 - 10)),
      status: Math.random() > 0.95
        ? (['idle', 'computing', 'verifying', 'seeding'] as const)[Math.floor(Math.random() * 4)]
        : p.status,
    }));
    const chunks = s.chunks.map((c) => {
      if (c.status === 'complete' || c.status === 'failed') return c;
      const progress = Math.min(100, c.progress + Math.random() * 15);
      let status = c.status;
      if (c.status === 'pending' && Math.random() > 0.7) status = 'dispatched';
      else if (c.status === 'dispatched' && Math.random() > 0.6) status = 'processing';
      else if (c.status === 'processing' && progress > 80) status = 'verifying';
      else if (c.status === 'verifying' && Math.random() > 0.5) status = 'complete';
      return { ...c, progress, status, consensusReached: status === 'complete' };
    });
    const completed = chunks.filter((c) => c.status === 'complete').length;
    return {
      peers, chunks,
      stats: { ...s.stats, activePeers: peers.filter((p) => p.status !== 'offline').length, completedChunks: completed, avgLatency: Math.round(peers.reduce((a, p) => a + p.latency, 0) / peers.length) },
    };
  }),
}));
