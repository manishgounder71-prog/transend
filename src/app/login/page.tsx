"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn, UserPlus, Cpu, ShieldAlert } from "lucide-react";
import ParticleSpace from "@/components/ParticleSpace";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if already authenticated — if so, redirect
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace(redirectTo);
        }
      })
      .catch(() => {
        // Not authenticated — show login
      })
      .finally(() => setIsChecking(false));
  }, [router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { email, password, name: name.trim() || email.split("@")[0] };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed.");
        setIsLoading(false);
        return;
      }

      // Success — redirect to the app
      router.replace(redirectTo);
    } catch {
      setError("Network error. Is the server running?");
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#050816]">
        <ParticleSpace />
        <div className="glow-bubble bubble-purple" />
        <div className="glow-bubble bubble-blue" />
        <div className="flex items-center gap-3 text-white/40 font-mono text-xs animate-pulse z-10">
          <Cpu size={16} className="animate-spin" />
          Verifying session...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050816] overflow-hidden">
      <ParticleSpace />
      <div className="glow-bubble bubble-purple" />
      <div className="glow-bubble bubble-blue" />

      <div className="z-10 w-full max-w-[420px] px-4 animate-in fade-in zoom-in-95 duration-500">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <span className="font-mono text-[9px] font-bold text-[#00f0ff] tracking-[0.25em] mb-3 block uppercase">
            SECURE ACCESS // AUTHENTICATION REQUIRED
          </span>
          <h1 className="text-4xl font-black tracking-tighter leading-none select-none bg-gradient-to-r from-white via-white to-purple-400 bg-clip-text text-transparent filter drop-shadow-[0_0_12px_rgba(168,85,247,0.35)]">
            ORBIT<span className="bg-gradient-to-r from-[#00f0ff] to-[#0072ff] bg-clip-text text-transparent">CTO</span>X
          </h1>
        </div>

        {/* Auth Card */}
        <div className="glass-panel p-6">
          {/* Mode Toggle */}
          <div className="flex mb-6 border border-white/5 rounded-lg overflow-hidden">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-[11px] font-bold tracking-wide uppercase transition flex items-center justify-center gap-1.5 ${
                mode === "login"
                  ? "bg-[#00f0ff]/10 text-[#00f0ff] border-b-2 border-[#00f0ff]"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              <LogIn size={12} />
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2 text-[11px] font-bold tracking-wide uppercase transition flex items-center justify-center gap-1.5 ${
                mode === "register"
                  ? "bg-[#a855f7]/10 text-[#a855f7] border-b-2 border-[#a855f7]"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              <UserPlus size={12} />
              Register
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/5 border border-red-500/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <ShieldAlert size={12} className="text-red-400 flex-shrink-0" />
              <span className="text-[10px] text-red-400 font-mono">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name field (registration only) */}
            {mode === "register" && (
              <div>
                <label className="font-mono text-[9px] font-bold text-white/40 uppercase tracking-wider mb-1 block">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (e.g. CTO Command)"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#a855f7]/40 transition placeholder-white/25"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="font-mono text-[9px] font-bold text-white/40 uppercase tracking-wider mb-1 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="command@orbitcto.dev"
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#00f0ff]/40 transition placeholder-white/25"
              />
            </div>

            {/* Password */}
            <div>
              <label className="font-mono text-[9px] font-bold text-white/40 uppercase tracking-wider mb-1 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "At least 6 characters" : "Enter your password"}
                  required
                  minLength={mode === "register" ? 6 : 1}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2.5 pr-10 text-xs text-white outline-none focus:border-[#00f0ff]/40 transition placeholder-white/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full font-sans text-xs font-bold text-slate-950 bg-gradient-to-r from-[#00f0ff] to-[#0072ff] rounded-lg px-4 py-3 cursor-pointer shadow-[0_4px_24px_rgba(0,240,255,0.3)] hover:shadow-[0_6px_32px_rgba(0,240,255,0.5)] transition disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <span className="w-3 h-3 border border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                  Authorizing...
                </>
              ) : (
                <>
                  {mode === "login" ? <LogIn size={13} /> : <UserPlus size={13} />}
                  {mode === "login" ? "Authenticate" : "Create Account"}
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-5 pt-4 border-t border-white/5 text-center">
            <p className="text-[8px] font-mono text-white/20 leading-relaxed">
              Credentials are hashed with bcrypt (12 rounds). Sessions expire after 7 days.
              <br />
              All data is stored locally in SQLite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen flex items-center justify-center bg-[#050816]">
        <ParticleSpace />
        <div className="glow-bubble bubble-purple" />
        <div className="glow-bubble bubble-blue" />
        <div className="flex items-center gap-3 text-white/40 font-mono text-xs animate-pulse z-10">
          <Cpu size={16} className="animate-spin" />
          Loading secure terminal...
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
