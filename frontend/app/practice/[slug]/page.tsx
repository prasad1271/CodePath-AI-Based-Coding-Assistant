"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, Play, Send, Lightbulb,
  HelpCircle, Tag, Loader2, AlertCircle, Sparkles, Terminal
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeEditor } from "@/components/CodeEditor";
import { Problem } from "@/types";
import { api } from "@/services/api";

export default function ProblemSolverPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState("python");
  const [currentCode, setCurrentCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    if (slug) {
      api.getProblem(slug)
        .then((res) => {
          setProblem(res);
          const defaultCode = res.starter_codes?.["python"] || "";
          setCurrentCode(defaultCode);
        })
        .catch((err) => console.error("Problem fetch error:", err))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleLanguageChange = (lang: string) => {
    setSelectedLang(lang);
    if (problem?.starter_codes?.[lang]) {
      setCurrentCode(problem.starter_codes[lang]);
    }
  };

  const handleSubmit = async () => {
    if (!problem || !currentCode.trim()) return;
    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const res = await api.submitSolution(problem.id, selectedLang, currentCode);
      setSubmissionResult(res);
    } catch (err: any) {
      setSubmissionResult({
        status: "Submission Failed",
        error_message: err.message || "Failed to submit solution."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-16 bg-slate-900 rounded-xl" />
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="h-96 bg-slate-900 rounded-xl" />
            <div className="h-96 bg-slate-900 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!problem) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-slate-400">Problem not found.</p>
          <Link href="/practice">
            <Button variant="outline" className="mt-4">Back to problems</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/practice"
            className="inline-flex items-center text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Problem Arena
          </Link>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5 h-8 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Testing Testcases...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Submit Solution
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 2-Column Split Workspace */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Panel: Description, Constraints, Hints (5 cols) */}
          <div className="lg:col-span-5 space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)] pr-1">
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader className="pb-3 border-b border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <Badge
                    variant={
                      problem.difficulty === "Easy" ? "success" : problem.difficulty === "Medium" ? "warning" : "destructive"
                    }
                    className="text-[10px]"
                  >
                    {problem.difficulty}
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">
                    Acceptance: {problem.acceptance_rate.toFixed(1)}%
                  </span>
                </div>
                <CardTitle className="text-lg text-white font-bold">
                  {problem.title}
                </CardTitle>
                <div className="flex flex-wrap gap-1 pt-1">
                  {problem.company_tags?.map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs text-slate-300 leading-relaxed">
                <div className="whitespace-pre-wrap font-sans">
                  {problem.description}
                </div>

                {problem.constraints_text && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-semibold text-slate-200 block">Constraints:</span>
                    <pre className="font-mono text-[11px] text-slate-400 whitespace-pre-wrap">
                      {problem.constraints_text}
                    </pre>
                  </div>
                )}

                {/* Visible Test Cases */}
                {problem.test_cases && problem.test_cases.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-semibold text-slate-200 block">Sample Test Cases:</span>
                    {problem.test_cases.map((tc, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                        <div><strong className="text-slate-400">Input:</strong> <span className="text-blue-300">{tc.input}</span></div>
                        <div><strong className="text-slate-400">Expected:</strong> <span className="text-emerald-400">{tc.expected_output}</span></div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hints Toggle */}
                {problem.hints && problem.hints.length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="inline-flex items-center text-xs text-amber-400 hover:underline font-medium"
                    >
                      <Lightbulb className="w-3.5 h-3.5 mr-1" />
                      {showHints ? "Hide hints" : "Stuck? View hints"}
                    </button>
                    {showHints && (
                      <div className="mt-2 p-3 rounded-lg bg-amber-950/20 border border-amber-800/30 text-xs text-amber-200/90 space-y-1">
                        {problem.hints.map((h, idx) => (
                          <div key={idx}>• {h}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Solution Explanation Toggle */}
                {problem.solution_explanation && (
                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="inline-flex items-center text-xs text-purple-400 hover:underline font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      {showSolution ? "Hide explanation" : "View optimal approach"}
                    </button>
                    {showSolution && (
                      <div className="mt-2 p-3 rounded-lg bg-purple-950/20 border border-purple-800/30 text-xs text-purple-200/90 whitespace-pre-wrap leading-relaxed">
                        {problem.solution_explanation}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Editor & Submission Feedback (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <CodeEditor
              initialCode={currentCode}
              language={selectedLang}
              height="450px"
              onCodeChange={(val) => setCurrentCode(val)}
            />

            {/* Submission Result Drawer */}
            {submissionResult && (
              <Card className={`border ${
                submissionResult.status === "Accepted"
                  ? "border-emerald-800/60 bg-emerald-950/20"
                  : "border-red-800/60 bg-red-950/20"
              } p-4 animate-in fade-in duration-200`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {submissionResult.status === "Accepted" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="font-bold text-sm text-white">
                      {submissionResult.status}
                    </span>
                  </div>

                  {submissionResult.execution_time_ms !== undefined && (
                    <div className="font-mono text-xs text-slate-300">
                      Runtime: {submissionResult.execution_time_ms.toFixed(0)} ms &bull; Memory: {submissionResult.memory_used_kb.toFixed(0)} KB
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-300 font-mono">
                  {submissionResult.status === "Accepted" ? (
                    <p className="text-emerald-300">
                      All {submissionResult.total_test_cases || 3} test cases passed! Your submission has been permanently recorded in the database.
                    </p>
                  ) : (
                    <p className="text-red-300">
                      {submissionResult.error_message || "Solution failed to satisfy all constraints."}
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
