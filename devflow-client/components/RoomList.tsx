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
            <div className="text-center py-20 px-6 rounded-3xl glass border-dashed border-white/10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5">
                <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No Rooms Found</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  {emptyMessage}
              </p>
            </div>
        );
    }

    return (
        <div className="animate-[slideUp_0.5s_ease-out_forwards]">
            <div className="flex items-end justify-between mb-8 px-2">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        {title}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        {rooms.length} active session{rooms.length !== 1 ? 's' : ''}
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
