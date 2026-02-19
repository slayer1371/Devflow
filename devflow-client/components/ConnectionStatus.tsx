import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
    status: "Connecting" | "Connected" | "Disconnected" | "Access Denied";
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
    const colorClass = 
        status === "Connected" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : 
        status === "Connecting" ? "bg-yellow-500 animate-pulse" : 
        "bg-red-500";

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm transition-all duration-300">
            <div className={cn("w-2 h-2 rounded-full transition-colors duration-500", colorClass)} />
            <span className={cn(
                "text-xs font-medium tracking-wide uppercase transition-colors",
                status === "Connected" ? "text-green-500" :
                status === "Connecting" ? "text-yellow-500" :
                "text-red-500"
            )}>
                {status}
            </span>
        </div>
    );
}
