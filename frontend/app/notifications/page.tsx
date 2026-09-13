"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNotifications()
      .then((res) => setNotifications(res))
      .catch((err) => console.error("Notifications error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Mark all read error:", err);
      // Optimistic local update
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Bell className="w-6 h-6 text-blue-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Notifications Center</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Stay updated on streak milestones, interview evaluations, and personalized study recommendations.
            </p>
          </div>

          {hasUnread && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAllRead}
              className="text-xs h-8 border-slate-700 hover:bg-slate-800 shrink-0"
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {loading ? (
            [1, 2].map((n) => <div key={n} className="h-20 bg-slate-900 rounded-xl animate-pulse" />)
          ) : notifications.length === 0 ? (
            <Card className="border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-400">
              No notifications at this time.
            </Card>
          ) : (
            notifications.map((n) => (
              <Card
                key={n.id}
                className={`border p-4 transition-all text-xs flex items-start justify-between gap-4 ${
                  n.is_read
                    ? "border-slate-800/80 bg-slate-900/30 text-slate-400"
                    : "border-blue-900/40 bg-blue-950/10 text-slate-200"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{n.title}</span>
                    {!n.is_read && <Badge variant="default" className="text-[9px]">New</Badge>}
                  </div>
                  <p className="leading-relaxed text-slate-300">{n.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {n.link_url && (
                    <Link href={n.link_url}>
                      <Button size="sm" variant="outline" className="h-7 text-xs border-slate-700">
                        View
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                  {!n.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMarkRead(n.id)}
                      className="h-7 text-xs text-slate-400 hover:text-white"
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
