"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FolderGit2, ArrowLeft, CheckCircle2, Circle, Github,
  ExternalLink, Layers, Database, Code, Trash2, Loader2, Sparkles
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types";
import { api } from "@/services/api";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await api.getProject(projectId);
      setProject(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load project details.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleToggleTask = async (taskId: string) => {
    if (!project) return;
    try {
      await api.toggleProjectTask(project.id, taskId);
      fetchProject();
    } catch (err) {
      console.error("Task toggle error:", err);
    }
  };

  const handleDelete = async () => {
    if (!project || !confirm("Are you sure you want to delete this project workspace?")) return;
    setDeleting(true);
    try {
      await api.deleteProject(project.id);
      router.push("/projects");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete project.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
            <div className="h-40 bg-slate-900 rounded-2xl" />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 h-96 bg-slate-900 rounded-2xl" />
              <div className="h-96 bg-slate-900 rounded-2xl" />
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!project) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-20 max-w-md mx-auto space-y-4">
            <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto" />
            <h2 className="text-lg font-bold text-white">Project Not Found</h2>
            <p className="text-xs text-slate-400">
              The project workspace you are looking for does not exist or has been removed.
            </p>
            <Link href="/projects">
              <Button size="sm" variant="outline">
                Back to Workspaces
              </Button>
            </Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const completedTasks = project.tasks?.filter((t) => t.is_completed).length || 0;
  const totalTasks = project.tasks?.length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Back link & actions */}
          <div className="flex items-center justify-between">
            <Link
              href="/projects"
              className="inline-flex items-center text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to Project Workspaces
            </Link>

            <Button
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={handleDelete}
              className="text-xs h-8 px-3"
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete Workspace
                </>
              )}
            </Button>
          </div>

          {/* Header Card */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                  {project.category}
                </Badge>
                <Badge variant={project.status === "completed" ? "success" : "secondary"} className="text-xs">
                  {project.status === "completed" ? "Completed" : "In Progress"}
                </Badge>
                <Badge variant="outline" className="text-xs font-mono">
                  {project.difficulty}
                </Badge>
              </div>

              {project.github_repo_url && (
                <a
                  href={project.github_repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 font-mono bg-blue-950/40 border border-blue-800/40 px-3 py-1 rounded-lg"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              )}
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">{project.title}</h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">{project.description}</p>

            {/* Progress bar */}
            <div className="pt-2">
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Milestone Completion Progress</span>
                <span className="text-purple-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Milestone Tasks & Checklist */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border-slate-800 bg-slate-900/50 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Milestones & Engineering Tasks</span>
                  </h2>
                  <span className="text-xs font-mono text-slate-400">
                    {completedTasks} of {totalTasks} Completed
                  </span>
                </div>

                {project.tasks && project.tasks.length > 0 ? (
                  <div className="space-y-2.5">
                    {project.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleToggleTask(task.id)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors text-left text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          {task.is_completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                          <span
                            className={
                              task.is_completed
                                ? "line-through text-slate-500"
                                : "text-slate-200 font-medium"
                            }
                          >
                            {task.title}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono shrink-0 ml-2">
                          {task.milestone}
                        </Badge>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No milestone tasks defined yet.</p>
                )}
              </Card>

              {/* Architecture & DB Design */}
              {project.architecture_overview && (
                <Card className="border-slate-800 bg-slate-900/50 p-6 space-y-3">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>System Architecture Overview</span>
                  </h2>
                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {project.architecture_overview}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Col: Tech Stack & Resume Bullets */}
            <div className="space-y-6">
              {/* Tech Stack */}
              <Card className="border-slate-800 bg-slate-900/50 p-5 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Code className="w-4 h-4 text-indigo-400" />
                  <span>Technology Stack</span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.tech_stack?.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Resume Bullets */}
              {project.resume_bullets && project.resume_bullets.length > 0 && (
                <Card className="border-slate-800 bg-slate-900/50 p-5 space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Target Resume Bullets</span>
                  </h3>
                  <div className="space-y-2 text-xs text-slate-300">
                    {project.resume_bullets.map((b, i) => (
                      <div key={i} className="p-2.5 rounded bg-slate-950 border border-slate-800/80 leading-relaxed">
                        • {b}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
