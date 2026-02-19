import { signOut } from "next-auth/react";

interface UserHeaderProps {
    email?: string | null;
}

export function UserHeader({ email }: UserHeaderProps) {
    return (
        <div className="absolute top-6 right-6 z-50 animate-[fadeIn_1s_ease-out]">
            <div className="flex items-center gap-4 p-2 pl-4 pr-2 bg-[#030712]/80 backdrop-blur-md border border-[#00ff9d]/20 transition-all hover:border-[#00ff9d]/50">
              <div className="flex flex-col items-end mr-2">
                  <span className="text-[10px] text-[#00ff9d] uppercase tracking-widest font-bold">Operator</span>
                  <span className="text-xs font-mono text-white max-w-[150px] truncate">{email}</span>
              </div>
              
              <div className="h-8 w-[1px] bg-[#00ff9d]/20"></div>

              <button 
                onClick={() => signOut()}
                className="px-4 py-2 text-xs font-bold font-mono bg-[#00ff9d]/10 hover:bg-[#00ff9d] hover:text-black text-[#00ff9d] border border-[#00ff9d]/20 transition-all duration-300 uppercase tracking-wider"
              >
                  Disconnect
              </button>
          </div>
        </div>
    );
}
