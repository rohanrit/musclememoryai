# VibeCode Decentralized IDE

## 📖 Project Overview
**VibeCode** is a next-generation, decentralized, open-source IDE built specifically for AI-assisted programming ("Vibe Coding"). Its primary mission is to democratize AI compute by distributing complex AI computation tasks across a peer-to-peer (P2P) network ("The Swarm"), enabling low-resource hardware to run and assemble sophisticated AI inferences.

## 🛠️ Tech Stack
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript (`.ts`, `.tsx`)
- **Styling**: Tailwind CSS (Dark "Founder War-Room" Aesthetic with glassmorphism and violet/amber accents)
- **State Management**: Zustand (Global IDE state, Tabs, Swarm synchronization)
- **Core Editor**: `@monaco-editor/react` (VS Code's underlying editor, customized for the web)
- **Layout Management**: `react-resizable-panels` (Provides a fluid, resizable, and collapsible windowing system)
- **Icons**: `lucide-react`
- **Database (Target)**: Local SQLite (for local-first persistence)

## 🏗️ Architecture & Component Structure
The UI is heavily inspired by modern premium developer tools, utilizing a responsive multi-panel layout managed by `IDEShell.tsx`.

### Key Components
- **`IDEShell.tsx`**: The master layout component. Uses `<Group>` and `<Panel>` from `react-resizable-panels` to render the Left Sidebar (10%), Editor Area (65%), and Right Sidebar (25%).
- **`EditorArea.tsx`**: The central Monaco Editor space. Handles multi-file tabs, syntax highlighting, and an empty state for when no files are open.
- **`RightSidebar.tsx`**: The "Power-User" AI Agent interface. Features:
  - Dropdown selectors for Agents, Models, and MCP (Model Context Protocol) configurations.
  - Context attachment system (represented as UI "pills" for files and folders).
  - Chat interface for AI prompting.
- **`ApiKeysModal.tsx`**: A secure local interface for users to input and manage external provider API keys (Google, Anthropic, Antigravity, OpenCode, OpenRouter, OpenClaw).
- **`Sidebar.tsx` / `BottomPanel.tsx`**: Explorers for the file tree, P2P swarm statistics, and terminal output.

### Core Logic (Stores)
- **`store.ts` (IDEStore)**: Manages UI state including panel toggles (`sidebarOpen`, `rightSidebarOpen`, `bottomPanelOpen`), active tabs, and modal states.
- **`swarm-store.ts` (SwarmStore)**: Manages the mock (soon to be real) P2P network state. Tracks `peers`, `ChunkStatus` (pending, dispatched, processing, verifying, complete), latency, and computational progress.

## 🚀 Current State & Mocked Behaviors
Currently, the application is a high-fidelity prototype. 
- The **P2P Swarm** is simulated via `swarm-store.ts`, generating random peer nodes and progressing chunk computations purely visually.
- **Database**: The environment configuration mocks a local SQLite database connection string (`file:./local.db`).
- **Chat/Agent**: The chat interactions in the Right Sidebar are currently visually mocked and do not yet hook into the actual API key utility functions.

## 🗺️ Next Steps & Roadmap for AI Contributors
When extending VibeCode, focus on the following core pillars:

1. **Backend Connectivity**: Connect the mocked `ApiKeysModal` and `RightSidebar` chat to actual provider SDKs/APIs.
2. **Local Persistence**: Implement actual local SQLite reading/writing for storing API keys, editor tabs, and chat history persistently across sessions.
3. **Context Parsing**: Build out the `@` context referencing system so typing `@` in the chat input dynamically parses the active document, codebase file tree, or terminal output.
4. **MCP (Model Context Protocol) Integration**: Wire the MCP selector UI to actual tool registration and execution endpoints.
5. **P2P Fragmenter**: Replace the `swarm-store.ts` simulation with real WebRTC or WebSocket-based P2P peer connections, including payload chunking, context stripping, and E2E encryption.

## 🎨 Design Rules
*   **Aesthetics**: Follow the `DESIGN.md` guidelines. Use dark backgrounds (e.g., `#09090b`), violet primary accents (`#8b5cf6`), amber highlights for active AI, and glassmorphic borders (`border-white/[0.04]`).
*   **Responsiveness**: Always use `w-full h-full` and rely on `react-resizable-panels` to dictate the bounds of major sections.
*   **State**: Never use standard React `useState` for anything that needs to be accessed globally (like panel states or tab contents)—always utilize the Zustand stores.
