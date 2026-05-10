export interface AIModel {
  id: string;
  label: string;
  provider: 'opencode' | 'nvidia' | 'openrouter';
}

export const AI_MODELS: AIModel[] = [
  { id: 'big-pickle', label: 'Big Pickle', provider: 'opencode' },
  { id: 'qwen3.6-plus', label: 'Qwen 3.6 Plus', provider: 'opencode' },
  { id: 'kimi-k2.5', label: 'Kimi K2.5', provider: 'opencode' },
  { id: 'minimax-m2.7', label: 'MiniMax M2.7', provider: 'opencode' },
  { id: 'glm-5.1', label: 'GLM 5.1', provider: 'opencode' },
  { id: 'ling-2.6-flash', label: 'Ling 2.6 Flash', provider: 'opencode' },

  { id: 'nvidia/nemotron-3-super-120b-a12b', label: 'Nemotron 3 Super 120B', provider: 'nvidia' },
  { id: 'nvidia/llama-3.3-nemotron-super-49b-v1', label: 'Nemotron Super 49B', provider: 'nvidia' },
  { id: 'nvidia/llama-3.1-nemotron-ultra-253b-v1', label: 'Nemotron Ultra 253B', provider: 'nvidia' },

  { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'openrouter' },
  { id: 'anthropic/claude-3-opus', label: 'Claude 3 Opus', provider: 'openrouter' },
  { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash', provider: 'openrouter' },
  { id: 'openai/gpt-4o', label: 'GPT-4o', provider: 'openrouter' },
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openrouter' },
  { id: 'mistral/mistral-large', label: 'Mistral Large', provider: 'openrouter' },
];

export const DEFAULT_MODEL = 'big-pickle';

const PROVIDER_CONFIG: Record<string, { baseUrl: string; keyPrefix: string }> = {
  opencode: { baseUrl: 'https://opencode.ai/zen/v1/chat/completions', keyPrefix: 'opencode' },
  nvidia: { baseUrl: 'https://integrate.api.nvidia.com/v1/chat/completions', keyPrefix: 'nvidia' },
  openrouter: { baseUrl: 'https://openrouter.ai/api/v1/chat/completions', keyPrefix: 'openrouter' },
};

const PROVIDER_LABELS: Record<string, string> = {
  opencode: 'OpenCode',
  nvidia: 'NVIDIA',
  openrouter: 'OpenRouter',
};

function getProviderForModel(modelId: string): string {
  const entry = AI_MODELS.find(m => m.id === modelId);
  return entry?.provider || 'openrouter';
}

export async function callAI(
  messages: { role: string; content: string }[],
  options?: { model?: string; system?: string },
): Promise<string> {
  const modelId = options?.model || DEFAULT_MODEL;
  const provider = getProviderForModel(modelId);
  const config = PROVIDER_CONFIG[provider];
  if (!config) throw new Error(`Unknown provider for model "${modelId}"`);

  const apiKey = localStorage.getItem(`bappa_ai_key_${config.keyPrefix}`);
  if (!apiKey) {
    throw new Error(`${PROVIDER_LABELS[provider]} API key not configured. Set it in AI Provider Settings.`);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : '';
  }

  const res = await fetch(config.baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: modelId,
      messages: [
        ...(options?.system ? [{ role: 'system', content: options.system }] : []),
        ...messages,
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${PROVIDER_LABELS[provider]} error (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
