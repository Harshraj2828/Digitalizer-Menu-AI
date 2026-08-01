"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMenuStore } from "@/store/useMenuStore";
import { Sparkles, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function SignIn() {
  const router = useRouter();
  const { login, checkSession, isLoading, error: storeError } = useMenuStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    checkSession().then((isLoggedIn) => {
      if (isLoggedIn) {
        router.push("/dashboard");
      }
    });
  }, [checkSession, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email || !password) {
      setValidationError("Please fill in all fields.");
      return;
    }

    const success = await login({ email, password });
    if (success) {
      router.push("/dashboard");
    }
  };

  // Helper to prefill mock credentials for easy evaluation
  const handleQuickFill = () => {
    setEmail("chef@spicesymphony.com");
    setPassword("password123");
  };

  return (
    <div className="bg-[#0A0A0C] text-[#EDEDF2] font-sans min-h-screen flex flex-col justify-center items-center px-6 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-rose-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full z-10">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-4 group hover:scale-105 transition-transform">
            <div className="h-10 w-10 bg-gradient-to-tr from-rose-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-rose-400 bg-clip-text text-transparent">
              DIGIDISH
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="text-slate-400 text-xs mt-1">Sign in to manage your digital menu card and analytics</p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl border border-[#23232C] bg-[#121218]/80 p-8 backdrop-blur-xl shadow-2xl">
          {/* Error Message Box */}
          {(validationError || storeError) && (
            <div className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs flex items-start space-x-2.5">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{validationError || storeError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="chef@restaurant.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#2D2D38] bg-[#0E0E14] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#2D2D38] bg-[#0E0E14] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-rose-500/10 flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Sandbox Mode credentials */}
          <div className="mt-6 pt-6 border-t border-[#23232C] text-center">
            <button
              onClick={handleQuickFill}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors font-medium border border-rose-500/20 bg-rose-500/5 px-4 py-2 rounded-xl"
            >
              Quick Fill Demo Credentials
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link href="/signup" className="text-rose-400 hover:text-rose-300 font-semibold transition-colors">
            Sign Up Now
          </Link>
        </p>
      </div>
    </div>
  );
}
