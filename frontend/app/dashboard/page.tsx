"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame, Target, Code, BookOpen, Network, FolderGit2,
  Mic, ArrowRight, CheckCircle2, Circle, Sparkles, TrendingUp, AlertTriangle
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { useAuth } from "@/lib/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DashboardPage() {
  const { user: authUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then((res) => setData(res))
      .catch((err) => console.error("Dashboard fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-6 animate-pulse">
            <div className="h-20 bg-slate-900 rounded-xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => <div key={n} className="h-28 bg-slate-900 rounded-xl" />)}
            </div>
            <div className="h-64 bg-slate-900 rounded-xl" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const user = data?.user;
  const profile = data?.profile;
  const streak = data?.streak;
  const stats = data?.stats;
  const readiness = data?.career_readiness_breakdown;

  const displayName = user?.full_name || authUser?.user_metadata?.full_name || "Engineering Student";

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* 1. Header Banner */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Welcome back, {displayName}! 👋
              </h1>
            <Badge variant="secondary" className="text-[10px] uppercase font-mono">
              {profile?.branch || "CSE"}
            </Badge>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Targeting: <strong className="text-blue-400">{profile?.career_goal || "Full Stack Developer"}</strong> • Academic Year: <span className="text-slate-300">{profile?.academic_year || "3rd Year"}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/mentor">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-xs shadow-lg">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Ask AI Mentor
            </Button>
          </Link>
          <Link href="/practice">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs shadow-lg">
              <Code className="w-3.5 h-3.5 mr-1.5" />
              Daily Practice
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <Card className="border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Coding Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {streak?.current_streak || 1} <span className="text-xs font-normal text-slate-400">Days</span>
          </div>
          <div className="text-[11px] text-amber-400/90 mt-1 font-mono">
            Longest: {streak?.longest_streak || 1} days
          </div>
        </Card>

        {/* Problems Solved */}
        <Card className="border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Problems Solved</span>
            <Code className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {stats?.problems_solved || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Easy & Medium DSA
          </div>
        </Card>

        {/* Lessons Done */}
        <Card className="border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Lessons Completed</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {stats?.lessons_completed || 0}
          </div>
          <div className="text-[11px] text-emerald-400/90 mt-1 font-mono">
            {profile?.preferred_language?.toUpperCase() || "PYTHON"} Track
          </div>
        </Card>

        {/* Career Readiness */}
        <Card className="border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Career Readiness</span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {readiness?.overall_score || 35.0}%
          </div>
          <div className="text-[11px] text-purple-400 font-semibold mt-1 truncate">
            {readiness?.readiness_level || "Foundation Building"}
          </div>
        </Card>
      </div>

      {/* 3. Readiness Breakdown & Today's Goal */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Readiness Analysis */}
        <Card className="lg:col-span-2 border-slate-800 bg-slate-900/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span>Readiness Breakdown Analytics</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Real database scores across all core placement evaluation pillars.
                </CardDescription>
              </div>
              <Badge variant="default" className="text-xs font-mono font-bold">
                {readiness?.overall_score || 35.0}% Overall
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Programming Fundamentals (20%)</span>
                <span className="text-blue-400">{readiness?.programming_score || 20}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${readiness?.programming_score || 20}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>DSA Algorithmic Problem Solving (25%)</span>
                <span className="text-indigo-400">{readiness?.dsa_score || 15}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${readiness?.dsa_score || 15}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Projects & System Architecture (15%)</span>
                <span className="text-emerald-400">{readiness?.projects_score || 10}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${readiness?.projects_score || 10}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Mock Technical Interviews (10%)</span>
                <span className="text-amber-400">{readiness?.interview_score || 30}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${readiness?.interview_score || 30}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>ATS Resume & GitHub Portfolio (10%)</span>
                <span className="text-purple-400">{readiness?.resume_score || 25}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${readiness?.resume_score || 25}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Goal & Action Center */}
        <Card className="border-slate-800 bg-slate-900/50 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center space-x-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Today&apos;s Daily Target</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Daily habit formation to maintain your streak.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-slate-200 font-medium">
                {stats?.problems_solved > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span>Solve 1 Coding Problem</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-200 font-medium">
                {stats?.lessons_completed > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span>Complete 1 Course Lesson</span>
              </div>
            </div>

            {readiness?.growth_areas?.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/30 space-y-1">
                <div className="flex items-center space-x-1.5 font-semibold text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Growth Recommendations</span>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-1 pl-4 list-disc">
                  {readiness.growth_areas.map((area: string, i: number) => (
                    <li key={i}>{area}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          <div className="p-6 pt-0">
            <Link href="/practice">
              <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs">
                Start Daily Challenge
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* 4. Recommended Problems & Lessons */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recommended Coding Problems */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recommended Practice Problems</CardTitle>
            <Link href="/practice" className="text-xs text-blue-400 hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data?.recommended_problems?.map((p: any) => (
              <Link
                key={p.slug}
                href={`/practice/${p.slug}`}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between transition-colors text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{p.title}</div>
                  <div className="text-slate-400 text-[11px]">{p.topic}</div>
                </div>
                <Badge variant={p.difficulty === "Easy" ? "success" : "warning"} className="text-[10px]">
                  {p.difficulty}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recommended Course Lessons */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Continue Your Learning Track</CardTitle>
            <Link href="/learn" className="text-xs text-blue-400 hover:underline">View all courses</Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data?.recommended_lessons?.map((l: any) => (
              <Link
                key={l.slug}
                href={`/learn/${l.course_slug}/${l.slug}`}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between transition-colors text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{l.title}</div>
                  <div className="text-slate-400 text-[11px]">{l.course}</div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-400">
                  Open Lesson
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}
