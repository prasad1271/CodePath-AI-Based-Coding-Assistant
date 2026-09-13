"use client";

import React, { useEffect, useState } from "react";
import {
  FileText, Sparkles, CheckCircle2, AlertCircle, Save,
  Plus, Trash2, ArrowRight, Loader2, Target, Check
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResumeUpload } from "@/components/ResumeUpload";
import { ResumeData } from "@/types";
import { api } from "@/services/api";

export default function ResumePage() {
  const [resume, setResume] = useState<ResumeData>({
    title: "My Engineering Resume",
    full_name: "",
    email: "",
    phone: "",
    github_url: "",
    linkedin_url: "",
    summary: "",
    skills: ["Python", "JavaScript", "SQL", "Git"],
    education: [{ degree: "B.Tech Computer Science", institution: "Engineering College", year: "2026", score: "8.5 CGPA" }],
    projects: [{ title: "CodePath Platform", description: "AI programming & career ecosystem", tech: "Next.js, FastAPI, PostgreSQL, Docker", bullets: ["Engineered responsive frontend with Monaco editor.", "Designed normalized database schema with RLS."] }],
    experience: []
  });

  const [newSkill, setNewSkill] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsResult, setAtsResult] = useState<any>(null);

  // Bullet point improver state
  const [bulletInput, setBulletInput] = useState("");
  const [improvedBullets, setImprovedBullets] = useState<string[]>([]);
  const [isImproving, setIsImproving] = useState(false);

  useEffect(() => {
    api.getResume()
      .then((res) => setResume(res))
      .catch((err) => console.error("Resume fetch error:", err));
  }, []);

  const handleSaveResume = async () => {
    setIsSaving(true);
    try {
      const saved = await api.updateResume(resume);
      setResume(saved);
    } catch (err) {
      console.error("Failed to save resume:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunAts = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await api.analyzeResumeAts();
      setAtsResult(analysis);
    } catch (err) {
      console.error("ATS analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImproveBullet = async () => {
    if (!bulletInput.trim()) return;
    setIsImproving(true);
    try {
      const res = await api.improveResumeBullet(bulletInput);
      setImprovedBullets(res.improved_bullets || []);
    } catch (err) {
      console.error("Improve bullet error:", err);
    } finally {
      setIsImproving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !resume.skills.includes(newSkill.trim())) {
      setResume((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setResume((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Resume Builder & ATS Analyzer</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Create an ATS-optimized technical resume without fabricating achievements. Improve bullet points with active verbs.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={handleSaveResume}
              disabled={isSaving}
              variant="outline"
              size="sm"
              className="text-xs border-slate-700"
            >
              {isSaving ? "Saving..." : "Save Resume"}
              <Save className="w-3.5 h-3.5 ml-1.5" />
            </Button>
            <Button
              onClick={handleRunAts}
              disabled={isAnalyzing}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-xs"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Analyzing ATS Match...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Run ATS Scanner
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ATS Analysis Drawer */}
        {atsResult && (
          <Card className="border-blue-900/40 bg-blue-950/20 p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">ATS Match Evaluation</h3>
              </div>
              <div className="font-mono text-2xl font-extrabold text-blue-400">
                {atsResult.ats_score}%
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-semibold text-emerald-400 block">Matched Core Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {atsResult.keyword_matches?.map((m: string) => (
                    <span key={m} className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 text-[10px] font-mono">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-semibold text-amber-400 block">Missing High-Demand Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {atsResult.missing_critical_skills?.map((m: string) => (
                    <span key={m} className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 text-[10px] font-mono">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <span className="font-semibold text-slate-200 block">Recommendations:</span>
              {atsResult.recommendations?.map((rec: string, idx: number) => (
                <div key={idx}>• {rec}</div>
              ))}
            </div>
          </Card>
        )}

        {/* 2-Column Split: Resume Editor & Bullet Point Improver */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Resume Form (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-slate-800 bg-slate-900/50 p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Contact & Summary</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={resume.full_name || ""}
                    onChange={(e) => setResume({ ...resume, full_name: e.target.value })}
                    className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Email</label>
                  <input
                    type="email"
                    value={resume.email || ""}
                    onChange={(e) => setResume({ ...resume, email: e.target.value })}
                    className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">GitHub URL</label>
                  <input
                    type="text"
                    value={resume.github_url || ""}
                    onChange={(e) => setResume({ ...resume, github_url: e.target.value })}
                    className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={resume.linkedin_url || ""}
                    onChange={(e) => setResume({ ...resume, linkedin_url: e.target.value })}
                    className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="text-slate-400 block mb-1">Professional Summary</label>
                <textarea
                  value={resume.summary || ""}
                  onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                  className="w-full h-20 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </Card>

            {/* Skills */}
            <Card className="border-slate-800 bg-slate-900/50 p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Technical Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {resume.skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 text-xs font-mono"
                  >
                    {s}
                    <button onClick={() => removeSkill(s)} className="ml-1.5 text-slate-400 hover:text-red-400">
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  placeholder="Add skill (e.g. Docker, TypeScript)..."
                  className="h-8 bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <Button size="sm" onClick={addSkill} variant="secondary" className="h-8 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Skill
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Upload & AI Bullet Point Improver (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Supabase Storage Resume Uploader */}
            <ResumeUpload
              onUploadSuccess={(path, file) => {
                console.log("Resume uploaded to storage:", path, file.name);
              }}
            />

            <Card className="border-purple-900/40 bg-purple-950/10 p-5 space-y-4">
              <div>
                <h3 className="font-bold text-sm text-purple-300 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>AI Bullet Point Polisher</span>
                </h3>
                <p className="text-slate-400 text-[11px] mt-1">
                  Paste a raw project bullet point. The assistant refines it with action verbs without inventing unverified facts.
                </p>
              </div>

              <textarea
                value={bulletInput}
                onChange={(e) => setBulletInput(e.target.value)}
                placeholder="e.g., 'Made a login page and connected to database'"
                className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-sans text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />

              <Button
                size="sm"
                onClick={handleImproveBullet}
                disabled={isImproving || !bulletInput.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-xs font-semibold"
              >
                {isImproving ? "Refining..." : "Transform with Action Verbs"}
              </Button>

              {improvedBullets.length > 0 && (
                <div className="space-y-2 pt-2 animate-in fade-in">
                  <span className="text-[11px] font-semibold text-emerald-400 block">Improved Alternatives:</span>
                  {improvedBullets.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 leading-relaxed space-y-1"
                    >
                      <div>• {bullet}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
