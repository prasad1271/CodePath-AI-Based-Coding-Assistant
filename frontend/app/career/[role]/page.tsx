"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Compass, ArrowLeft, CheckCircle2, Code, Layers,
  Terminal, ShieldCheck, GraduationCap, Github, FileText
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CareerPath } from "@/types";
import { api } from "@/services/api";

export default function CareerRoleDetailPage() {
  const params = useParams();
  const slug = params.role as string;
  const [career, setCareer] = useState<CareerPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      api.getCareerPath(slug)
        .then((res) => setCareer(res))
        .catch((err) => console.error("Career detail error:", err))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-slate-900 rounded-xl" />
          <div className="h-64 bg-slate-900 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!career) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-slate-400">Career path not found.</p>
          <Link href="/career"><Button variant="outline" className="mt-4">Back to roadmaps</Button></Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link href="/career" className="inline-flex items-center text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to all career paths
        </Link>

        {/* Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <Badge variant="outline" className="text-xs mb-2">
              Market Demand: {career.market_demand} &bull; Salary Range: {career.salary_range}
            </Badge>
            <h1 className="text-2xl font-bold text-white tracking-tight">{career.title}</h1>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
              {career.description}
            </p>
          </div>
        </div>

        {/* 6 Grid Sections of Career Expectations */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          {/* 1. Required Languages & Technologies */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <Code className="w-4 h-4 text-blue-400" />
                <span>Languages & Frameworks</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-3">
              <div>
                <span className="font-semibold text-slate-400 block mb-1.5">Languages:</span>
                <div className="flex flex-wrap gap-1">
                  {career.required_languages?.map((l) => (
                    <span key={l} className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/40 text-blue-300 font-mono text-[11px]">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-semibold text-slate-400 block mb-1.5">Technologies:</span>
                <div className="flex flex-wrap gap-1">
                  {career.technologies?.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. DSA Expectations */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>DSA Focus Topics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-1.5 text-slate-300">
              {career.dsa_requirements?.map((d, i) => (
                <div key={i} className="flex items-center space-x-2 p-1.5 rounded bg-slate-950/60 border border-slate-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{d}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 3. Portfolio Projects Required */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span>Expected Capstone Projects</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-1.5 text-slate-300">
              {career.projects_required?.map((proj, i) => (
                <div key={i} className="p-2 rounded bg-purple-950/10 border border-purple-800/30 text-purple-200">
                  • {proj}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 4. Interview Topics */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Technical Interview Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-1.5 text-slate-300">
              {career.interview_topics?.map((topic, i) => (
                <div key={i} className="p-1.5 rounded bg-slate-950/60 border border-slate-800/60">
                  • {topic}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 5. Resume Skills & Certifications */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Resume Keywords & Certs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-3">
              <div>
                <span className="font-semibold text-slate-400 block mb-1">Keywords:</span>
                <div className="flex flex-wrap gap-1">
                  {career.resume_skills?.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              {career.certifications && (
                <div>
                  <span className="font-semibold text-slate-400 block mb-1">Recommended Certs:</span>
                  <div className="space-y-1 text-slate-300">
                    {career.certifications.map((c, i) => <div key={i}>• {c}</div>)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 6. GitHub Expectations */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <Github className="w-4 h-4 text-slate-300" />
                <span>GitHub Quality Standards</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-1.5 text-slate-300">
              {career.github_expectations?.map((exp, i) => (
                <div key={i} className="p-1.5 rounded bg-slate-950/60 border border-slate-800/60">
                  • {exp}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Step by Step Learning Sequence */}
        {career.learning_sequence && career.learning_sequence.length > 0 && (
          <Card className="border-slate-800 bg-slate-900/50 p-6">
            <h3 className="text-base font-bold text-white mb-4">Recommended Learning Sequence</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {career.learning_sequence.map((seq, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-blue-300">
                  {seq}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
