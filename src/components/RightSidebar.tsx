'use client';
// Right Sidebar — Agent Chat for Vibe Coding
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, User, TerminalSquare, Settings, 
  ChevronDown, Cpu, Layers,
  MessageSquarePlus, X, Loader2,
} from 'lucide-react';
import ApiKeysModal from './ApiKeysModal';
import { callAI, AI_MODELS, DEFAULT_MODEL } from '@/lib/ai';
import type { AIModel } from '@/lib/ai';

export default function RightSidebar() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', role: 'agent', content: 'Ready for vibe coding. I have access to your workspace.' }
  ]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [isWaiting, setIsWaiting] = useState(false);
  const [showModels, setShowModels] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isWaiting) return;
    const userMsg = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsWaiting(true);

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const response = await callAI(history, {
        model: selectedModel,
        system: 'You are Bappa, an AI coding assistant inside a distributed IDE. Answer concisely with code examples when relevant. You can help with code generation, refactoring, debugging, and explaining code.',
      });
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'agent', content: response }]);
    } catch (e: unknown) {
      const err = e as Error;
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'agent', content: `Error: ${err.message}` }]);
    } finally {
      setIsWaiting(false);
    }
  };

  const newSession = () => {
    setMessages([{ id: '1', role: 'agent', content: 'Ready for vibe coding. I have access to your workspace.' }]);
  };

  const selectedLabel = AI_MODELS.find(m => m.id === selectedModel)?.label || selectedModel;

  return (
    <div className="w-full h-full bg-[#0c0c0f] flex flex-col overflow-hidden shrink-0 z-40">
      {/* Header Controls */}
      <div className="flex flex-col border-b border-[#1e1e22] bg-white/[0.01]">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e22]">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">AI Assistant</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={newSession} className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors" title="New Session">
              <MessageSquarePlus size={13} />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors" 
              title="Settings & API Keys"
            >
              <Settings size={13} />
            </button>
          </div>
        </div>

        {/* Configuration Toolbar */}
        <div className="px-2 py-1.5 flex flex-wrap gap-1 bg-[#0a0a0d]">
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModels(!showModels)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] transition-colors text-[10px] text-zinc-400"
            >
              <Cpu size={11} className="text-cyan-400" />
              <span className="truncate max-w-[80px]">{selectedLabel}</span>
              <ChevronDown size={10} />
            </button>
            {showModels && (
              <div className="absolute top-full left-0 mt-1 min-w-[180px] bg-[#1a1a1f] border border-[#2a2a30] rounded-lg shadow-xl py-1 z-50 max-h-[300px] overflow-y-auto">
                {(() => {
                  const groups: Record<string, AIModel[]> = {};
                  for (const m of AI_MODELS) {
                    (groups[m.provider] ??= []).push(m);
                  }
                  return Object.entries(groups).map(([provider, models]) => (
                    <div key={provider}>
                      <div className="px-3 py-1 text-[9px] text-zinc-600 uppercase tracking-wider font-semibold">{provider}</div>
                      {models.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => { setSelectedModel(m.id); setShowModels(false); }}
                          className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors flex items-center gap-2 ${selectedModel === m.id ? 'text-cyan-400 bg-cyan-400/10' : 'text-zinc-400 hover:bg-white/[0.04]'}`}
                        >
                          <span className="truncate flex-1">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${
              msg.role === 'agent' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
            }`} title={msg.role === 'agent' ? 'Agent' : 'User'}>
              {msg.role === 'agent' ? <Bot size={13} /> : <User size={13} />}
            </div>
            <div className={`text-[12px] p-2 rounded max-w-[90%] sm:max-w-[85%] leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user' ? 'bg-zinc-800/80 text-zinc-200 rounded-tr-none' : 'bg-[#1a1a1f] border border-[#2a2a30] text-zinc-300 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isWaiting && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bot size={13} />
            </div>
            <div className="bg-[#1a1a1f] border border-[#2a2a30] rounded p-3">
              <Loader2 size={14} className="text-zinc-500 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-[#1e1e22] bg-black/20 flex flex-col gap-2">
        {/* Text Input */}
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask agent to code... (@ to reference)"
            className="w-full bg-[#131317] border border-[#2a2a30] rounded-lg pl-3 pr-16 py-2 text-[12px] text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 resize-none min-h-[60px] pb-8"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isWaiting}
            className="absolute right-2 bottom-2 p-1.5 rounded-md text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-colors"
            title="Send"
          >
            <Send size={14} />
          </button>
        </div>
        
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <TerminalSquare size={11} />
            <span className="hidden sm:inline">Enter to send</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
            <Layers size={10} /> <span className="hidden sm:inline">{AI_MODELS.find(m => m.id === selectedModel)?.label || selectedModel}</span>
          </span>
        </div>
      </div>

      <ApiKeysModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
