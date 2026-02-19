import { useRouter } from "next/navigation";

interface LoadingOverlayProps {
    status: "Connecting" | "Connected" | "Disconnected" | "Access Denied" | "Authenticating";
}

export function LoadingOverlay({ status }: LoadingOverlayProps) {
    const router = useRouter();
    
    // Don't render if connected
    if (status === "Connected") return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/80 backdrop-blur-md transition-all duration-500">
            <div className="flex flex-col items-center p-8 rounded-3xl bg-white/5 border border-white/10 shadow-2xl max-w-sm w-full">
                
                {(status === "Connecting" || status === "Authenticating") ? (
                    <div className="relative mb-6">
                        <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
                    </div>
                ) : (
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-6 text-red-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                )}
                
                <h3 className="text-xl font-bold text-white mb-2">
                    {status === "Connecting" ? "Joining Room..." : 
                     status === "Authenticating" ? "Authenticating..." : 
                     "Connection Lost"}
                </h3>
                
                <p className="text-muted-foreground text-center text-sm mb-6">
                    {status === "Access Denied" 
                        ? "You do not have permission to access this private room."
                        : status === "Authenticating"
                        ? "Verifying your session..."
                        : "Establishing a secure connection to the collaborative server..."}
                </p>
                
                {(status !== "Connecting" && status !== "Authenticating") && (
                    <button 
                        onClick={() => router.push('/')}
                        className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:scale-105 transition-transform"
                    >
                        Return to Dashboard
                    </button>
                )}
            </div>
        </div>
    );
}
