"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Code2, Flame, Bell, User as UserIcon, Shield,
  Sparkles, Terminal, Target, LogOut, Settings as SettingsIcon,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { useAuth } from "@/lib/context/AuthContext";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRole, setUserRole] = useState("student");
  const [userName, setUserName] = useState<string>("");
  const [readinessScore, setReadinessScore] = useState<number>(35);
  const [streakDays, setStreakDays] = useState<number>(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Probe profile & notifications
    const token = typeof window !== "undefined" ? localStorage.getItem("codepath_token") : null;
    if (token || user) {
      api.getDashboard()
        .then((dash) => {
          if (dash?.user) {
            setUserName(dash.user.full_name);
            setUserRole(dash.user.role);
          }
          if (dash?.streak) {
            setStreakDays(dash.streak.current_streak);
          }
          if (dash?.career_readiness_breakdown) {
            setReadinessScore(Math.round(dash.career_readiness_breakdown.overall_score));
          }
        })
        .catch(() => {});

      api.getNotifications()
        .then((notifs) => {
          const unread = notifs.filter((n) => !n.is_read).length;
          setUnreadCount(unread);
        })
        .catch(() => {});
    }
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    router.push("/login");
  };

  const displayName = userName || user?.user_metadata?.full_name || (user?.email ? user.email.split("@")[0] : "Student");
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-md group-hover:bg-blue-500 transition-colors">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                CodePath
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline -mt-1">
                AI Programming & Career Ecosystem
              </span>
            </div>
          </Link>

          {/* Quick Links */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-medium text-slate-300">
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors ${
                pathname === "/dashboard" ? "bg-slate-800 text-blue-400 font-semibold" : ""
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/mentor"
              className={`flex items-center px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors ${
                pathname === "/mentor" ? "bg-slate-800 text-blue-400 font-semibold" : ""
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-400" />
              AI Mentor
            </Link>
            <Link
              href="/error-doctor"
              className={`flex items-center px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors ${
                pathname === "/error-doctor" ? "bg-slate-800 text-blue-400 font-semibold" : ""
              }`}
            >
              <Terminal className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Error Doctor
            </Link>
            <Link
              href="/practice"
              className={`px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors ${
                pathname.startsWith("/practice") ? "bg-slate-800 text-blue-400 font-semibold" : ""
              }`}
            >
              Practice
            </Link>
            <Link
              href="/career"
              className={`px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors ${
                pathname.startsWith("/career") ? "bg-slate-800 text-blue-400 font-semibold" : ""
              }`}
            >
              Roadmaps
            </Link>
          </nav>
        </div>

        {/* Right side widgets & profile */}
        <div className="flex items-center space-x-3">
          {/* Active streak badge */}
          <div className="hidden sm:flex items-center space-x-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            <span>{streakDays} Day Streak</span>
          </div>

          {/* Career Readiness Score Badge */}
          <Link
            href="/dashboard"
            className="hidden lg:flex items-center space-x-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-blue-500/20 transition-colors"
          >
            <Target className="w-3.5 h-3.5 text-blue-400" />
            <span>Readiness: {readinessScore}%</span>
          </Link>

          {/* Notifications */}
          <Link
            href="/notifications"
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-950" />
            )}
          </Link>

          {/* Admin link if role is admin */}
          {userRole === "admin" && (
            <Link href="/admin">
              <Badge variant="warning" className="hidden sm:inline-flex cursor-pointer">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </Link>
          )}

          {/* User Account / Dropdown */}
          {user || (typeof window !== "undefined" && localStorage.getItem("codepath_token")) ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-1.5 pl-2 pr-2.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 transition-colors text-xs text-slate-200"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  {avatarLetter}
                </div>
                <span className="font-medium hidden sm:inline max-w-[100px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 text-xs text-slate-300 animate-in fade-in z-50">
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px]">
                    <div className="font-semibold text-white truncate">{displayName}</div>
                    <div className="text-slate-500 truncate">{user?.email || "student@codepath.dev"}</div>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-blue-400" />
                    <span>Student Profile</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-400" />
                    <span>Preferences & Editor</span>
                  </Link>

                  <div className="border-t border-slate-800 my-1" />

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-red-950/30 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs h-8 px-3 shadow">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
