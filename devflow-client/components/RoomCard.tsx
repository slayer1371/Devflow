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
            <div className="relative h-full overflow-hidden rounded-2xl glass p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:shadow-primary/20 hover:shadow-2xl hover:border-primary/30">
              
              {/* Subtle Gradient Blob on Hover */}
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/20 blur-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" />
              
              <div className="relative flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-4">
                     <h3 className="font-bold text-xl text-white group-hover:text-primary transition-colors truncate pr-4">
                        {name}
                     </h3>
                     <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/5 border border-white/10 text-gray-300 group-hover:border-primary/30 transition-colors">
                        {language || 'javascript'}
                     </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-400 mb-6">
                    <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-md">
                        <span className={cn("w-2 h-2 rounded-full", userCount > 0 ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "bg-gray-600")}></span>
                        <span>{userCount} active</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 mt-auto flex justify-between items-center text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                  <span>ID: <span className="font-mono text-gray-400">{id.substring(0,6)}...</span></span>
                  <span>{new Date(createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
        </Link>
    );
}
