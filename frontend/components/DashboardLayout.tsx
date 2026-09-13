"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Menu, X } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 max-w-[80vw] bg-slate-950 z-10">
            <div className="flex justify-end p-2">
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar className="h-full border-r-0" />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950/40">
        {/* Mobile menu trigger button */}
        <div className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center space-x-2 text-xs font-medium text-slate-300 p-1.5 rounded-lg border border-slate-800 hover:bg-slate-900"
          >
            <Menu className="w-4 h-4 text-blue-400" />
            <span>Platform Navigation</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
