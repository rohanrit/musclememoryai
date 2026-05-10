// VibeCode IDE Store
import { create } from 'zustand';
import type { EditorTab, TerminalLine, FileNode } from './types';
import { generateId, getLanguageFromPath, getFileName } from './utils';
import { DEMO_FILE_TREE, DEMO_CONTENTS, INITIAL_TERMINAL } from './demo-data';

type PanelId = 'terminal' | 'swarm' | 'problems' | 'output';

interface IDEState {
  fileTree: typeof DEMO_FILE_TREE;
  expandedDirs: Set<string>;
  selectedFile: string | null;
  tabs: EditorTab[];
  activeTabId: string | null;
  sidebarOpen: boolean;
  rightSidebarOpen: boolean;
  bottomPanelOpen: boolean;
  activeBottomPanel: PanelId;
  terminalLines: TerminalLine[];
  commandBarOpen: boolean;
  fileContents: Record<string, string>;
  fileCount: number;
  totalSize: number;
  loadingDirs: Set<string>;
  initializeIDE: (tree: FileNode[], fileCount: number, totalSize: number) => void;
  setFileTree: (tree: FileNode[]) => void;
  loadDirectory: (path: string) => Promise<void>;
  refreshDirectory: (path: string) => Promise<void>;
  toggleDir: (path: string) => void;
  selectFile: (path: string) => void;
  openFile: (path: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  toggleSidebar: () => void;
  toggleRightSidebar: () => void;
  toggleBottomPanel: () => void;
  toggleAllPanels: () => void;
  setActiveBottomPanel: (panel: PanelId) => void;
  toggleCommandBar: () => void;
  addTerminalLine: (content: string, type: TerminalLine['type']) => void;
  updateFileContent: (path: string, content: string) => void;
}

export const useIDEStore = create<IDEState>((set, get) => ({
  fileTree: DEMO_FILE_TREE,
  expandedDirs: new Set(['/vibecode-app', '/vibecode-app/src', '/vibecode-app/src/components']),
  selectedFile: '/vibecode-app/src/App.tsx',
  tabs: [{
    id: 'tab-1', filePath: '/vibecode-app/src/App.tsx', fileName: 'App.tsx',
    language: 'typescriptreact', content: DEMO_CONTENTS['/vibecode-app/src/App.tsx'],
    isDirty: false, isActive: true,
  }],
  activeTabId: 'tab-1',
  sidebarOpen: true,
  rightSidebarOpen: true,
  bottomPanelOpen: true,
  activeBottomPanel: 'swarm',
  terminalLines: INITIAL_TERMINAL,
  commandBarOpen: false,
  fileContents: DEMO_CONTENTS,
  fileCount: 0,
  totalSize: 0,
  loadingDirs: new Set(),

  toggleDir: (path) => set((s) => {
    const next = new Set(s.expandedDirs);
    next.has(path) ? next.delete(path) : next.add(path);
    return { expandedDirs: next };
  }),

  selectFile: (path) => set({ selectedFile: path }),

  openFile: async (path) => {
    const s = get();
    const existing = s.tabs.find((t) => t.filePath === path);
    if (existing) {
      set({ tabs: s.tabs.map((t) => ({ ...t, isActive: t.id === existing.id })), activeTabId: existing.id, selectedFile: path });
      return;
    }
    let content = s.fileContents[path];
    if (!content) {
      try {
        const res = await fetch(`/api/file-content?path=${encodeURIComponent(path)}`);
        if (res.ok) {
          const data = await res.json();
          content = data.content;
        }
      } catch { /* fallback */ }
    }
    content = content || `// ${getFileName(path)}`;
    const tab: EditorTab = { id: generateId(), filePath: path, fileName: getFileName(path), language: getLanguageFromPath(path), content, isDirty: false, isActive: true };
    set((s) => ({
      tabs: [...s.tabs.map((t) => ({ ...t, isActive: false })), tab],
      activeTabId: tab.id,
      selectedFile: path,
      fileContents: { ...s.fileContents, [path]: content },
    }));
  },

  closeTab: (tabId) => {
    const s = get();
    const filtered = s.tabs.filter((t) => t.id !== tabId);
    if (!filtered.length) { set({ tabs: [], activeTabId: null, selectedFile: null }); return; }
    if (s.activeTabId === tabId) {
      const last = filtered[filtered.length - 1];
      set({ tabs: filtered.map((t) => ({ ...t, isActive: t.id === last.id })), activeTabId: last.id, selectedFile: last.filePath });
    } else { set({ tabs: filtered }); }
  },

  setActiveTab: (tabId) => set((s) => {
    const tab = s.tabs.find((t) => t.id === tabId);
    return { tabs: s.tabs.map((t) => ({ ...t, isActive: t.id === tabId })), activeTabId: tabId, selectedFile: tab?.filePath || s.selectedFile };
  }),

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleRightSidebar: () => set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
  toggleBottomPanel: () => set((s) => ({ bottomPanelOpen: !s.bottomPanelOpen })),
  toggleAllPanels: () => set((s) => ({
    sidebarOpen: !s.sidebarOpen,
    rightSidebarOpen: !s.rightSidebarOpen,
    bottomPanelOpen: !s.bottomPanelOpen,
  })),
  initializeIDE: (tree, fileCount, totalSize) => set(() => ({
    fileTree: tree,
    fileCount,
    totalSize,
    expandedDirs: new Set(),
  })),
  setFileTree: (tree) => set({ fileTree: tree, expandedDirs: new Set() }),
  refreshDirectory: async (dirPath) => {
    set((s) => ({ loadingDirs: new Set(s.loadingDirs).add(dirPath) }));
    try {
      const res = await fetch(`/api/directory-content?path=${encodeURIComponent(dirPath)}`);
      if (!res.ok) return;
      const data = await res.json();
      const children: FileNode[] = data.children;

      function mergeChildren(nodes: FileNode[]): FileNode[] {
        return nodes.map((n) => {
          if (n.path === dirPath) {
            return { ...n, children };
          }
          if (n.children) {
            return { ...n, children: mergeChildren(n.children) };
          }
          return n;
        });
      }

      set((s) => ({
        fileTree: mergeChildren(s.fileTree),
        loadingDirs: new Set([...s.loadingDirs].filter(d => d !== dirPath)),
      }));
    } catch {
      set((s) => ({
        loadingDirs: new Set([...s.loadingDirs].filter(d => d !== dirPath)),
      }));
    }
  },
  loadDirectory: async (dirPath) => {
    const s = get();
    if (s.loadingDirs.has(dirPath)) return;
    set((s) => ({ loadingDirs: new Set(s.loadingDirs).add(dirPath) }));
    try {
      const res = await fetch(`/api/directory-content?path=${encodeURIComponent(dirPath)}`);
      if (!res.ok) return;
      const data = await res.json();
      const children: FileNode[] = data.children;

      function mergeChildren(nodes: FileNode[]): FileNode[] {
        return nodes.map((n) => {
          if (n.path === dirPath) {
            return { ...n, children };
          }
          if (n.children) {
            return { ...n, children: mergeChildren(n.children) };
          }
          return n;
        });
      }

      set((s) => ({
        fileTree: mergeChildren(s.fileTree),
        loadingDirs: new Set([...s.loadingDirs].filter(d => d !== dirPath)),
      }));
    } catch {
      set((s) => ({
        loadingDirs: new Set([...s.loadingDirs].filter(d => d !== dirPath)),
      }));
    }
  },
  setActiveBottomPanel: (panel) => set({ activeBottomPanel: panel, bottomPanelOpen: true }),
  toggleCommandBar: () => set((s) => ({ commandBarOpen: !s.commandBarOpen })),

  addTerminalLine: (content, type) => set((s) => ({
    terminalLines: [...s.terminalLines, { id: generateId(), content, type, timestamp: Date.now() }],
  })),

  updateFileContent: (path, content) => set((s) => ({
    fileContents: { ...s.fileContents, [path]: content },
    tabs: s.tabs.map((t) => t.filePath === path ? { ...t, content, isDirty: true } : t),
  })),
}));
