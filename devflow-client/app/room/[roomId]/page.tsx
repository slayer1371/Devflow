"use client";

import { useParams, useRouter } from "next/navigation";
import { useCollaborativeRoom } from "@/hooks/useCollaborativeRoom";
import { RoomEditor } from "@/components/RoomEditor";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ShareModal } from "@/components/ShareModal";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

import { AccessDenied } from "@/components/AccessDenied";

function RoomPageContent({ roomId }: { roomId: string }) {
  const router = useRouter();
  
  const { 
      code, 
      connectionStatus, 
      clientId, 
      serverVersion, 
      handleEditorChange 
  } = useCollaborativeRoom(roomId);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (connectionStatus === "Access Denied") {
      return <AccessDenied />;
  }

  if (connectionStatus === "Connecting") {
      return <LoadingOverlay status={connectionStatus} />;
  }
  
  return (
    <div className="h-screen w-full flex flex-col bg-[#030712] text-foreground overflow-hidden">
      
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-[#00ff9d]/20 bg-[#030712]/80 backdrop-blur-md flex items-center justify-between px-4 z-10 shrink-0 font-mono">
        <div className="flex items-center gap-4">
             <button 
                onClick={() => router.push('/')}
                className="p-2 hover:bg-[#00ff9d]/10 rounded-none transition-colors group border border-transparent hover:border-[#00ff9d]/30"
                title="Back to Dashboard"
             >
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-[#00ff9d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
             </button>
             
             <div className="w-px h-6 bg-[#00ff9d]/20 mx-1" />

             <h1 className="font-semibold text-sm flex items-center gap-2">
                <span className="text-[#00ff9d]/60 uppercase tracking-wider text-xs">Room_ID:</span>
                <span className="font-mono text-[#00ff9d]">{roomId}</span>
             </h1>
        </div>

        <div className="flex items-center gap-4">
            <ConnectionStatus status={connectionStatus} />
            
            <div className="hidden md:flex items-center gap-2 text-xs text-[#00ff9d] bg-[#00ff9d]/5 px-3 py-1.5 border border-[#00ff9d]/20 tracking-wider font-mono">
                <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse"></span>
                {clientId ? `OP_${clientId.substring(0,4)}` : 'YOU'}
            </div>
            
             <button 
                onClick={() => setIsShareModalOpen(true)}
                className="bg-[#00ff9d] hover:bg-[#00ff9d]/90 text-black px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_-3px_rgba(0,255,157,0.4)] clip-path-polygon"
             >
                Share_Access
             </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Editor Area */}
        <main className="flex-1 flex flex-col relative min-w-0">
            {/* Toolbar / Tabs */}
            <div className="h-10 bg-[#0a0a0a] border-b border-[#00ff9d]/20 flex items-end px-2 gap-1 shrink-0 font-mono">
                <div className="px-4 py-2 bg-[#1e1e1e] border-t border-l border-r border-[#00ff9d]/20 text-xs font-medium text-[#00ff9d] flex items-center gap-2 relative top-[1px]">
                    <svg className="w-3 h-3 text-[#00ff9d]" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                    </svg>
                    main.js
                </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-1 relative bg-[#1e1e1e]">
                 <RoomEditor 
                    code={code} 
                    onChange={handleEditorChange} 
                />
            </div>
        </main>

        {/* Sidebar (Collapsible) */}
        <aside className={cn(
            "w-72 border-l border-[#00ff9d]/20 bg-[#030712]/90 backdrop-blur-md flex flex-col transition-all duration-300 ease-in-out shrink-0 font-mono",
            !isSidebarOpen && "w-0 border-none opacity-0 overflow-hidden"
        )}>
            <div className="p-4 border-b border-[#00ff9d]/20 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#00ff9d]">Participants</h3>
                <span className="px-2 py-0.5 border border-[#00ff9d]/30 bg-[#00ff9d]/10 text-[10px] text-[#00ff9d]">ONLINE</span>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-none border border-[#00ff9d] bg-[#00ff9d]/10 flex items-center justify-center text-xs font-bold text-[#00ff9d] shadow-[0_0_10px_-4px_rgba(0,255,157,0.3)]">
                        YOU
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">Current User</p>
                        <p className="text-xs text-[#00ff9d] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse"></span>
                            ACTIVE
                        </p>
                    </div>
                </div>
                
                 {/* Placeholder for other users */}
                 <div className="text-xs text-muted-foreground text-center mt-8 italic tracking-wide">
                    -- WAITING FOR PEERS --
                 </div>
            </div>
            
            <div className="p-4 border-t border-[#00ff9d]/20">
                <div className="text-[10px] text-[#00ff9d]/50 text-center tracking-widest">
                    SYSTEM_VER: {serverVersion}
                </div>
            </div>
        </aside>

      </div>
      
      {/* Floating Sidebar Toggle (if closed) */}
      {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute right-4 bottom-4 p-3 bg-primary rounded-full shadow-lg hover:scale-110 transition-transform z-50 text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
      )}
      
       {/* Explicit Sidebar Toggle (in header or overlaid) */}
       {isSidebarOpen && (
        <button 
             onClick={() => setIsSidebarOpen(false)}
             className="absolute right-4 top-16 p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-muted-foreground z-20"
             title="Collapse Sidebar"
        >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
        </button>  
       )}
       
       <ShareModal 
            roomId={roomId} 
            isOpen={isShareModalOpen} 
            onClose={() => setIsShareModalOpen(false)} 
       />

    </div>
  );
}

export default function Home() {
    const params = useParams();
    const roomId = typeof params.roomId === 'string' ? params.roomId : '';
    const { status } = useSession();

    if (status === "loading") {
        return <LoadingOverlay status="Authenticating" />;
    }

    return <RoomPageContent roomId={roomId} />;
}