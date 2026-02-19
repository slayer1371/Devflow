import { signOut } from "next-auth/react";

interface UserHeaderProps {
    email?: string | null;
}

export function UserHeader({ email }: UserHeaderProps) {
    return (
        <div className="absolute top-6 right-6 z-50 animate-[fadeIn_1s_ease-out]">
            <div className="flex items-center gap-4 p-2 pl-4 pr-2 rounded-full glass">
              <div className="flex flex-col items-end mr-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Logged in as</span>
                  <span className="text-sm font-bold text-white max-w-[150px] truncate">{email}</span>
              </div>
              
              <div className="h-8 w-[1px] bg-white/10"></div>

              <button 
                onClick={() => signOut()}
                className="px-4 py-2 text-sm font-medium bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white border border-white/10 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
              >
                  Sign Out
              </button>
          </div>
        </div>
    );
}
