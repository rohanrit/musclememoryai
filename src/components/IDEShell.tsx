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
import { useIDEStore } from '@/lib/store';
import { Panel, Group, Separator } from 'react-resizable-panels';

export default function IDEShell() {
  const initPeers = useSwarmStore((s) => s.initPeers);
  const { sidebarOpen, bottomPanelOpen, rightSidebarOpen } = useIDEStore();

  useEffect(() => {
    initPeers();
  }, [initPeers]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#09090b]">
      <TitleBar />
      
      <Group orientation="horizontal" className="flex-1 overflow-hidden">
        {sidebarOpen && (
          <>
            <Panel defaultSize={10} minSize={5} maxSize={40}>
              <Sidebar />
            </Panel>
            <Separator className="w-[1px] bg-[#1e1e22] hover:bg-violet-500/50 hover:w-[3px] active:bg-violet-500 transition-all cursor-col-resize z-50" />
          </>
        )}
        
        <Panel defaultSize={65} minSize={30}>
          <Group orientation="vertical" className="w-full h-full">
            <Panel defaultSize={70} minSize={30}>
              <EditorArea />
            </Panel>
            
            {bottomPanelOpen && (
              <>
                <Separator className="h-[1px] bg-[#1e1e22] hover:bg-violet-500/50 hover:h-[3px] active:bg-violet-500 transition-all cursor-row-resize z-50" />
                <Panel defaultSize={30} minSize={15} maxSize={60}>
                  <BottomPanel />
                </Panel>
              </>
            )}
          </Group>
        </Panel>

        {rightSidebarOpen && (
          <>
            <Separator className="w-[1px] bg-[#1e1e22] hover:bg-violet-500/50 hover:w-[3px] active:bg-violet-500 transition-all cursor-col-resize z-50" />
            <Panel defaultSize={25} minSize={20} maxSize={50}>
              <RightSidebar />
            </Panel>
          </>
        )}
      </Group>

      <StatusBar />
      <CommandBar />
    </div>
  );
}
