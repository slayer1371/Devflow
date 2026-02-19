"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen relative bg-[#030712] text-white overflow-hidden font-mono selection:bg-[#00ff9d] selection:text-black">
      
      {/* Background Elements */}
      <div className="fixed inset-0 bg-grid z-0 pointer-events-none" />
      <div className="fixed inset-0 scanline z-10 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[#030712]/50 to-[#030712] z-0 pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4">
        
        {/* Status Badge */}
        <div className={`mb-8 px-4 py-1 border border-[#00ff9d]/30 bg-[#00ff9d]/10 rounded-full text-[#00ff9d] text-xs tracking-[0.2em] transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          SYSTEM: ONLINE
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 relative group cursor-default">
          <span className={`block transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            DEV_FLOW
          </span>
          <span className="absolute -inset-2 bg-[#00ff9d]/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full pointer-events-none" />
        </h1>

        <p className={`text-muted-foreground text-sm md:text-base max-w-md text-center mb-12 tracking-widest uppercase transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          Collaborative Development Environment // v2.0
        </p>

        {/* Action Button */}
        <Link 
          href="/dashboard"
          className={`group relative px-8 py-4 bg-transparent overflow-hidden border border-[#00ff9d] text-[#00ff9d] font-bold tracking-wider hover:text-black transition-colors duration-300 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          style={{ transitionDelay: '500ms' }}
        >
          <span className="relative z-10 flex items-center gap-2">
            INITIALIZE_SYSTEM
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 12h17" />
            </svg>
          </span>
          <div className="absolute inset-0 bg-[#00ff9d] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
        </Link>


        {/* Footer Data */}
        <div className={`absolute bottom-8 left-0 right-0 flex justify-between px-8 text-[10px] text-[#00ff9d]/40 tracking-widest transition-opacity duration-1000 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <div>
            LAT: 32.4421<br/>
            LON: -112.992
          </div>
          <div className="text-right">
            MEM: 64TB<br/>
            CPU: QUANTUM
          </div>
        </div>

      </div>
      
    </main>
  );
}
