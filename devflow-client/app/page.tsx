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
    <main className="min-h-screen relative overflow-hidden text-foreground">
      
      {/* Decorative Background Mesh is in layout.tsx */}

      {/* User Header */}
      {session && <UserHeader email={session.user?.email} />}

      <div className="container mx-auto px-4 py-8 max-w-7xl pt-32">
        
        {/* Hero Section */}
        <section className="text-center mb-20 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 animate-[fadeIn_1s_ease-out]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-xs font-medium tracking-wide text-primary-foreground/80 uppercase">Free for everyone</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 relative">
                <span className="absolute -inset-1 blur-3xl opacity-20 bg-gradient-to-r from-primary via-purple-500 to-secondary rounded-full"></span>
                <span className="relative text-gradient drop-shadow-2xl">
                    DevFlow
                </span>
            </h1>
            
            <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                Collaborate on code in real-time with zero friction. <br className="hidden md:block"/>
                <span className="text-white font-medium">Synced instantly. Secured by default.</span>
            </p>

            <button 
                onClick={createRoom}
                disabled={loading}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black text-lg font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-100 via-white to-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating...
                        </>
                    ) : (
                        <>
                            Start Coding Now
                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
                title="Your Projects"
                emptyMessage="You haven't created any projects yet. Click 'Start Coding Now' to create one."
            />
        </section>

      </div>
    </main>
  );
}