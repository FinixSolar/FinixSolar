"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar/page";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#020813] font-sans text-navy dark:text-slate-100 overflow-hidden transition-colors duration-300">
      <Navbar />

      {/* Main Hero Container */}
      <main className="flex-1 flex flex-col items-center justify-center pt-32 px-6 md:px-12 relative z-10">
        
        {/* Glowing Blobs */}
        <div className="absolute top-[10%] left-[-15%] w-112.5 h-112.5 rounded-full bg-blue/10 dark:bg-blue/5 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[-15%] w-112.5 h-112.5 rounded-full bg-orange/10 dark:bg-orange/5 blur-[100px] pointer-events-none"></div>

        {/* Content */}
        <div className="max-w-4xl text-center space-y-8 animate-fade-in">
          {/* Subheading */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue/10 dark:bg-sky/10 border border-blue/20 dark:border-sky/20 text-blue dark:text-sky text-xs font-bold uppercase tracking-wider">
            <i className="fa-solid fa-solar-panel"></i>
            Finix Solar Client Portal
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-navy dark:text-white leading-tight">
            Powering the Future with <span className="bg-linear-to-r from-blue via-sky to-orange bg-clip-text text-transparent">Clean Energy</span>
          </h1>

          {/* Paragraph */}
          <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Efficiently manage client relationships, solar installations, and bulk upload utility data in one unified administrative suite.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 bg-linear-to-r from-blue to-sky hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue/15 hover:shadow-blue/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-3.5 bg-linear-to-r from-blue to-sky hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue/15 hover:shadow-blue/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Access Portal</span>
                  <i className="fa-solid fa-right-to-bracket"></i>
                </Link>
                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-navy/40 hover:bg-slate-50 dark:hover:bg-navy/80 text-navy dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Create Account</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="w-full max-w-5xl mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 pb-16">
          <div className="glass-card p-8 rounded-2xl transition-all hover:-translate-y-1 duration-300 shadow-sm hover:shadow-md hover:shadow-blue/5">
            <div className="w-12 h-12 rounded-xl bg-blue/10 dark:bg-sky/10 text-blue dark:text-sky flex items-center justify-center text-lg mb-6 border border-blue/15">
              <i className="fa-solid fa-users"></i>
            </div>
            <h3 className="text-base font-bold text-navy dark:text-white mb-3">Client Management</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
              Register clients, track CIN details, consumer numbers, contact profiles, and check records dynamically.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl transition-all hover:-translate-y-1 duration-300 shadow-sm hover:shadow-md hover:shadow-blue/5">
            <div className="w-12 h-12 rounded-xl bg-orange/10 dark:bg-orange/20 text-orange flex items-center justify-center text-lg mb-6 border border-orange/15">
              <i className="fa-solid fa-file-excel"></i>
            </div>
            <h3 className="text-base font-bold text-navy dark:text-white mb-3">Bulk Excel Upload</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
              Import entire Excel spreadsheets directly into Supabase database tables with structured validation filters.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl transition-all hover:-translate-y-1 duration-300 shadow-sm hover:shadow-md hover:shadow-blue/5">
            <div className="w-12 h-12 rounded-xl bg-gold/10 dark:bg-gold/20 text-orange dark:text-gold flex items-center justify-center text-lg mb-6 border border-gold/15">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h3 className="text-base font-bold text-navy dark:text-white mb-3">Protected Portal</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
              Secure client records behind cryptographic Supabase guards ensuring administrative security.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
