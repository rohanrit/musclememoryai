// Bappa Constants

export const APP_NAME = 'Bappa';
export const APP_VERSION = '0.1.0-alpha';
export const APP_TAGLINE = 'Distributed AI Coding — Powered by the Swarm';

// P2P Configuration
export const P2P_CONFIG = {
  MAX_PEERS: 256,
  MIN_CONSENSUS_PEERS: 3,
  CHUNK_TIMEOUT_MS: 30000,
  DHT_BOOTSTRAP_NODES: [
    'wss://tracker.bappa.dev',
    'wss://tracker2.bappa.dev',
  ],
  HEARTBEAT_INTERVAL_MS: 5000,
  MAX_RETRIES: 3,
};

// Task Fragmenter Configuration
export const FRAGMENTER_CONFIG = {
  MIN_FRAGMENTS: 10,
  MAX_FRAGMENTS: 50,
  MAX_FRAGMENT_SIZE: 500, // characters
  CONTEXT_WINDOW: 200,
};

// Security Configuration
export const SECURITY_CONFIG = {
  ENCRYPTION_ALGORITHM: 'x25519-xsalsa20-poly1305',
  HASH_ALGORITHM: 'sha-256',
  KEY_SIZE: 32,
  NONCE_SIZE: 24,
  SENSITIVE_PATTERNS: [
    /(?:API_KEY|api_key|apiKey)\s*[:=]\s*['"][^'"]+['"]/g,
    /(?:DATABASE_URL|DB_URL|db_url)\s*[:=]\s*['"][^'"]+['"]/g,
    /(?:SECRET|secret|SECRET_KEY)\s*[:=]\s*['"][^'"]+['"]/g,
    /(?:PASSWORD|password|passwd)\s*[:=]\s*['"][^'"]+['"]/g,
    /(?:TOKEN|token|ACCESS_TOKEN)\s*[:=]\s*['"][^'"]+['"]/g,
    /https?:\/\/[^\s'"]+/g,
  ],
};

// File extension to language mapping
export const LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescriptreact',
  '.js': 'javascript',
  '.jsx': 'javascriptreact',
  '.css': 'css',
  '.scss': 'scss',
  '.html': 'html',
  '.json': 'json',
  '.md': 'markdown',
  '.py': 'python',
  '.rs': 'rust',
  '.go': 'go',
  '.java': 'java',
  '.c': 'c',
  '.cpp': 'cpp',
  '.rb': 'ruby',
  '.php': 'php',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.xml': 'xml',
  '.sql': 'sql',
  '.sh': 'shell',
  '.bash': 'shell',
  '.toml': 'toml',
  '.env': 'plaintext',
  '.gitignore': 'plaintext',
  '.dockerignore': 'plaintext',
  '.dockerfile': 'dockerfile',
};

// File extension to icon color mapping
export const FILE_ICON_COLORS: Record<string, string> = {
  '.ts': '#3178c6',
  '.tsx': '#3178c6',
  '.js': '#f7df1e',
  '.jsx': '#61dafb',
  '.css': '#1572b6',
  '.scss': '#cc6699',
  '.html': '#e34f26',
  '.json': '#292929',
  '.md': '#ffffff',
  '.py': '#3776ab',
  '.rs': '#dea584',
  '.go': '#00add8',
  '.java': '#ed8b00',
  '.rb': '#cc342d',
  '.php': '#777bb4',
  '.swift': '#f05138',
  '.kt': '#7f52ff',
  '.yaml': '#cb171e',
  '.yml': '#cb171e',
  '.sql': '#336791',
};

// Command suggestions
export const DEFAULT_SUGGESTIONS = [
  { id: '1', label: 'Refactor component', description: 'Refactor a React component with best practices', icon: 'Wrench', category: 'refactor' as const },
  { id: '2', label: 'Add dark mode', description: 'Add dark mode toggle to the application', icon: 'Moon', category: 'style' as const },
  { id: '3', label: 'Generate API route', description: 'Generate a new API endpoint with validation', icon: 'Zap', category: 'generate' as const },
  { id: '4', label: 'Write unit tests', description: 'Generate unit tests for selected code', icon: 'TestTube', category: 'test' as const },
  { id: '5', label: 'Optimize performance', description: 'Analyze and optimize component performance', icon: 'Gauge', category: 'optimize' as const },
  { id: '6', label: 'Debug issue', description: 'Find and fix bugs in the selected code', icon: 'Bug', category: 'debug' as const },
];
