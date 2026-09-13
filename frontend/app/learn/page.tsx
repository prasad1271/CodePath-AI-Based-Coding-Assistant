"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Code, ArrowRight, CheckCircle2, Coffee, Terminal, Cpu, Globe, Database } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/types";
import { api } from "@/services/api";

const ICON_MAP: Record<string, any> = {
  Code: Code,
  Coffee: Coffee,
  Terminal: Terminal,
  Cpu: Cpu,
  Globe: Globe,
  Database: Database
};

export default function LearnPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCourses()
      .then((res) => setCourses(res))
      .catch((err) => console.error("Courses fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Structured Programming Tracks</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Master fundamentals from basic syntax to memory architectures and enterprise systems.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {courses.length} Languages Supported
          </Badge>
        </div>

        {/* Course Catalog Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-48 bg-slate-900 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c) => {
              const IconComponent = ICON_MAP[c.icon] || Code;
              return (
                <Card key={c.id} className="border-slate-800 bg-slate-900/50 flex flex-col justify-between hover:border-blue-500/40 transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <Badge variant={c.difficulty === "Beginner" ? "success" : "secondary"} className="text-[10px]">
                        {c.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-base text-white">{c.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {c.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>{c.modules_count || 3} Modules &bull; {c.lessons_count || 6} Lessons</span>
                      <span className="text-emerald-400 font-semibold">{c.completed_lessons || 0} Done</span>
                    </div>
                    <Link href={`/learn/${c.slug}`}>
                      <Button size="sm" className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs mt-1">
                        View Curriculum
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
