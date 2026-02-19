import { useRouter } from 'next/navigation';

export const AccessDenied = () => {
    const router = useRouter();

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#030712] text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/10 via-[#030712] to-[#030712]" />
            
            <div className="glass p-12 rounded-2xl border border-red-500/20 text-center relative z-10 max-w-md w-full animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/20">
                    <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                
                <h1 className="text-3xl font-bold mb-2 text-white">Access Denied</h1>
                <p className="text-muted-foreground mb-8">
                    This room is private. You need an invitation from the owner to join.
                </p>
                
                <button 
                    onClick={() => router.push('/')}
                    className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};
