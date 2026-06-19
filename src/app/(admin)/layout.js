"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-[#1e6cfc] border-t-transparent"></div>
            <div className="h-8 w-8 rounded-full bg-[#ffc600] animate-pulse"></div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading Finix Solar Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-[#1e6cfc] border-t-transparent"></div>
            <div className="h-8 w-8 rounded-full bg-[#ffc600] animate-pulse"></div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
