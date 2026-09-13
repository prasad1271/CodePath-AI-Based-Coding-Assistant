"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderGit2, Sparkles, CheckCircle2, Circle, ArrowRight,
  Code, Database, Terminal, FileText, Loader2, Plus, ExternalLink
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types";
import { api } from "@/services/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("AI/ML");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Intermediate");
  const [generatedIdea, setGeneratedIdea] = useState<any>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    api.getProjects()
      .then((res) => setProjects(res))
      .catch((err) => console.error("Projects error:", err))
      .finally(() => setLoading(false));
  };

  const handleGenerateIdea = async () => {
    setIsGenerating(true);
    try {
      const res = await api.generateProjectIdea(selectedCategory, selectedDifficulty);
      setGeneratedIdea(res);
    } catch (err) {
      console.error("Generate idea error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToWorkspace = async () => {
    if (!generatedIdea) return;
    try {
      await api.createProject(generatedIdea);
      setGeneratedIdea(null);
      fetchProjects();
    } catch (err) {
      console.error("Save project error:", err);
    }
  };

  const handleToggleTask = async (projectId: string, taskId: string) => {
    try {
      await api.toggleProjectTask(projectId, taskId);
      fetchProjects();
    } catch (err) {
      console.error("Toggle task error:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FolderGit2 className="w-6 h-6 text-purple-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Project Mentor & Architect</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Build impressive capstone engineering projects with production architecture, database models, and resume bullets.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/projects/new">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-xs h-9 shadow-md">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create New Project
              </Button>
            </Link>
            <Badge variant="outline" className="text-xs">
              {projects.length} Saved Workspaces
            </Badge>
          </div>
        </div>

        {/* AI Project Idea Generator Box */}
        <Card className="border-purple-900/40 bg-purple-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Architecture & Idea Generator</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Select your domain and experience level to generate a complete end-to-end specification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                {["AI/ML", "Web", "Cybersecurity", "Cloud", "Mobile", "Data Science"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-md text-xs transition-colors ${
                      selectedCategory === cat
                        ? "bg-purple-600 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-slate-950 text-slate-300 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate (Recommended)</option>
                <option value="Advanced">Advanced (Production-Grade)</option>
              </select>

              <Button
                size="sm"
                onClick={handleGenerateIdea}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700 text-xs px-4 ml-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Generating Architecture...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Generate Blueprint
                  </>
                )}
              </Button>
            </div>

            {/* Generated Specification Drawer */}
            {generatedIdea && (
              <div className="p-4 rounded-xl bg-slate-950 border border-purple-800/40 space-y-4 text-xs animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h3 className="font-bold text-sm text-purple-300">{generatedIdea.title}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{generatedIdea.description}</p>
                  </div>
                  <Button size="sm" onClick={handleSaveToWorkspace} className="bg-emerald-600 hover:bg-emerald-700 text-xs px-3">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add to My Workspaces
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <strong className="text-slate-300 block font-mono">Architecture & Tech Stack:</strong>
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      <div>{generatedIdea.architecture_overview}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {generatedIdea.tech_stack?.map((t: string) => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-blue-300 font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <strong className="text-slate-300 block font-mono">Resume Bullets to Earn:</strong>
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 space-y-1">
                      {generatedIdea.resume_bullets?.map((b: string, i: number) => (
                        <div key={i}>• {b}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Active Workspaces */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Your Active Project Workspaces</h2>
          {loading ? (
            <div className="h-44 bg-slate-900 rounded-xl animate-pulse" />
          ) : projects.length === 0 ? (
            <Card className="border-slate-800 bg-slate-900/40 p-8 text-center space-y-3">
              <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-xs">No project workspaces created yet.</p>
              <Button size="sm" onClick={handleGenerateIdea} className="bg-purple-600 hover:bg-purple-700 text-xs">
                Generate Your First Project
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map((p) => (
                <Card key={p.id} className="border-slate-800 bg-slate-900/50 flex flex-col justify-between">
                  <CardHeader className="pb-3 border-b border-slate-800/80">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
                      <Badge variant={p.status === "completed" ? "success" : "secondary"} className="text-[10px]">
                        {p.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-base text-white">{p.title}</CardTitle>
                    <CardDescription className="text-xs">{p.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {/* Task checklist */}
                    {p.tasks && p.tasks.length > 0 && (
                      <div className="space-y-2 text-xs">
                        <span className="font-semibold text-slate-300 block">Milestones & Tasks:</span>
                        {p.tasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => handleToggleTask(p.id, task.id)}
                            className="w-full flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80 text-left hover:border-slate-700 transition-colors text-xs"
                          >
                            <div className="flex items-center space-x-2">
                              {task.is_completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                              )}
                              <span className={task.is_completed ? "line-through text-slate-500" : "text-slate-300"}>
                                {task.title}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">{task.milestone}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {p.tech_stack?.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                            {t}
                          </span>
                        ))}
                      </div>

                      <Link href={`/projects/${p.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-purple-400 hover:text-purple-300">
                          <span>Open Workspace</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
