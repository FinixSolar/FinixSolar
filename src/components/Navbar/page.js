"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setDropdownOpen(false);
      setMobileMenuOpen(false);
      router.push("/");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user) return "";
    const name = user.user_metadata?.full_name;
    if (name) {
      const parts = name.split(" ");
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name[0].toUpperCase();
    }
    return user.email ? user.email[0].toUpperCase() : "U";
  };

  const linkClass = (path) => {
    const isActive = pathname === path;
    return `px-4 h-full flex items-center text-sm font-semibold transition-all duration-200 border-b-2 ${
      isActive
        ? "text-blue border-blue dark:text-sky dark:border-sky bg-blue/5 dark:bg-sky/5 py-2 px-1 rounded-tl-lg rounded-tr-lg mb-2"
        : "text-slate-600 dark:text-slate-300 border-transparent hover:text-blue hover:border-blue/50 dark:hover:text-sky dark:hover:border-sky/50 py-2 px-1 rounded-tl-lg rounded-tr-lg mb-2"
    }`;
  };

  return (
    <div className="w-full relative">
      <nav className="w-full glass-nav fixed top-0 z-50 transition-all duration-300">
        <div className="flex w-full items-center justify-between px-6 md:px-12 h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue to-sky flex items-center justify-center shadow-md shadow-blue/20 group-hover:scale-105 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="w-5 h-5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2m0 14v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M3 12h2m14 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 100 10 5 5 0 000-10z"
                  />
                </svg>
              </div>
              <span className="font-bold text-navy dark:text-white text-xl tracking-tight">
                Finix<span className="text-orange">Solar</span>
              </span>
            </Link>

            {/* Navigation Links */}
            {user && (
              <div className="hidden md:flex items-center h-16 space-x-1">
                <Link href="/dashboard" className={linkClass("/dashboard")}>
                  Dashboard
                </Link>
                <Link href="/addClient" className={linkClass("/addClient")}>
                  Add Client
                </Link>
                <Link href="/bulkUpload" className={linkClass("/bulkUpload")}>
                  Bulk Upload
                </Link>
                <Link href="/members" className={linkClass("/members")}>
                  Members
                </Link>
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* nav toggel btn */}
              <button
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-sky hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <i className="fa-solid fa-bars"></i>
              </button>
              {/* nav drop */}
              {mobileMenuOpen && (
                <div className="absolute right-0 mt-3.5 w-60 bg-white dark:bg-navy border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-4 px-3 z-50 animate-fade-in">
                  <Link href="/dashboard" className={linkClass("/dashboard")}>
                    Dashboard
                  </Link>
                  <Link href="/addClient" className={linkClass("/addClient")}>
                    Add Client
                  </Link>
                  <Link href="/bulkUpload" className={linkClass("/bulkUpload")}>
                    Bulk Upload
                  </Link>
                  <Link href="/members" className={linkClass("/members")}>
                    Members
                  </Link>
                </div>
              )}
            </div>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-sky hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer"
              title="Toggle Light/Dark Mode"
            >
              {theme === "dark" ? (
                <i className="fa-solid fa-sun text-gold text-base"></i>
              ) : (
                <i className="fa-solid fa-moon text-navy text-base"></i>
              )}
            </button>

            {user ? (
              <>
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-9 h-9 rounded-xl bg-blue/10 hover:bg-blue/20 border border-blue/20 flex items-center justify-center text-sm font-bold text-blue dark:text-sky dark:bg-sky/10 dark:border-sky/20 cursor-pointer transition-all duration-200"
                  >
                    {getUserInitials()}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3.5 w-60 bg-white dark:bg-navy border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Signed in as
                        </p>
                        <p className="text-xs font-semibold text-navy dark:text-slate-200 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      >
                        <i className="fa-solid fa-chart-line text-slate-400"></i>
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-orange hover:bg-orange/5 text-left transition cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1"
                      >
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue dark:hover:text-sky transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2.5 rounded-xl bg-blue hover:bg-blue/90 dark:bg-sky dark:text-navy text-xs font-bold text-white shadow-md shadow-blue/10 dark:shadow-sky/10 transition-all duration-200 cursor-pointer"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
