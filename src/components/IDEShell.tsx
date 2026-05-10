'use client';
import React, { useEffect, useRef } from 'react';
import TitleBar from '@/components/TitleBar';
import Sidebar from '@/components/Sidebar';
import RightSidebar from '@/components/RightSidebar';
import EditorArea from '@/components/EditorArea';
import BottomPanel from '@/components/BottomPanel';
import StatusBar from '@/components/StatusBar';
import CommandBar from '@/components/CommandBar';
import { useSwarmStore } from '@/lib/swarm-store';
import { useIDEStore } from '@/lib/store';

export default function IDEShell() {
  const initPeers = useSwarmStore((s) => s.initPeers);
  const { sidebarOpen, bottomPanelOpen, rightSidebarOpen, toggleSidebar, toggleRightSidebar, toggleBottomPanel } = useIDEStore();
  const initialized = useRef(false);

  useEffect(() => {
    initPeers();
  }, [initPeers]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const w = window.innerWidth;
    if (w < 1024 && sidebarOpen) toggleSidebar();
    if (w < 1280 && rightSidebarOpen) toggleRightSidebar();
    if (w < 768 && bottomPanelOpen) toggleBottomPanel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leftCol = sidebarOpen ? 'auto' : '0px';
  const rightCol = rightSidebarOpen ? 'auto' : '0px';

  return (
    <div
      className="ide-grid bg-[#09090b]"
      style={{ gridTemplateColumns: `${leftCol} 1fr ${rightCol}` }}
    >
      <TitleBar />
      
      {sidebarOpen && (
        <div className="ide-sidebar-left border-r border-[#1e1e22]">
          <Sidebar />
        </div>
      )}
      
      <div className="ide-main">
        <div className="flex-1 overflow-hidden min-h-0">
          <EditorArea />
        </div>
        
        {bottomPanelOpen && (
          <>
            <div className="h-[1px] bg-[#1e1e22] shrink-0" />
            <div className="overflow-hidden" style={{ flex: '0 0 50%', minHeight: 120 }}>
              <BottomPanel />
            </div>
          </>
        )}
      </div>

      {rightSidebarOpen && (
        <div className="ide-sidebar-right border-l border-[#1e1e22]">
          <RightSidebar />
        </div>
      )}

      <div className="ide-statusbar">
        <StatusBar />
      </div>

      <CommandBar />
    </div>
  );
}
