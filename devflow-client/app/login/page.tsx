"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        name, // Optional: sent to backend for auto-registration
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-[#030712] flex items-center justify-center p-4 overflow-hidden font-mono text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-grid z-0 pointer-events-none" />
      <div className="fixed inset-0 scanline z-10 pointer-events-none" />
      
      <div className="max-w-md w-full relative z-20 bg-[#030712]/60 backdrop-blur-xl rounded-none border border-[#00ff9d]/20 p-8 shadow-[0_0_50px_-12px_rgba(0,255,157,0.1)]">
        {/* Decorative corner markers */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00ff9d]" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00ff9d]" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00ff9d]" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00ff9d]" />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tighter text-white mb-2">
            SYSTEM_LOGIN
          </h1>
          <p className="text-[#00ff9d]/60 text-xs tracking-widest uppercase">Identify to proceed</p>
        </div>

        {/* System Protocol Info */}
        <div className="mb-6 p-3 border border-[#00ff9d]/10 bg-[#00ff9d]/[0.03] text-[11px] text-white/50 leading-relaxed space-y-1">
          <p className="text-[#00ff9d]/70 font-bold uppercase tracking-wider text-[10px] mb-1.5">// System Protocol</p>
          <p><span className="text-[#00ff9d]/50">→</span> New email? An account will be created automatically.</p>
          <p><span className="text-[#00ff9d]/50">→</span> Returning user? Enter your existing access key to sign in.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/50 text-red-500 text-xs font-bold text-center tracking-wide">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#00ff9d]/80 mb-2 uppercase tracking-wider">
              Email // ID
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#030712]/50 border border-[#00ff9d]/20 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff9d] focus:shadow-[0_0_15px_-3px_rgba(0,255,157,0.3)] transition-all font-mono"
              placeholder="user@devflow.system"
            />
          </div>

          <div>
             <label className="block text-xs font-bold text-[#00ff9d]/80 mb-2 uppercase tracking-wider">
              Display Name <span className="text-white/30 text-[10px] normal-case">(Optional for new users)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#030712]/50 border border-[#00ff9d]/20 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff9d] focus:shadow-[0_0_15px_-3px_rgba(0,255,157,0.3)] transition-all font-mono"
              placeholder="OPERATOR_NAME"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#00ff9d]/80 mb-2 uppercase tracking-wider">
              Access Key
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#030712]/50 border border-[#00ff9d]/20 text-white placeholder-white/20 focus:outline-none focus:border-[#00ff9d] focus:shadow-[0_0_15px_-3px_rgba(0,255,157,0.3)] transition-all font-mono"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#00ff9d] text-black font-bold uppercase tracking-widest hover:bg-[#00ff9d]/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_-5px_rgba(0,255,157,0.5)]"
          >
            {loading ? "AUTHENTICATING..." : "INITIALIZE SESSION"}
          </button>
        </form>
      </div>
    </div>
  );
}
