import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface ShareModalProps {
    roomId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ShareModal({ roomId, isOpen, onClose }: ShareModalProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [privacy, setPrivacy] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");

    if (!isOpen) return null;

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            await axios.post(`${API_URL}/api/rooms/${roomId}/invite`, { email });
            setMessage({ type: 'success', text: `Invitation sent to ${email}` });
            setEmail("");
        } catch (error: any) {
            console.error("Invite error:", error);
            setMessage({ type: 'error', text: error.response?.data?.error || "Failed to invite user" });
        } finally {
            setLoading(false);
        }
    };
    
    const copyLink = () => {
        // Since we are in the browser, window.location.href gives the current room URL
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setMessage({ type: 'success', text: "Link copied to clipboard!" });
        setTimeout(() => setMessage(null), 2000);
    };

    const togglePrivacy = async () => {
        const newPrivacy = privacy === "PUBLIC" ? "PRIVATE" : "PUBLIC";
        try {
             // Optimistic UI update
             setPrivacy(newPrivacy);
             const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
             await axios.patch(`${API_URL}/api/rooms/${roomId}/privacy`, { privacy: newPrivacy });
             setMessage({ type: 'success', text: `Room is now ${newPrivacy}` });
        } catch (error) {
            console.error("Privacy update error", error);
            // Revert on error
            setPrivacy(privacy); 
            setMessage({ type: 'error', text: "Failed to update privacy" });
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this room? This action cannot be undone.")) return;
        
        setLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const userId = session?.user ? (session.user as any).id : null;
            
            await axios.delete(`${API_URL}/api/rooms/${roomId}`, {
                data: { userId } // Pass userId in body for ownership check
            });
            
            router.push('/');
        } catch (error: any) {
            console.error("Delete error:", error);
            setMessage({ type: 'error', text: error.response?.data?.error || "Failed to delete room" });
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-6 animate-[scaleIn_0.2s_ease-out] overflow-hidden">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <h2 className="text-xl font-bold text-white mb-1">Share Project</h2>
                <p className="text-sm text-muted-foreground mb-6">Invite collaborators or copy the link.</p>
                
                {/* Privacy Toggle */}
                <div className="mb-6 p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                    <div>
                         <h3 className="text-sm font-semibold text-white">
                            {privacy === 'PUBLIC' ? 'Public Room' : 'Private Room'}
                         </h3>
                         <p className="text-xs text-muted-foreground">
                             {privacy === 'PUBLIC' ? 'Anyone with the link can join' : 'Only invited users can join'}
                         </p>
                    </div>
                    
                    <button 
                        onClick={togglePrivacy}
                        className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#0a0a0a]",
                            privacy === 'PUBLIC' ? "bg-green-500" : "bg-red-500"
                        )}
                    >
                        <span className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            privacy === 'PUBLIC' ? "translate-x-6" : "translate-x-1"
                        )} />
                    </button>
                </div>
                
                {/* Public Link Section (Only if Public) */}
                {privacy === 'PUBLIC' && (
                <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Project Link
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 truncate font-mono select-all">
                           {typeof window !== 'undefined' ? window.location.href : `.../room/${roomId}`}
                        </div>
                        <button 
                            onClick={copyLink}
                            className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Copy
                        </button>
                    </div>
                </div>
                )}
                
                {/* Invite Form (Only if Private) */}
                {privacy === 'PRIVATE' && (
                <form onSubmit={handleInvite} className="animate-in fade-in slide-in-from-top-2">
                     <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Invite by Email
                    </label>
                    <div className="flex gap-2">
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="colleague@example.com"
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            required
                        />
                        <button 
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Sending..." : "Invite"}
                        </button>
                    </div>
                </form>
                )}
                
                {/* Feedback Message */}
                {message && (
                    <div className={cn(
                        "mt-4 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2",
                        message.type === 'success' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    )}>
                        {message.type === 'success' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                        {message.text}
                    </div>
                )}
                
                {/* Danger Zone */}
                <div className="mt-8 pt-6 border-t border-white/10">
                    <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Danger Zone</h4>
                    <button 
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-3 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 text-sm font-medium transition-colors flex items-center justify-between group"
                    >
                        <span>Delete this room</span>
                         <svg className="w-4 h-4 opacity-50 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
