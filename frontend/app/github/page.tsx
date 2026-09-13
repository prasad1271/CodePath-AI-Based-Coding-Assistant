"use client";

import React, { useState } from "react";
import {
  Github, CheckCircle2, AlertTriangle, Sparkles, Copy,
  Check, ArrowRight, Loader2, ExternalLink
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";

export default function GithubAssistantPage() {
  const [username, setUsername] = useState("octocat-engineer");
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [auditData, setAuditData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAudit = async () => {
    if (!username.trim()) return;
    setIsLoading(true);
    try {
      const res = await api.auditGithub(username, targetRole);
      setAuditData(res);
    } catch (err) {
      console.error("GitHub audit error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReadme = () => {
    if (auditData?.sample_readme_markdown) {
      navigator.clipboard.writeText(auditData.sample_readme_markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800/40 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Github className="w-6 h-6 text-slate-100" />
              <h1 className="text-2xl font-bold text-white tracking-tight">GitHub Portfolio Assistant</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Audit your public GitHub profile, evaluate repository presentation standards, and generate a recruiter-ready profile README.
            </p>
          </div>
        </div>

        {/* Input Bar */}
        <Card className="border-slate-800 bg-slate-900/50 p-5">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1">
              <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">github.com/</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full h-10 bg-slate-950 border border-slate-800 rounded-lg pl-28 pr-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full sm:w-60 h-10 bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs text-slate-200 focus:outline-none"
            >
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Software Developer">Software Developer</option>
              <option value="AI/ML Engineer">AI/ML Engineer</option>
              <option value="Cybersecurity Specialist">Cybersecurity Specialist</option>
            </select>

            <Button
              onClick={handleAudit}
              disabled={isLoading || !username.trim()}
              className="w-full sm:w-auto h-10 px-5 bg-blue-600 hover:bg-blue-700 text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Auditing Profile...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Run Profile Audit
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Audit Results */}
        {auditData && (
          <div className="space-y-6 animate-in fade-in">
            {/* Score & Checklist */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-slate-800 bg-slate-900/50 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">Profile Quality Checklist</h3>
                  <Badge variant="default" className="font-mono text-xs">
                    Score: {auditData.audit_score}%
                  </Badge>
                </div>

                <div className="space-y-2.5 text-xs">
                  {auditData.checklist?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="flex items-center space-x-2">
                        {item.status === "pass" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                        <span className="text-slate-200">{item.item}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Weight {item.weight}%</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Actionable Recommendations */}
              <Card className="border-slate-800 bg-slate-900/50 p-6 space-y-4">
                <h3 className="font-bold text-white text-base">Recruiter Impressions & Recommendations</h3>
                <div className="space-y-2.5 text-xs text-slate-300">
                  {auditData.recommendations?.map((rec: string, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 leading-relaxed">
                      • {rec}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Generated Profile README */}
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-800/80">
                <div>
                  <CardTitle className="text-base text-slate-200">Generated Recruiter README.md</CardTitle>
                  <CardDescription className="text-xs">
                    Copy and save as your special GitHub repository README ({username}/{username}).
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyReadme}
                  className="h-8 text-xs border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? "Copied" : "Copy Markdown"}
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                  <pre className="whitespace-pre-wrap leading-relaxed">{auditData.sample_readme_markdown}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
