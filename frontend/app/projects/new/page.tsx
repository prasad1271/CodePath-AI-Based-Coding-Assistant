"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderGit2, ArrowLeft, Plus, Save, Loader2,
  Code, Sparkles, Layers, CheckCircle2, AlertCircle
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Web");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [description, setDescription] = useState("");
  const [techStackInput, setTechStackInput] = useState("Next.js, FastAPI, PostgreSQL, Docker");
  const [githubRepoUrl, setGithubRepoUrl] = useState("");
  const [architectureOverview, setArchitectureOverview] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg("Title and description are required.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const tech_stack = techStackInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await api.createProject({
        title,
        category,
        difficulty,
        description,
        tech_stack,
        github_repo_url: githubRepoUrl || undefined,
        architecture_overview: architectureOverview || undefined,
        status: "in_progress",
      });

      router.push("/projects");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create project workspace.");
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/projects"
              className="inline-flex items-center text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to Project Workspaces
            </Link>
          </div>

          <Card className="border-slate-800 bg-slate-900/70 shadow-2xl">
            <CardHeader className="border-b border-slate-800/80 pb-4">
              <div className="flex items-center space-x-2">
                <FolderGit2 className="w-6 h-6 text-purple-400" />
                <div>
                  <CardTitle className="text-xl text-white font-bold">
                    Create New Project Workspace
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Define the architecture, milestone goals, and tech stack for your portfolio capstone.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-6 text-xs">
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 flex items-start space-x-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Project Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Distributed Task Queue & Real-Time Monitoring Engine"
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-purple-500 text-xs"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">Domain Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-purple-500 text-xs"
                    >
                      <option value="Web">Full Stack Web</option>
                      <option value="Mobile">Mobile Application</option>
                      <option value="AI/ML">AI & Machine Learning</option>
                      <option value="Data Science">Data Science & Analytics</option>
                      <option value="Cybersecurity">Cybersecurity & Forensics</option>
                      <option value="Cloud">Cloud & DevOps</option>
                      <option value="IoT">Internet of Things</option>
                      <option value="Automation">Automation & Tooling</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">Target Complexity</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full h-10 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-purple-500 text-xs"
                    >
                      <option value="Beginner">Beginner (Foundational)</option>
                      <option value="Intermediate">Intermediate (Industry-Grade)</option>
                      <option value="Advanced">Advanced (Production Scale)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Project Overview / Problem Statement</label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what problem this project solves, core capabilities, and expected user workflows..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-purple-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">
                    Technology Stack (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    placeholder="Next.js, FastAPI, PostgreSQL, Redis, Docker"
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-purple-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Architecture Overview (Optional)</label>
                  <textarea
                    rows={3}
                    value={architectureOverview}
                    onChange={(e) => setArchitectureOverview(e.target.value)}
                    placeholder="e.g. Next.js 14 Frontend -> FastAPI REST API -> Celery Worker Nodes -> Redis & Supabase PostgreSQL"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-purple-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">GitHub Repository URL (Optional)</label>
                  <input
                    type="url"
                    value={githubRepoUrl}
                    onChange={(e) => setGithubRepoUrl(e.target.value)}
                    placeholder="https://github.com/your-username/your-repo"
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-purple-500 font-mono text-xs"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                  <Link href="/projects">
                    <Button type="button" variant="outline" className="text-xs h-10 px-4 border-slate-700">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-10 px-6 font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        Creating Workspace...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1.5" />
                        Create Workspace
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
