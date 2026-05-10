'use client';
import React from 'react';
import { X, Key } from 'lucide-react';

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeysModal({ isOpen, onClose }: ApiKeysModalProps) {
  if (!isOpen) return null;

  const providers = [
    { id: 'google', name: 'Google (Gemini)' },
    { id: 'anthropic', name: 'Anthropic (Claude)' },
    { id: 'antigravity', name: 'Antigravity' },
    { id: 'opencode', name: 'OpenCode' },
    { id: 'openrouter', name: 'OpenRouter' },
    { id: 'openclaw', name: 'OpenClaw' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[calc(100%-2rem)] max-w-[500px] bg-[#0c0c0f] border border-[#1e1e22] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e22] bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-amber-400" />
            <span className="text-[13px] font-semibold text-zinc-200">AI Provider Settings</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>
        
        <div className="p-3 sm:p-4 flex-1 overflow-y-auto flex flex-col gap-4 max-h-[60vh]">
          <p className="text-[12px] text-zinc-400">Configure your API keys for different AI models and providers. These keys are stored locally in your browser.</p>
          
          <div className="flex flex-col gap-3">
            {providers.map((provider) => (
              <div key={provider.id} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-zinc-300 uppercase tracking-wider">{provider.name} API Key</label>
                <input 
                  type="password" 
                  placeholder={`Enter ${provider.name} key...`}
                  className="w-full bg-[#131317] border border-[#2a2a30] rounded-md px-3 py-1.5 text-[12px] text-zinc-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="px-3 sm:px-4 py-3 border-t border-[#1e1e22] bg-white/[0.01] flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded-md text-[12px] text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button onClick={onClose} className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
            Save Keys
          </button>
        </div>
      </div>
    </div>
  );
}
