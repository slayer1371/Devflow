import Link from "next/link";
import { cn } from "@/lib/utils";

interface RoomCardProps {
    id: string;
    name: string;
    language?: string;
    userCount: number;
    createdAt: Date | string;
}

export function RoomCard({ id, name, language, userCount, createdAt }: RoomCardProps) {
    return (
        <Link href={`/room/${id}`} className="group cursor-pointer block h-full">
            <div className="relative h-full overflow-hidden bg-[#030712]/40 backdrop-blur-sm border border-[#00ff9d]/20 p-6 transition-all duration-300 hover:border-[#00ff9d] hover:bg-[#00ff9d]/5 hover:translate-y-[-2px] hover:shadow-[0_0_20px_-5px_rgba(0,255,157,0.2)]">
              
              {/* Decorative Corner Markers */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00ff9d] opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00ff9d] opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative flex flex-col justify-between h-full font-mono">
                <div>
                  <div className="flex justify-between items-start mb-4">
                     <h3 className="font-bold text-lg text-white group-hover:text-[#00ff9d] transition-colors truncate pr-4 tracking-tight uppercase">
                        {name}
                     </h3>
                     <span className="px-2 py-0.5 text-[10px] font-bold bg-[#00ff9d]/10 border border-[#00ff9d]/20 text-[#00ff9d] uppercase tracking-wider">
                        {language || 'JS'}
                     </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-6">
                    <div className="flex items-center gap-2 bg-black/40 px-2 py-1 border border-white/5">
                        <span className={cn("w-1.5 h-1.5 rounded-full", userCount > 0 ? "bg-[#00ff9d] shadow-[0_0_8px_rgba(0,255,157,0.8)]" : "bg-gray-600")}></span>
                        <span className="uppercase tracking-wide">{userCount} active</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#00ff9d]/10 pt-4 mt-auto flex justify-between items-center text-[10px] text-gray-500 group-hover:text-[#00ff9d]/70 transition-colors uppercase tracking-widest">
                  <span>ID: <span className="text-gray-400 group-hover:text-[#00ff9d]">{id.substring(0,8)}</span></span>
                  <span>{new Date(createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
        </Link>
    );
}
