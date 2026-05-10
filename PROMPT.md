# Bappa — Distributed AI Coding IDE

## 📖 Project Overview
**Bappa** is a next-generation, decentralized IDE built for AI-assisted programming. It provides a full VS Code-like experience in the browser with native file system access, a real AI assistant (via OpenRouter), and a distributed swarm computing architecture.

## 🛠️ Tech Stack
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript (`.ts`, `.tsx`)
- **Styling**: Tailwind CSS v4 (Dark "Founder War-Room" aesthetic with glassmorphism, violet/amber accents)
- **State Management**: Zustand (IDE store + Swarm store)
- **Editor**: `@monaco-editor/react`
- **Icons**: `lucide-react`
- **Layout**: CSS Grid (`ide-grid` classes in `globals.css`)

## 🏗️ Architecture & Component Structure

### Key Components
- **`IDEShell.tsx`**: Master layout — CSS grid with resizable panels. Manages sidebar, editor area, right sidebar, bottom panel, and status bar.
- **`EditorArea.tsx`**: Monaco Editor with multi-file tabs, syntax highlighting, and empty state.
- **`RightSidebar.tsx`**: AI chat interface with multi-provider LLM support. Features:
  - Model selector dropdown grouped by provider (OpenCode, NVIDIA, OpenRouter)
  - 16+ models: Big Pickle (default), Qwen, Kimi, MiniMax, GLM, Nemotron, Claude, GPT, Gemini, Mistral
  - Full conversation history with loading state
  - Settings modal for API key management
- **`Sidebar.tsx`**: File tree explorer with:
  - File → Open Folder (native `showDirectoryPicker`)
  - File operations (New File, New Folder, Save, Rename, Delete)
  - Lazy-loading tree expansion
  - Search/filter files
- **`BottomPanel.tsx`**: Terminal, Swarm Monitor, Problems, Output tabs
- **`CommandBar.tsx`**: Ctrl+K command palette with real AI execution. Sends user commands to an LLM and shows results in the terminal.
- **`TitleBar.tsx`**: Top bar with branding, command bar trigger, panel toggle buttons, and swarm connectivity status.
- **`StatusBar.tsx`**: Bottom bar with git branch, E2E badge, tab info, CPU.
- **`ApiKeysModal.tsx`**: Manage AI provider keys (OpenCode, NVIDIA, OpenRouter, Anthropic, Google, etc.). Keys are persisted to `localStorage`.

### Core Logic

#### IDE Store (`store.ts`)
- **State**: `fileTree`, `expandedDirs`, `tabs`, `activeTabId`, panel toggles, `fileHandles`, `dirHandles`, `terminalLines`, `commandBarOpen`
- **Actions**: File tree operations, tab management, panel toggling, terminal, file system operations

#### AI Module (`ai.ts`)
- Multi-provider routing: automatically selects correct API endpoint based on model
- **OpenCode** (`https://opencode.ai/zen/v1/chat/completions`) — models: Big Pickle **(default)**, Qwen 3.6 Plus, Kimi K2.5, MiniMax M2.7, GLM 5.1, Ling 2.6 Flash
- **NVIDIA NIM** (`https://integrate.api.nvidia.com/v1/chat/completions`) — models: Nemotron 3 Super 120B, Nemotron Super 49B, Nemotron Ultra 253B
- **OpenRouter** (`https://openrouter.ai/api/v1/chat/completions`) — models: Claude 3.5 Sonnet, Claude 3 Opus, Gemini 2.0 Flash, GPT-4o, GPT-4o Mini, Mistral Large
- API keys stored in `localStorage` with keys `bappa_ai_key_opencode`, `bappa_ai_key_nvidia`, `bappa_ai_key_openrouter`

#### Swarm Store (`swarm-store.ts`)
- Simulated P2P network state (peers, chunks, tasks, stats)
- Placeholder for future real P2P/WebRTC implementation

#### File System Access (`file-system-access.ts`)
- Two modes: **client-side** (File System Access API via `showDirectoryPicker`) and **server-side** (Node.js `fs` via API routes)
- Handle-based file operations: `pickDirectory`, `readPickedDirectory`, `readFileFromHandle`, `refreshDirHandle`, `saveFileToHandle`, `createFileInDir`, `createDirInDir`, `deleteDirEntry`, `renameDirEntry`
- File System Access API is Chromium-only; falls back to server-scanned tree otherwise

#### Server-side API routes
- `GET /api/directory-content?path=` — lists directory children
- `GET /api/file-content?path=` — reads file content
- `POST /api/fs` — create-file, create-folder, rename, delete, save

## 🚀 Current State
- App starts with **no folder loaded** — user picks a folder via `File → Open Folder`
- **File System Access API** works in Chromium browsers; server-side fallback for others
- **AI chat** in RightSidebar is fully functional with 3 providers — OpenCode (default: Big Pickle), NVIDIA NIM, OpenRouter
- **Command Bar** (Ctrl+K) executes user prompts via AI, with active file context
- **All file operations** (create, rename, delete, save, refresh) work with both client-side handles and server-side API
- **API keys** persist to `localStorage` across sessions
- **Swarm/P2P** monitor is still simulated UI

## 🗺️ Next Steps
1. **Real P2P**: Replace swarm simulation with actual WebRTC/WebSocket peer connections, chunking, context stripping, and E2E encryption
2. **Persistence**: Local SQLite for saving tabs, chat history, workspace state
3. **MCP**: Wire MCP selector to actual tool registration and execution
4. **Context references**: `@` file/folder referencing in chat
5. **Browser support**: Graceful fallback for Firefox/Safari lacking File System Access API

## 🎨 Design Rules
- Follow `DESIGN.md` guidelines — dark backgrounds (`#0c0c0f`), violet/amber accents, glassmorphic borders
- Layout uses CSS grid (`ide-grid` classes) — never `react-resizable-panels`
- Global state via Zustand stores — never React `useState` for cross-component state
- Use `w-full h-full` on all panels; parent grid controls sizing
