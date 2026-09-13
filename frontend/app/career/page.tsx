"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, ArrowRight, DollarSign, TrendingUp, CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CareerPath } from "@/types";
import { api } from "@/services/api";

export default function CareerPathsPage() {
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCareerPaths()
      .then((res) => setPaths(res))
      .catch((err) => console.error("Career paths error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Compass className="w-6 h-6 text-blue-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Engineering Career Roadmaps</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Industry-aligned expectations for Full Stack, AI/ML, and Cybersecurity roles.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {paths.length} Specialized Roles
          </Badge>
        </div>

        {/* Roles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map((n) => <div key={n} className="h-56 bg-slate-900 rounded-xl animate-pulse" />)
          ) : (
            paths.map((p) => (
              <Card key={p.id} className="border-slate-800 bg-slate-900/50 flex flex-col justify-between hover:border-blue-500/40 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="default" className="text-[10px]">{p.market_demand} Demand</Badge>
                    <span className="text-xs text-slate-400 font-mono">{p.salary_range}</span>
                  </div>
                  <CardTitle className="text-lg text-white font-bold">{p.title}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {p.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-300">Target:</span>
                      <span>{p.target_role}</span>
                    </div>
                  </div>
                  <Link href={`/career/${p.slug}`}>
                    <Button size="sm" className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs">
                      Inspect Skill Blueprint
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
