// Demo file tree and contents for VibeCode IDE
import type { FileNode, TerminalLine } from './types';

export const DEMO_FILE_TREE: FileNode[] = [
  {
    name: 'vibecode-app', path: '/vibecode-app', type: 'directory',
    children: [
      {
        name: 'src', path: '/vibecode-app/src', type: 'directory',
        children: [
          {
            name: 'components', path: '/vibecode-app/src/components', type: 'directory',
            children: [
              { name: 'Header.tsx', path: '/vibecode-app/src/components/Header.tsx', type: 'file', extension: '.tsx', size: 2048 },
              { name: 'Sidebar.tsx', path: '/vibecode-app/src/components/Sidebar.tsx', type: 'file', extension: '.tsx', size: 3100 },
              { name: 'Dashboard.tsx', path: '/vibecode-app/src/components/Dashboard.tsx', type: 'file', extension: '.tsx', size: 4200 },
            ],
          },
          {
            name: 'hooks', path: '/vibecode-app/src/hooks', type: 'directory',
            children: [
              { name: 'useAuth.ts', path: '/vibecode-app/src/hooks/useAuth.ts', type: 'file', extension: '.ts', size: 1560 },
              { name: 'useTheme.ts', path: '/vibecode-app/src/hooks/useTheme.ts', type: 'file', extension: '.ts', size: 780 },
            ],
          },
          {
            name: 'lib', path: '/vibecode-app/src/lib', type: 'directory',
            children: [
              { name: 'api.ts', path: '/vibecode-app/src/lib/api.ts', type: 'file', extension: '.ts', size: 2340 },
              { name: 'utils.ts', path: '/vibecode-app/src/lib/utils.ts', type: 'file', extension: '.ts', size: 1120 },
            ],
          },
          { name: 'App.tsx', path: '/vibecode-app/src/App.tsx', type: 'file', extension: '.tsx', size: 1800 },
          { name: 'index.css', path: '/vibecode-app/src/index.css', type: 'file', extension: '.css', size: 3400 },
        ],
      },
      { name: 'package.json', path: '/vibecode-app/package.json', type: 'file', extension: '.json', size: 1240 },
      { name: 'tsconfig.json', path: '/vibecode-app/tsconfig.json', type: 'file', extension: '.json', size: 560 },
      { name: '.env', path: '/vibecode-app/.env', type: 'file', extension: '.env', size: 120 },
      { name: 'README.md', path: '/vibecode-app/README.md', type: 'file', extension: '.md', size: 2800 },
    ],
  },
];

export const DEMO_CONTENTS: Record<string, string> = {
  '/vibecode-app/src/App.tsx': [
    "import React from 'react';",
    "import { Header } from './components/Header';",
    "import { Dashboard } from './components/Dashboard';",
    "import { useAuth } from './hooks/useAuth';",
    "",
    "export default function App() {",
    "  const { user, isAuthenticated } = useAuth();",
    "",
    "  return (",
    "    <div className=\"app dark\">",
    "      <Header user={user} />",
    "      <main className=\"app-content\">",
    "        <Dashboard />",
    "      </main>",
    "    </div>",
    "  );",
    "}",
  ].join('\n'),
  '/vibecode-app/src/components/Header.tsx': [
    "import React from 'react';",
    "",
    "interface HeaderProps {",
    "  user: { name: string; avatar: string };",
    "}",
    "",
    "export function Header({ user }: HeaderProps) {",
    "  return (",
    "    <header className=\"h-14 border-b border-zinc-800 bg-zinc-950 flex items-center px-4\">",
    "      <span className=\"text-violet-500 font-bold\">VC</span>",
    "      <span className=\"text-zinc-400 ml-2\">VibeCode</span>",
    "      <div className=\"ml-auto flex items-center gap-2\">",
    "        <span className=\"text-sm text-zinc-300\">{user.name}</span>",
    "      </div>",
    "    </header>",
    "  );",
    "}",
  ].join('\n'),
  '/vibecode-app/src/lib/api.ts': [
    "const BASE_URL = 'https://api.example.com';",
    "const API_KEY = 'sk-vibecode-xxxxx-xxxxx';",
    "",
    "export async function apiClient<T>(endpoint: string): Promise<T> {",
    "  const res = await fetch(`${BASE_URL}${endpoint}`, {",
    "    headers: { Authorization: `Bearer ${API_KEY}` },",
    "  });",
    "  return res.json();",
    "}",
  ].join('\n'),
  '/vibecode-app/.env': [
    "DATABASE_URL=file:./local.db",
    "API_SECRET_KEY=sk-prod-aBcDeFgHiJkLmNoPqRs",
    "JWT_SECRET=my-super-secret-jwt-key",
  ].join('\n'),
};

export const INITIAL_TERMINAL: TerminalLine[] = [
  { id: '1', content: '⚡ VibeCode v0.1.0-alpha — Distributed AI Coding IDE', type: 'system', timestamp: 0 },
  { id: '2', content: '🌐 Connecting to DHT network...', type: 'system', timestamp: 0 },
  { id: '3', content: '✓ Connected to 3 bootstrap nodes', type: 'success', timestamp: 0 },
  { id: '4', content: '✓ Peer identity: vb_x7k9m2...', type: 'success', timestamp: 0 },
  { id: '5', content: '🔒 E2E encryption initialized', type: 'system', timestamp: 0 },
  { id: '6', content: '✓ Ready — 47 peers in swarm', type: 'success', timestamp: 0 },
];
