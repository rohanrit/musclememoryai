// Bappa Type Definitions

// ===== File System Types =====
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  extension?: string;
  size?: number;
  modified?: number;
}

// ===== P2P / Swarm Types =====
export type PeerStatus = 'idle' | 'computing' | 'verifying' | 'offline' | 'seeding';

export interface Peer {
  id: string;
  displayName: string;
  status: PeerStatus;
  latency: number; // ms
  chunksProcessed: number;
  uptime: number; // seconds
  cpuUsage: number; // 0-100
  location?: string;
  joinedAt: number;
}

export interface ChunkStatus {
  id: string;
  taskId: string;
  index: number;
  totalChunks: number;
  status: 'pending' | 'dispatched' | 'processing' | 'verifying' | 'complete' | 'failed';
  assignedPeers: string[];
  hash: string;
  progress: number; // 0-100
  result?: string;
  consensusReached: boolean;
  retries: number;
}

// ===== Task Fragmenter Types =====
export interface TaskFragment {
  id: string;
  parentTaskId: string;
  index: number;
  type: 'function' | 'css_module' | 'logic_block' | 'component' | 'config' | 'test';
  prompt: string;           // The obfuscated prompt sent to peers
  originalPrompt: string;   // The real prompt (local only)
  context: string;          // Stripped context
  dependencies: string[];   // IDs of fragments this depends on
  priority: number;
  encrypted: boolean;
  hash: string;
}

export interface VibeTask {
  id: string;
  originalPrompt: string;
  fragments: TaskFragment[];
  status: 'fragmenting' | 'dispatching' | 'processing' | 'assembling' | 'verifying' | 'complete' | 'failed';
  progress: number;
  createdAt: number;
  completedAt?: number;
  targetFiles: string[];
  jigsawMap: Record<string, string>; // Maps obfuscated vars back to real ones
}

// ===== Security Types =====
export interface EncryptionKeys {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

export interface ContextMapping {
  original: string;
  placeholder: string;
  type: 'api_key' | 'db_url' | 'brand_name' | 'variable' | 'path' | 'secret';
}

// ===== Diff / Live Sync Types =====
export interface FileDiff {
  filePath: string;
  hunks: DiffHunk[];
  checksum: string;
}

export interface DiffHunk {
  startLine: number;
  endLine: number;
  oldContent: string;
  newContent: string;
  verified: boolean;
}

// ===== Dashboard / Monitor Types =====
export interface SwarmStats {
  totalPeers: number;
  activePeers: number;
  totalChunks: number;
  completedChunks: number;
  failedChunks: number;
  avgLatency: number;
  cpuSaved: number; // percentage
  ramSaved: number; // MB
  bandwidth: number; // KB/s
  uptime: number;
}

// ===== Terminal Types =====
export interface TerminalLine {
  id: string;
  content: string;
  type: 'input' | 'output' | 'error' | 'system' | 'success';
  timestamp: number;
}

// ===== Command Bar Types =====
export interface CommandSuggestion {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: 'refactor' | 'generate' | 'debug' | 'style' | 'optimize' | 'test';
}

// ===== Editor Types =====
export interface EditorTab {
  id: string;
  filePath: string;
  fileName: string;
  language: string;
  content: string;
  isDirty: boolean;
  isActive: boolean;
}
