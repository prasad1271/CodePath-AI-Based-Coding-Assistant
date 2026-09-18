"use client";

import React, { useState, useRef } from "react";
import {
  Terminal, AlertCircle, CheckCircle2, HelpCircle,
  Lightbulb, ArrowRight, Loader2, Sparkles, Copy, Check,
  Wand2, Code2, ShieldAlert, Split, GitCompare, FileCode,
  RotateCcw, Zap, Compass
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  text: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

/**
 * Computes line-by-line diff using Longest Common Subsequence (LCS)
 */
function computeLineDiff(original: string, rectified: string): DiffLine[] {
  const origLines = (original || "").split("\n");
  const rectLines = (rectified || "").split("\n");
  const m = origLines.length;
  const n = rectLines.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (origLines[i] === rectLines[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  let i = m;
  let j = n;
  const result: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1] === rectLines[j - 1]) {
      result.unshift({
        type: "unchanged",
        text: origLines[i - 1],
        oldLineNumber: i,
        newLineNumber: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({
        type: "added",
        text: rectLines[j - 1],
        newLineNumber: j,
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      result.unshift({
        type: "removed",
        text: origLines[i - 1],
        oldLineNumber: i,
      });
      i--;
    }
  }

  return result;
}

const AVAILABLE_LANGUAGES = [
  { id: "python", name: "Python" },
  { id: "c", name: "C" },
  { id: "cpp", name: "C++" },
  { id: "java", name: "Java" },
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
  { id: "go", name: "Go" },
  { id: "rust", name: "Rust" },
  { id: "sql", name: "SQL" }
];

const PRESET_ERRORS = [
  {
    name: "IndexError",
    lang: "python",
    code: "nums = [10, 20, 30]\n# Accessing 4th element in 3-element list\nfor i in range(len(nums) + 1):\n    print(nums[i])",
    err: "IndexError: list index out of range"
  },
  {
    name: "Missing Colon",
    lang: "python",
    code: "def calculate_average(grades)\n    total = sum(grades)\n    return total / len(grades)",
    err: "SyntaxError: expected ':'"
  },
  {
    name: "Preprocessor & Entry",
    lang: "c",
    code: "include<stdio.h>\n\nvoid main() {\n    printf(\"hello\\n\");\n    return 0;\n}",
    err: "error: unknown type name 'include'"
  },
  {
    name: "SegFault / Null Pointer",
    lang: "cpp",
    code: "#include <iostream>\n\nint main() {\n    int *ptr = nullptr;\n    // Dereferencing unallocated null pointer\n    *ptr = 42;\n    std::cout << *ptr << std::endl;\n    return 0;\n}",
    err: "Segmentation fault (core dumped)"
  },
  {
    name: "NullPointer",
    lang: "java",
    code: "String studentName = null;\n// Dereferencing null object\nint length = studentName.length();",
    err: "java.lang.NullPointerException: Cannot invoke \"String.length()\" because \"studentName\" is null"
  },
  {
    name: "TypeError",
    lang: "javascript",
    code: "const user = {};\n// Accessing deep nested property on undefined\nconsole.log(user.profile.name);",
    err: "TypeError: Cannot read properties of undefined (reading 'name')"
  },
  {
    name: "Missing Async",
    lang: "typescript",
    code: "function fetchUserData() {\n    // Await without async function envelope\n    const data = await fetch('/api/user');\n    return data.json();\n}",
    err: "SyntaxError: await is only valid in async functions and the top-level bodies of modules"
  },
  {
    name: "Unused Variable",
    lang: "go",
    code: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    x := 42\n    fmt.Println(\"CodePath AI\")\n}",
    err: "x declared and not used"
  },
  {
    name: "Immutability",
    lang: "rust",
    code: "fn main() {\n    let count = 0;\n    count = count + 1;\n    println!(\"Count: {}\", count);\n}",
    err: "error[E0384]: cannot assign twice to immutable variable `count`"
  },
  {
    name: "Dangerous DELETE",
    lang: "sql",
    code: "DELETE FROM students;",
    err: "WARNING: Destructive query without WHERE clause"
  }
];

export default function ErrorDoctorPage() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(PRESET_ERRORS[0].code);
  const [errorMessage, setErrorMessage] = useState(PRESET_ERRORS[0].err);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [appliedFix, setAppliedFix] = useState(false);
  const [viewMode, setViewMode] = useState<"side-by-side" | "unified" | "clean">("side-by-side");

  const editorRef = useRef<HTMLTextAreaElement>(null);

  const handleDiagnose = async () => {
    if (!code.trim() && !errorMessage.trim()) return;
    setIsLoading(true);
    setDiagnosis(null);

    try {
      const res = await api.diagnoseError(language, code, errorMessage);
      setDiagnosis(res);
    } catch (err: any) {
      console.error("Error doctor failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFixToEditor = () => {
    const fixedCode = diagnosis?.rectified_code || diagnosis?.corrected_example;
    if (fixedCode) {
      setCode(fixedCode);
      setAppliedFix(true);
      setTimeout(() => setAppliedFix(false), 2500);
      if (editorRef.current) {
        editorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        window.scrollTo({ top: 120, behavior: "smooth" });
      }
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    const matchingPreset = PRESET_ERRORS.find((p) => p.lang === newLang);
    if (matchingPreset) {
      setCode(matchingPreset.code);
      setErrorMessage(matchingPreset.err);
    } else {
      setCode("");
      setErrorMessage("");
    }
    setDiagnosis(null);
  };

  const loadPreset = (preset: typeof PRESET_ERRORS[0]) => {
    setLanguage(preset.lang);
    setCode(preset.code);
    setErrorMessage(preset.err);
    setDiagnosis(null);
  };

  const clearAll = () => {
    setCode("");
    setErrorMessage("");
    setDiagnosis(null);
  };

  const copyCorrectedExample = () => {
    const target = diagnosis?.rectified_code || diagnosis?.corrected_example;
    if (target) {
      navigator.clipboard.writeText(target);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderSeverityBadge = (severity?: string) => {
    const sev = (severity || "error").toLowerCase();
    if (sev === "warning") {
      return (
        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-semibold flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          Warning
        </Badge>
      );
    }
    if (sev === "logical_bug") {
      return (
        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-xs font-semibold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Logical Bug
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-xs font-semibold flex items-center gap-1">
        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
        Fatal Error
      </Badge>
    );
  };

  const originalLines: string[] = (code || "").split("\n");
  const rectifiedCode: string = String(diagnosis?.rectified_code || diagnosis?.corrected_example || "");
  const rectifiedLines: string[] = rectifiedCode.split("\n");
  const diffLines: DiffLine[] = diagnosis ? computeLineDiff(code, rectifiedCode) : [];
  const currentLanguagePresets = PRESET_ERRORS.filter((p) => p.lang === language);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/30">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  AI Error Doctor <span className="text-emerald-400 text-lg">🩺</span>
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  Multi-Language Compiler & Logic Diagnostic Engine with Intelligent Code Auto-Rectification
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
            {/* Languages available to debug */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mr-1">
                Languages to Debug:
              </span>
              {AVAILABLE_LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                    language === lang.id
                      ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/50 shadow-sm font-semibold ring-1 ring-emerald-500/30"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800"
                  }`}
                >
                  {lang.name}
                </button>
              ))}
              <button
                onClick={clearAll}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-red-950/40 text-[11px] text-slate-400 hover:text-red-300 border border-slate-800 transition-colors font-mono"
              >
                Clear
              </button>
            </div>

            {/* Only show sample bugs for the selected language */}
            {currentLanguagePresets.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium mr-1">
                  Sample Bugs ({AVAILABLE_LANGUAGES.find((l) => l.id === language)?.name}):
                </span>
                {currentLanguagePresets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => loadPreset(p)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all border ${
                      code === p.code
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold shadow-sm"
                        : "bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800/80"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input Panel */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Code Input */}
          <Card className="border-slate-800 bg-slate-900/60 shadow-lg flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    1. Student Code to Diagnose
                  </CardTitle>
                  {appliedFix && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] animate-pulse">
                      Fix Applied to Editor!
                    </Badge>
                  )}
                </div>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-slate-950 text-emerald-400 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="python">Python</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="sql">SQL</option>
                </select>
              </CardHeader>
              <CardContent>
                <textarea
                  ref={editorRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste student code causing an error, crash, or logic flaw here..."
                  className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 leading-relaxed transition-all resize-y"
                />
              </CardContent>
            </div>
            <div className="px-6 pb-4 pt-0 flex items-center justify-between text-[11px] text-slate-400">
              <span>{code ? `${code.split("\n").length} lines` : "Empty code editor"}</span>
              <span className="font-mono text-slate-500 uppercase">{language}</span>
            </div>
          </Card>

          {/* Error Message Input */}
          <Card className="border-slate-800 bg-slate-900/60 shadow-lg flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-red-400" />
                    2. Compiler Trace / Error (Optional)
                  </CardTitle>
                </div>
                {errorMessage && (
                  <button
                    onClick={() => setErrorMessage("")}
                    className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Clear trace
                  </button>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                <textarea
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                  placeholder="Paste compiler trace or terminal error (optional — leave blank for automated AST analysis and sandbox runtime detection)..."
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-red-300/90 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 leading-relaxed transition-all resize-y"
                />
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>
                    <strong className="text-emerald-400">Pre-Flight Auto-Detection Enabled:</strong> Leave blank to automatically parse AST and execute code in the sandbox.
                  </span>
                </div>
              </CardContent>
            </div>
            <div className="p-6 pt-0">
              <Button
                onClick={handleDiagnose}
                disabled={isLoading || (!code.trim() && !errorMessage.trim())}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold h-11 shadow-lg shadow-emerald-950/50 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Code & Formulating Rectification...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Code & Rectify Errors
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Structured Diagnosis & Code Rectification Output */}
        {diagnosis && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Diagnosis Overview Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/80">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Doctor&apos;s Structured Diagnosis & Remediation
                  </h2>
                  <p className="text-xs text-slate-400">
                    Pinpointed root cause, severity classification, and working solution diff
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {diagnosis.line_number && (
                  <Badge className="bg-slate-800 text-amber-300 border-slate-700 text-xs font-mono flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-amber-400" />
                    Line {diagnosis.line_number}
                  </Badge>
                )}
                {renderSeverityBadge(diagnosis.severity)}
              </div>
            </div>

            {/* Diagnostic Details Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Error Type & What Happened */}
              <Card className="border-red-900/40 bg-red-950/20 shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" />
                    <span>Error Classification</span>
                  </div>
                  <CardTitle className="text-base text-red-300 font-mono">
                    {diagnosis.error_type}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-slate-300">
                  <div>
                    <strong className="text-slate-200">Symptom / What Happened:</strong>{" "}
                    <span className="text-slate-300 leading-relaxed">{diagnosis.what_happened}</span>
                  </div>
                  <div>
                    <strong className="text-slate-200">Problem Location:</strong>{" "}
                    <span className="text-amber-300 font-mono">{diagnosis.where_it_happened}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Root Cause Reasoning */}
              <Card className="border-slate-800 bg-slate-900/60 shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4" />
                    <span>Root Cause Mechanics</span>
                  </div>
                  <CardTitle className="text-base text-slate-200">
                    Why It Happened
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-300 leading-relaxed">
                  {diagnosis.why_it_happened}
                </CardContent>
              </Card>
            </div>

            {/* Visual Diff & Solution Card */}
            <Card className="border-emerald-900/40 bg-emerald-950/10 shadow-xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-emerald-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Visual Code Rectification & Diff</span>
                  </div>
                  <CardTitle className="text-base text-emerald-200 mt-0.5">
                    Prescribed Solution & Automated Repair
                  </CardTitle>
                </div>

                {/* View Mode Switcher & Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                    <button
                      onClick={() => setViewMode("side-by-side")}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                        viewMode === "side-by-side"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Split className="w-3.5 h-3.5" />
                      Side-by-Side
                    </button>
                    <button
                      onClick={() => setViewMode("unified")}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                        viewMode === "unified"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      Unified Diff
                    </button>
                    <button
                      onClick={() => setViewMode("clean")}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                        viewMode === "clean"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      Clean Code
                    </button>
                  </div>

                  <Button
                    size="sm"
                    onClick={applyFixToEditor}
                    className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md transition-all"
                  >
                    {appliedFix ? <Check className="w-3.5 h-3.5 mr-1 text-white" /> : <Wand2 className="w-3.5 h-3.5 mr-1" />}
                    {appliedFix ? "Applied to Editor!" : "Apply Fix to Code"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyCorrectedExample}
                    className="h-8 px-2.5 text-xs border-emerald-800 text-emerald-300 hover:bg-emerald-950/60"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copied ? "Copied" : "Copy Fix"}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                {/* How to Fix Explanation */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-emerald-300 font-semibold">Doctor&apos;s Prescription:</strong>{" "}
                    <span>{diagnosis.how_to_fix}</span>
                  </div>
                </div>

                {/* 1. Side-by-Side Comparison View */}
                {viewMode === "side-by-side" && (
                  <div className="grid md:grid-cols-2 gap-3 font-mono text-xs">
                    {/* Left: Original Code */}
                    <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                      <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] text-red-300 flex items-center justify-between font-sans">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                          Original Code (Broken)
                        </span>
                        <span className="text-slate-500">{originalLines.length} lines</span>
                      </div>
                      <div className="p-2 overflow-x-auto max-h-96">
                        {originalLines.map((line, idx) => {
                          const isOffendingLine = diagnosis.line_number === idx + 1;
                          return (
                            <div
                              key={idx}
                              className={`flex items-start px-2 py-0.5 rounded transition-colors ${
                                isOffendingLine
                                  ? "bg-red-950/60 border-l-2 border-red-500 text-red-200 font-semibold"
                                  : "text-slate-400 hover:bg-slate-900/50"
                              }`}
                            >
                              <span className="w-8 text-right pr-3 select-none text-slate-600 flex-shrink-0 text-[11px]">
                                {idx + 1}
                              </span>
                              <span className="whitespace-pre overflow-x-visible">{line || " "}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Rectified Code */}
                    <div className="rounded-xl bg-slate-950 border border-emerald-900/40 overflow-hidden">
                      <div className="px-3.5 py-2 bg-slate-900/90 border-b border-emerald-900/40 text-[11px] text-emerald-300 flex items-center justify-between font-sans">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Rectified Solution (Working)
                        </span>
                        <span className="text-emerald-500/70">{rectifiedLines.length} lines</span>
                      </div>
                      <div className="p-2 overflow-x-auto max-h-96">
                        {rectifiedLines.map((line, idx) => {
                          const isModified = idx >= originalLines.length || originalLines[idx] !== line;
                          return (
                            <div
                              key={idx}
                              className={`flex items-start px-2 py-0.5 rounded transition-colors ${
                                isModified
                                  ? "bg-emerald-950/60 border-l-2 border-emerald-500 text-emerald-200 font-semibold"
                                  : "text-slate-300 hover:bg-slate-900/50"
                              }`}
                            >
                              <span className="w-8 text-right pr-3 select-none text-slate-600 flex-shrink-0 text-[11px]">
                                {idx + 1}
                              </span>
                              <span className="whitespace-pre overflow-x-visible">{line || " "}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Unified Git-Style Diff View */}
                {viewMode === "unified" && (
                  <div className="rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-hidden">
                    <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-300 flex items-center justify-between font-sans">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <GitCompare className="w-3.5 h-3.5 text-emerald-400" />
                        Unified Line Diff Comparison
                      </span>
                      <div className="flex items-center gap-3 text-slate-400 text-[10px]">
                        <span className="flex items-center gap-1 text-red-400">
                          <span className="w-2 h-2 rounded-full bg-red-500" /> Removed / Problematic
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Rectified / Added
                        </span>
                      </div>
                    </div>
                    <div className="p-2 overflow-x-auto max-h-96">
                      {diffLines.map((d, idx) => {
                        if (d.type === "added") {
                          return (
                            <div
                              key={idx}
                              className="flex items-start px-2 py-0.5 bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500"
                            >
                              <span className="w-8 text-right pr-2 text-slate-600 select-none text-[10px]"> </span>
                              <span className="w-8 text-right pr-3 text-emerald-500 select-none text-[10px]">{d.newLineNumber}</span>
                              <span className="w-4 select-none text-emerald-400 font-bold">+</span>
                              <span className="whitespace-pre overflow-x-visible">{d.text || " "}</span>
                            </div>
                          );
                        }
                        if (d.type === "removed") {
                          return (
                            <div
                              key={idx}
                              className="flex items-start px-2 py-0.5 bg-red-950/40 text-red-300 border-l-2 border-red-500"
                            >
                              <span className="w-8 text-right pr-2 text-red-400 select-none text-[10px]">{d.oldLineNumber}</span>
                              <span className="w-8 text-right pr-3 text-slate-600 select-none text-[10px]"> </span>
                              <span className="w-4 select-none text-red-400 font-bold">-</span>
                              <span className="whitespace-pre overflow-x-visible">{d.text || " "}</span>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={idx}
                            className="flex items-start px-2 py-0.5 text-slate-400 hover:bg-slate-900/30"
                          >
                            <span className="w-8 text-right pr-2 text-slate-600 select-none text-[10px]">{d.oldLineNumber}</span>
                            <span className="w-8 text-right pr-3 text-slate-600 select-none text-[10px]">{d.newLineNumber}</span>
                            <span className="w-4 select-none text-slate-600"> </span>
                            <span className="whitespace-pre overflow-x-visible">{d.text || " "}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Clean Full Rectified Code View */}
                {viewMode === "clean" && (
                  <div className="rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-hidden">
                    <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-300 flex items-center justify-between font-sans">
                      <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                        <FileCode className="w-3.5 h-3.5" />
                        Clean Complete Executable Code
                      </span>
                      <span className="text-slate-500 uppercase">{language}</span>
                    </div>
                    <div className="p-3.5 overflow-x-auto max-h-96">
                      <pre className="text-emerald-300 leading-relaxed">{rectifiedCode}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prevention Tip & Practice Question */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-slate-800 bg-slate-900/60 shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4" />
                    <span>Prevention Best Practice</span>
                  </div>
                  <CardTitle className="text-base text-slate-200">
                    Defensive Coding Tip
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-300 leading-relaxed">
                  {diagnosis.prevention_tip}
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/60 shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Conceptual Reinforcement</span>
                  </div>
                  <CardTitle className="text-base text-slate-200">
                    Mastery Challenge
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-300 leading-relaxed">
                  {diagnosis.practice_question}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
