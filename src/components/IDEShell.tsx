'use client';
// VibeCode IDE — Main Shell
import React, { useEffect } from 'react';
import TitleBar from '@/components/TitleBar';
import Sidebar from '@/components/Sidebar';
import RightSidebar from '@/components/RightSidebar';
import EditorArea from '@/components/EditorArea';
import BottomPanel from '@/components/BottomPanel';
import StatusBar from '@/components/StatusBar';
import CommandBar from '@/components/CommandBar';
import { useSwarmStore } from '@/lib/swarm-store';

export default function IDEShell() {
  const initPeers = useSwarmStore((s) => s.initPeers);

  useEffect(() => {
    initPeers();
  }, [initPeers]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#09090b]">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorArea />
          <BottomPanel />
        </div>
        <RightSidebar />
      </div>
      <StatusBar />
      <CommandBar />
    </div>
  );
}
