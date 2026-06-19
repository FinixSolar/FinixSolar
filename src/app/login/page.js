"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { user, signIn, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy px-4 overflow-hidden font-sans transition-colors duration-300">
      {/* Decorative Gradient Blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue/10 dark:bg-blue/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-orange/10 dark:bg-orange/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 animate-fade-in">
        {/* Card */}
        <div className="glass-card rounded-2xl shadow-xl p-8 transition-all duration-300">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2.5 group mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue to-sky flex items-center justify-center shadow-lg shadow-blue/20 group-hover:scale-105 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="w-5 h-5 text-white">
                  <path strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2m0 14v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M3 12h2m14 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 100 10 5 5 0 000-10z" />
                </svg>
              </div>
              <span className="font-bold text-navy dark:text-white text-2xl tracking-tight">
                Finix<span className="text-orange">Solar</span>
              </span>
            </Link>
            <h2 className="text-xl font-bold text-navy dark:text-white text-center">
              Welcome Back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 text-center">
              Sign in to manage solar assets and clients
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-orange/10 border border-orange/20 text-orange dark:text-orange-light text-xs font-semibold flex items-start gap-3 animate-shake">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-navy dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <i className="fa-regular fa-envelope"></i>
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue dark:focus:border-sky transition-all text-sm text-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-navy dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <i className="fa-solid fa-lock"></i>
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue dark:focus:border-sky transition-all text-sm text-navy dark:text-white placeholder-slate-400 dark:placeholder-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue to-sky hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue/15 hover:shadow-blue/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue dark:text-sky hover:underline font-bold transition duration-150">
                Sign Up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
