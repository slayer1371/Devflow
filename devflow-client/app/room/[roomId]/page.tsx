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
      <header className="h-14 border-b border-white/5 bg-[#030712]/50 backdrop-blur-md flex items-center justify-between px-4 z-10 shrink-0">
        <div className="flex items-center gap-4">
             <button 
                onClick={() => router.push('/')}
                className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                title="Back to Dashboard"
             >
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
             </button>
             
             <div className="w-px h-6 bg-white/10 mx-1" />

             <h1 className="font-semibold text-sm flex items-center gap-2">
                <span className="text-muted-foreground">Room:</span>
                <span className="font-mono text-primary">{roomId}</span>
             </h1>
        </div>

        <div className="flex items-center gap-4">
            <ConnectionStatus status={connectionStatus} />
            
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {clientId ? `User ${clientId.substring(0,4)}` : 'You'}
            </div>
            
             <button 
                onClick={() => setIsShareModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 text-xs font-bold rounded-full transition-all shadow-[0_0_15px_-3px_var(--primary)]"
             >
                Share
             </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Editor Area */}
        <main className="flex-1 flex flex-col relative min-w-0">
            {/* Toolbar / Tabs */}
            <div className="h-10 bg-[#0a0a0a] border-b border-white/5 flex items-end px-2 gap-1 shrink-0">
                <div className="px-4 py-2 bg-[#1e1e1e] border-t border-l border-r border-white/10 rounded-t-lg text-xs font-medium text-white flex items-center gap-2 relative top-[1px]">
                    <svg className="w-3 h-3 text-yellow-500" fill="none" viewBox="0 0 24 24">
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
            "w-72 border-l border-white/5 bg-[#030712]/50 backdrop-blur-md flex flex-col transition-all duration-300 ease-in-out shrink-0",
            !isSidebarOpen && "w-0 border-none opacity-0 overflow-hidden"
        )}>
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Participants</h3>
                <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-white">Online</span>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        You
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">Current User</p>
                        <p className="text-xs text-green-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                            Active
                        </p>
                    </div>
                </div>
                
                 {/* Placeholder for other users */}
                 <div className="text-xs text-muted-foreground text-center mt-8 italic">
                    Waiting for others to join...
                 </div>
            </div>
            
            <div className="p-4 border-t border-white/5">
                <div className="text-[10px] text-muted-foreground text-center">
                    Version: {serverVersion}
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
        return <LoadingOverlay status="Authenticating..." />;
    }

    return <RoomPageContent roomId={roomId} />;
}