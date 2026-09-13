"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Sparkles, Terminal, BookOpen, Code,
  Network, FolderGit2, Compass, Mic, GraduationCap,
  FileText, Github, Users, Settings, ShieldCheck, User
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationGroups = [
  {
    title: "Core",
    items: [
      { name: "Student Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "AI Guidance",
    items: [
      { name: "AI Programming Mentor", href: "/mentor", icon: Sparkles, badge: "AI" },
      { name: "Error Doctor", href: "/error-doctor", icon: Terminal },
    ]
  },
  {
    title: "Learning & Practice",
    items: [
      { name: "Programming Courses", href: "/learn", icon: BookOpen },
      { name: "Coding Practice", href: "/practice", icon: Code },
      { name: "DSA Roadmap", href: "/dsa", icon: Network },
    ]
  },
  {
    title: "Career & Placement",
    items: [
      { name: "Project Mentor", href: "/projects", icon: FolderGit2 },
      { name: "Career Roadmaps", href: "/career", icon: Compass },
      { name: "AI Mock Interviews", href: "/interview", icon: Mic },
      { name: "Placement Preparation", href: "/placement", icon: GraduationCap },
    ]
  },
  {
    title: "Career Profile",
    items: [
      { name: "Student Profile", href: "/profile", icon: User },
      { name: "Resume & ATS", href: "/resume", icon: FileText },
      { name: "GitHub Assistant", href: "/github", icon: Github },
      { name: "Community Forum", href: "/community", icon: Users },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  }
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn("w-64 border-r border-slate-800 bg-slate-950/60 flex flex-col justify-between p-4 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto", className)}>
      <div className="space-y-6">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
              {group.title}
            </h4>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                      isActive
                        ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 font-semibold"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                    )}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200")} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Quick Switch */}
      <div className="pt-4 border-t border-slate-900 mt-4">
        <Link
          href="/admin"
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-amber-300 hover:bg-amber-950/20 transition-colors border border-dashed border-slate-800"
        >
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span>Admin Portal</span>
        </Link>
      </div>
    </aside>
  );
}
