"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Search, 
  Maximize2, 
  Minimize2, 
  Moon, 
  Sun, 
  Bell, 
  Globe, 
  Menu, 
  User, 
  ChevronRight,
  LogOut,
  Sparkles,
  Bot
} from "lucide-react";
import { useApp } from "./AppContext";
import { Language } from "@/types";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    language, 
    setLanguage, 
    theme, 
    toggleTheme, 
    notificationCount,
    logout,
    account,
    isLoggedIn 
  } = useApp();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const getBreadcrumbs = () => {
    if (pathname === "/home/bill-calculator") {
      return [
        { label: "Home", href: "/" },
        { label: "Bill Calculator", href: "/home/bill-calculator" },
      ];
    }
    if (pathname === "/home/accounts") {
      return [
        { label: "Home", href: "/" },
        { label: "My Accounts", href: "/home/accounts" },
      ];
    }
    if (pathname === "/services/breakdown-complaint") {
      return [
        { label: "Services", href: "/" },
        { label: "Breakdown Complaint", href: "/services/breakdown-complaint" },
      ];
    }
    if (pathname === "/outages") {
      return [
        { label: "Outages", href: "/outages" },
        { label: "Outage Map", href: "/outages" },
      ];
    }
    return [
      { label: "Home", href: "/" },
      { label: "Dashboard", href: "/" },
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  const languages: { code: Language; label: string; native: string }[] = [
    { code: "en", label: "English", native: "English" },
    { code: "si", label: "Sinhala", native: "සිංහල" },
    { code: "ta", label: "Tamil", native: "தமிழ்" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#13171d] border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Mobile hamburger & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb nav */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.label}>
                  {idx > 0 && <span className="text-slate-400">›</span>}
                  <Link
                    href={crumb.href}
                    className={`hover:text-slate-900 dark:hover:text-white transition-colors ${
                      idx === breadcrumbs.length - 1
                        ? "font-semibold text-slate-800 dark:text-slate-100"
                        : "text-slate-500"
                    }`}
                  >
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right Tools matching official UI */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Box with ⌘K */}
            <div className="hidden md:flex items-center relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 pr-8 py-1.5 w-36 lg:w-44 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6c002c]"
              />
              <span className="absolute right-2 text-[10px] text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1">
                ⌘K
              </span>
            </div>

            {/* Soon Badge */}
            <div className="hidden sm:flex items-center">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Soon
              </span>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Theme Toggle Icon in Header */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-indigo-500" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowLangMenu(false);
                  setShowProfileMenu(false);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#6c002c]" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1e2530] rounded-xl shadow-dropdown border border-slate-200 dark:border-slate-700 p-3 z-50 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 font-bold">
                    <span>Notifications</span>
                    <span className="text-[10px] text-slate-400">2 Unread</span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200">
                      <p className="font-semibold">Maintenance F-12 Kandy</p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-300">14 Nov 08:30 AM – 01:00 PM</p>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200">
                      <p className="font-semibold">October E-Bill Ready</p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-300">Total Rs. 4,850.00</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar & Exact Dropdown Menu (Screenshot 3) */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                  setShowLangMenu(false);
                }}
                className="flex items-center gap-2 pl-1 cursor-pointer focus:outline-none"
              >
                {/* Businessman User Avatar with green active dot */}
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-sky-100 dark:bg-sky-950 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="18" fill="#E0F2FE" />
                    <circle cx="18" cy="14" r="7" fill="#FCD34D" />
                    <path d="M12 11c0-4 3-7 6-7s6 3 6 7c0 1-.5 2-1 2.5-1-1.5-3-2.5-5-2.5s-4 1-5 2.5c-.5-.5-1-1.5-1-2.5z" fill="#1E293B" />
                    <path d="M7 34c0-6 5-11 11-11s11 5 11 11H7z" fill="#1E293B" />
                    <path d="M15 23l3 8 3-8h-6z" fill="#EF4444" />
                    <path d="M18 23l-2 5h4l-2-5z" fill="#FFFFFF" />
                  </svg>
                  {/* Green status dot */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#13171d]" />
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                  View profile
                </span>
              </button>

              {/* Profile Dropdown matching Screenshot 3 identically */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1a212b] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-slideUp">
                  {/* User Profile Header */}
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-sky-100 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full" viewBox="0 0 36 36" fill="none">
                        <circle cx="18" cy="18" r="18" fill="#E0F2FE" />
                        <circle cx="18" cy="14" r="7" fill="#FCD34D" />
                        <path d="M12 11c0-4 3-7 6-7s6 3 6 7c0 1-.5 2-1 2.5-1-1.5-3-2.5-5-2.5s-4 1-5 2.5c-.5-.5-1-1.5-1-2.5z" fill="#1E293B" />
                        <path d="M7 34c0-6 5-11 11-11s11 5 11 11H7z" fill="#1E293B" />
                        <path d="M15 23l3 8 3-8h-6z" fill="#EF4444" />
                        <path d="M18 23l-2 5h4l-2-5z" fill="#FFFFFF" />
                      </svg>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {isLoggedIn ? account.customerName : "Guest User"}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-400 truncate">
                        {isLoggedIn ? `Account #${account.accountNumber}` : "Public Demo Mode"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800/80 py-1">
                    {/* My Profile */}
                    <Link
                      href={isLoggedIn ? "#profile" : "/login"}
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>{isLoggedIn ? "My Profile" : "Sign In"}</span>
                    </Link>

                    {/* Dark Mode Switcher Row with Toggle Switch matching Screenshot 3 */}
                    <div className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <div className="flex items-center gap-3">
                        <Moon className="w-4 h-4 text-slate-500" />
                        <span>Dark Mode</span>
                      </div>
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          theme === "dark" ? "bg-[#6c002c]" : "bg-slate-200"
                        }`}
                        role="switch"
                        aria-checked={theme === "dark"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            theme === "dark" ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Logout Row */}
                  <div className="border-t border-slate-100 dark:border-slate-800/80 p-1">
                    {isLoggedIn ? (
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                          router.push("/login");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span>Logout</span>
                      </button>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-[#6c002c] hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-[#6c002c]" />
                        <span>Customer Sign In</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
