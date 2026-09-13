"use client";

import React, { useEffect, useState } from "react";
import {
  Shield, Users, Code, Activity, Server, AlertCircle,
  CheckCircle2, RefreshCw
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAdminStats(), api.getAdminUsers()])
      .then(([s, u]) => {
        setStats(s);
        setUsers(u);
      })
      .catch((err) => console.error("Admin fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-amber-500" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Admin & Platform Health Center</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Role-based management, user tracking, sandbox runtime health, and platform system metrics.
            </p>
          </div>
          <Badge variant="warning" className="text-xs">
            Admin Access Level
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-800 bg-slate-900/60 p-4">
            <span className="text-xs text-slate-400">Total Registered Users</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">{stats?.total_users || 1}</div>
          </Card>
          <Card className="border-slate-800 bg-slate-900/60 p-4">
            <span className="text-xs text-slate-400">Total Coding Challenges</span>
            <div className="text-2xl font-bold text-blue-400 font-mono mt-1">{stats?.total_problems || 3}</div>
          </Card>
          <Card className="border-slate-800 bg-slate-900/60 p-4">
            <span className="text-xs text-slate-400">Submissions Processed</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{stats?.total_submissions || 0}</div>
          </Card>
          <Card className="border-slate-800 bg-slate-900/60 p-4">
            <span className="text-xs text-slate-400">System Vitality</span>
            <div className="text-lg font-bold text-emerald-400 mt-1 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{stats?.system_status || "Operational"}</span>
            </div>
          </Card>
        </div>

        {/* User Management Table */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-base text-slate-200 flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Platform Users Directory</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Manage student, mentor, and administrator permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-200">{u.full_name}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono">{u.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant={u.role === "admin" ? "warning" : "secondary"} className="text-[10px]">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
