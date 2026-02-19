import { RoomCard } from "./RoomCard";
import { cn } from "@/lib/utils";

interface RoomListProps {
    rooms: Array<{
        id: string;
        name: string;
        userCount: number;
        createdAt: Date | string;
        language?: string;
    }>;
    title: string;
    emptyMessage: string;
}

export function RoomList({ rooms, title, emptyMessage }: RoomListProps) {
    if (rooms.length === 0) {
        return (
            <div className="text-center py-20 px-6 bg-[#030712]/40 border border-dashed border-[#00ff9d]/20 flex flex-col items-center">
              <div className="w-20 h-20 bg-[#00ff9d]/5 rounded-full flex items-center justify-center mb-6 border border-[#00ff9d]/20 relative">
                <div className="absolute inset-0 border border-[#00ff9d] opacity-20 rounded-full animate-ping" />
                <svg className="w-10 h-10 text-[#00ff9d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#00ff9d] mb-2 uppercase tracking-wide">Signal Lost</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto font-mono">
                  {emptyMessage}
              </p>
            </div>
        );
    }

    return (
        <div className="animate-[slideUp_0.5s_ease-out_forwards]">
            <div className="flex items-end justify-between mb-8 px-2 border-b border-[#00ff9d]/20 pb-4">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-4">
                        <span className="w-3 h-3 bg-[#00ff9d]" />
                        {title}
                    </h2>
                    <p className="text-[#00ff9d]/60 mt-1 text-xs font-mono uppercase tracking-wider pl-7">
                        {rooms.length} active session{rooms.length !== 1 ? 's' : ''} detected
                    </p>
                </div>
            </div>
            
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rooms.map((room, index) => (
                <div 
                    key={room.id} 
                    className="opacity-0 animate-[slideUp_0.5s_ease-out_forwards]"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <RoomCard {...room} />
                </div>
            ))}
            </div>
        </div>
    );
}
