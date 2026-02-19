"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { UserHeader } from "@/components/UserHeader";
import { RoomList } from "@/components/RoomList";
import { cn } from "@/lib/utils";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [myRooms, setMyRooms] = useState<Array<{id: string, name: string, userCount: number, createdAt: Date, language?: string}>>([]);
  const [loading, setLoading] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  useEffect(() => {
    if (session?.user) {
        const userId = (session.user as any).id;
        fetch(`${API_URL}/api/my-rooms?userId=${userId}`)
            .then(res => res.json())
            .then(data => setMyRooms(data))
            .catch(err => console.error("Error fetching my rooms:", err));
    }
  }, [session, API_URL]);
  // Prevent rendering until session is determined (prevents flicker of "Guest" state if logged in)
  if (status === "loading") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#030712] text-white">
             <div className="flex flex-col items-center gap-4">
                 <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 <span className="text-sm font-medium text-muted-foreground animate-pulse">Loading Workspace...</span>
             </div>
        </div>
      );
  }



  function createRoom() {
    setLoading(true);
    const userId = session?.user ? (session.user as any).id : undefined;
    axios.post(`${API_URL}/api/rooms`, { 
        name: `Untitled Project ${Math.floor(Math.random() * 1000)}`,
        userId: userId
    })
      .then(response => {
        const roomId = response.data.roomId;
        router.push(`/room/${roomId}`);
      })
      .catch(error => {
        console.error("Error creating room:", error);
      })
      .finally(() => setLoading(false));
  }

  return (
    <main className="min-h-screen relative overflow-hidden text-foreground bg-[#030712] font-mono">
      
      {/* Background Elements */}
      <div className="fixed inset-0 bg-grid z-0 pointer-events-none" />
      <div className="fixed inset-0 scanline z-10 pointer-events-none" />
      
      {/* User Header */}
      <div className="relative z-20">
        {session && <UserHeader email={session.user?.email} />}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl pt-32 relative z-20">
        
        {/* Hero Section */}
        <section className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#00ff9d]/30 bg-[#00ff9d]/10 mb-6 rounded-none">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff9d] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff9d]"></span>
                </span>
                <span className="text-xs font-bold tracking-[0.2em] text-[#00ff9d] uppercase">System Ready</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 relative group">
                <span className="relative z-10">DEVFLOW_SYSTEM</span>
                <span className="absolute -inset-1 blur-2xl opacity-20 bg-[#00ff9d] rounded-full group-hover:opacity-40 transition-opacity duration-500"></span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 tracking-wide">
                SECURE COLLABORATIVE ENVIRONMENT <br className="hidden md:block"/>
                <span className="text-[#00ff9d]">v2.0 // ONLINE</span>
            </p>

            <button 
                onClick={createRoom}
                disabled={loading}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#00ff9d] text-black text-lg font-bold tracking-widest uppercase hover:bg-[#00ff9d]/90 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(0,255,157,0.5)] clip-path-polygon"
            >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            INITIALIZING...
                        </>
                    ) : (
                        <>
                            INITIATE PROJECT
                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 12h17" />
                            </svg>
                        </>
                    )}
                </span>
            </button>
        </section>

        {/* Content Area */}
        <section className="relative z-0 min-h-[400px]">
             <RoomList 
                rooms={myRooms} 
                title="ACTIVE_PROJECTS"
                emptyMessage="NO ACTIVE PROJECTS FOUND. INITIATE NEW PROJECT."
            />
        </section>

      </div>
    </main>
  );
}