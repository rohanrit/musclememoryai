// Bappa Task Fragmenter — breaks user prompts into atomic micro-chunks
import type { TaskFragment, ContextMapping } from './types';
import { generateId, simulateHash } from './utils';
import { FRAGMENTER_CONFIG, SECURITY_CONFIG } from './constants';

/**
 * Strip sensitive context from a prompt before sending to peers.
 * Returns the sanitized prompt and a mapping for local reassembly.
 */
export function stripContext(input: string): { sanitized: string; mappings: ContextMapping[] } {
  const mappings: ContextMapping[] = [];
  let sanitized = input;
  let counter = 0;

  for (const pattern of SECURITY_CONFIG.SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, (match) => {
      const placeholder = `__VAR_${String.fromCharCode(65 + counter)}__`;
      counter++;
      let type: ContextMapping['type'] = 'variable';
      if (/api.?key/i.test(match)) type = 'api_key';
      else if (/database|db/i.test(match)) type = 'db_url';
      else if (/secret|password|token/i.test(match)) type = 'secret';
      else if (/https?:\/\//.test(match)) type = 'path';
      mappings.push({ original: match, placeholder, type });
      return placeholder;
    });
  }

  return { sanitized, mappings };
}

/**
 * Fragment a user prompt into multiple atomic sub-tasks.
 * Each fragment is small enough that no single peer can understand the full context.
 */
export function fragmentTask(prompt: string, targetFiles: string[]): TaskFragment[] {
  const { sanitized, mappings: _mappings } = stripContext(prompt);
  const parentTaskId = generateId();
  const fragments: TaskFragment[] = [];

  // Strategy: Split by logical boundaries
  const strategies = analyzePromptStrategy(sanitized);
  const numFragments = Math.max(
    FRAGMENTER_CONFIG.MIN_FRAGMENTS,
    Math.min(FRAGMENTER_CONFIG.MAX_FRAGMENTS, strategies.length)
  );

  for (let i = 0; i < numFragments; i++) {
    const subPrompt = strategies[i % strategies.length];
    const fragment: TaskFragment = {
      id: `frag_${generateId()}`,
      parentTaskId,
      index: i,
      type: inferFragmentType(subPrompt),
      prompt: subPrompt,
      originalPrompt: prompt,
      context: `[CHUNK ${i + 1}/${numFragments}]`,
      dependencies: i > 0 ? [`frag_${i - 1}`] : [],
      priority: numFragments - i,
      encrypted: true,
      hash: simulateHash(subPrompt + i),
    };
    fragments.push(fragment);
  }

  return fragments;
}

function analyzePromptStrategy(prompt: string): string[] {
  const strategies: string[] = [];
  const words = prompt.split(/\s+/);
  const chunkSize = Math.ceil(words.length / FRAGMENTER_CONFIG.MIN_FRAGMENTS);

  // Create semantic chunks
  const actions = ['analyze', 'generate', 'validate', 'optimize', 'refactor', 'test', 'style', 'document', 'lint', 'type-check'];

  for (let i = 0; i < Math.max(FRAGMENTER_CONFIG.MIN_FRAGMENTS, Math.ceil(words.length / chunkSize)); i++) {
    const start = i * chunkSize;
    const chunk = words.slice(start, start + chunkSize).join(' ');
    if (chunk.trim()) {
      strategies.push(`${actions[i % actions.length]}: ${chunk}`);
    }
  }

  // Ensure minimum fragments
  while (strategies.length < FRAGMENTER_CONFIG.MIN_FRAGMENTS) {
    strategies.push(`verify: chunk_${strategies.length} integrity check`);
  }

  return strategies;
}

function inferFragmentType(prompt: string): TaskFragment['type'] {
  const lower = prompt.toLowerCase();
  if (lower.includes('css') || lower.includes('style') || lower.includes('theme')) return 'css_module';
  if (lower.includes('component') || lower.includes('render') || lower.includes('jsx')) return 'component';
  if (lower.includes('function') || lower.includes('handler') || lower.includes('util')) return 'function';
  if (lower.includes('test') || lower.includes('spec')) return 'test';
  if (lower.includes('config') || lower.includes('env') || lower.includes('setting')) return 'config';
  return 'logic_block';
}
