export const AI_MODELS = [
  { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { id: 'anthropic/claude-3-opus', label: 'Claude 3 Opus' },
  { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash' },
  { id: 'openai/gpt-4o', label: 'GPT-4o' },
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
  { id: 'mistral/mistral-large', label: 'Mistral Large' },
];

export const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';

export async function callAI(
  messages: { role: string; content: string }[],
  options?: { model?: string; system?: string },
): Promise<string> {
  const apiKey = localStorage.getItem('bappa_ai_key_openrouter');
  if (!apiKey) throw new Error('OpenRouter key not configured. Set it in File → AI Provider Settings.');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
    },
    body: JSON.stringify({
      model: options?.model || DEFAULT_MODEL,
      messages: [
        ...(options?.system ? [{ role: 'system', content: options.system }] : []),
        ...messages,
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
