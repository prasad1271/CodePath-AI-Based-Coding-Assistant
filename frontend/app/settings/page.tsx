"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Settings, Save, User, Shield, Moon, Check, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    api.getMe().then((u) => setUser(u)).catch(() => {});
    api.getProfile().then((p) => setProfile(p)).catch(() => {});
  }, []);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Settings className="w-6 h-6 text-slate-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Student Account & Preferences</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Manage your academic information, preferred code editor settings, and notification frequency.
            </p>
          </div>

          <Link href="/profile">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs h-9 shadow-md">
              <User className="w-3.5 h-3.5 mr-1.5" />
              Full Student Profile
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        {/* Profile Card */}
        <Card className="border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-400" />
              <span>Academic Identity</span>
            </h2>
            <Badge variant="outline" className="text-xs font-mono">
              Role: {user?.role || "Student"}
            </Badge>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                defaultValue={user?.full_name || "Demo Engineering Student"}
                className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Email Address</label>
              <input
                type="email"
                readOnly
                defaultValue={user?.email || "student@codepath.dev"}
                className="w-full h-9 bg-slate-950/60 border border-slate-800 rounded-lg px-3 text-slate-500 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Engineering Branch</label>
              <input
                type="text"
                defaultValue={profile?.branch || "Computer Science & Engineering"}
                className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Target Placement Goal</label>
              <input
                type="text"
                defaultValue={profile?.placement_goal || "Product-Based Company"}
                className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Editor Preferences */}
        <Card className="border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Monaco Editor Settings</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Font Size</label>
              <select defaultValue="13" className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none">
                <option value="12">12px</option>
                <option value="13">13px (Default)</option>
                <option value="14">14px</option>
                <option value="16">16px</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Keybinding Scheme</label>
              <select defaultValue="standard" className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none">
                <option value="standard">Standard VS Code</option>
                <option value="vim">Vim Mode</option>
                <option value="emacs">Emacs</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-xs px-6">
            {isSaved ? (
              <>
                <Check className="w-4 h-4 mr-1.5" />
                Preferences Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
