"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Network, CheckCircle2, Circle, ArrowRight, Layers, HelpCircle, Code } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DsaTopic } from "@/types";
import { api } from "@/services/api";

export default function DsaPage() {
  const [topics, setTopics] = useState<DsaTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDsaTopics()
      .then((res) => setTopics(res))
      .catch((err) => console.error("DSA fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const completedCount = topics.filter((t) => t.is_completed).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Network className="w-6 h-6 text-indigo-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Data Structures & Algorithms Roadmap</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Master algorithmic patterns: Arrays, Sliding Window, Trees, Graphs, Dynamic Programming.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right text-xs">
              <div className="text-slate-400">Mastery Progress</div>
              <div className="font-mono text-emerald-400 font-bold">
                {topics.length > 0 ? ((completedCount / topics.length) * 100).toFixed(0) : 0}% ({completedCount}/{topics.length})
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Topics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map((n) => <div key={n} className="h-44 bg-slate-900 rounded-xl animate-pulse" />)
          ) : (
            topics.map((t, idx) => (
              <Card key={t.id} className="border-slate-800 bg-slate-900/50 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-indigo-400 font-semibold">STAGE 0{idx + 1}</span>
                    {t.is_completed ? (
                      <Badge variant="success" className="text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Mastered
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">In Progress</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base text-white">{t.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Category: <strong className="text-slate-300">{t.category}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Visualization: {t.visualization_type}</span>
                  </div>
                  <Link href={`/dsa/${t.slug}`}>
                    <Button size="sm" className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs">
                      Explore Patterns
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
