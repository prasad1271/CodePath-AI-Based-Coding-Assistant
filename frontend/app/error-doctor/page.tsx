"use client";

import React, { useState } from "react";
import {
  Terminal, AlertCircle, CheckCircle2, HelpCircle,
  Lightbulb, ArrowRight, Loader2, Sparkles, Copy, Check
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";

const PRESET_ERRORS = [
  {
    name: "Python IndexError",
    lang: "python",
    code: "nums = [10, 20, 30]\n# Accessing 4th element\nfor i in range(len(nums) + 1):\n    print(nums[i])",
    err: "IndexError: list index out of range"
  },
  {
    name: "C Preprocessor Syntax",
    lang: "c",
    code: "include<stdio.h>\n\nvoid main() {\n    printf(\"hello\\n\");\n    return 0;\n}",
    err: "error: unknown type name 'include'"
  },
  {
    name: "Java NullPointer",
    lang: "java",
    code: "String studentName = null;\n// Dereferencing null object\nint length = studentName.length();",
    err: "java.lang.NullPointerException: Cannot invoke \"String.length()\" because \"studentName\" is null"
  },
  {
    name: "C++ Segmentation Fault",
    lang: "cpp",
    code: "int *ptr = nullptr;\n// Dereferencing null pointer\n*ptr = 42;",
    err: "Segmentation fault (core dumped)"
  },
  {
    name: "JavaScript TypeError",
    lang: "javascript",
    code: "const user = {};\n// Accessing deep nested property\nconsole.log(user.profile.name);",
    err: "TypeError: Cannot read properties of undefined (reading 'name')"
  }
];

export default function ErrorDoctorPage() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(PRESET_ERRORS[0].code);
  const [errorMessage, setErrorMessage] = useState(PRESET_ERRORS[0].err);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleDiagnose = async () => {
    if (!code.trim() && !errorMessage.trim()) return;
    setIsLoading(true);
    setDiagnosis(null); // Clear previous diagnosis to give instant visual feedback

    try {
      const res = await api.diagnoseError(language, code, errorMessage);
      setDiagnosis(res);
    } catch (err: any) {
      console.error("Error doctor failed:", err);
    } finally {
      setIsLoading(false);
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
    if (diagnosis?.corrected_example) {
      navigator.clipboard.writeText(diagnosis.corrected_example);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <Terminal className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Error Doctor 🩺
              </h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Stop panicking over red compiler errors. Get structured root-cause analysis, line diagnosis, and preventative guidance.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Sample errors:</span>
            <div className="flex flex-wrap gap-1">
              {PRESET_ERRORS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => loadPreset(p)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-mono transition-colors"
                >
                  {p.name}
                </button>
              ))}
              <button
                onClick={clearAll}
                className="px-2 py-1 rounded bg-slate-800/80 hover:bg-red-950/40 text-[11px] text-slate-400 hover:text-red-300 border border-slate-700/40 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Input Panel */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Code Input */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-200">
                1. Your Code
              </CardTitle>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-slate-950 text-slate-300 border border-slate-800 rounded px-2 py-1 text-xs focus:outline-none"
              >
                <option value="python">Python</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="javascript">JavaScript</option>
              </select>
            </CardHeader>
            <CardContent>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste the code causing the error here..."
                className="w-full h-44 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </CardContent>
          </Card>

          {/* Error Message Input */}
          <Card className="border-slate-800 bg-slate-900/50 flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-200">
                  2. Error Message / Compiler Trace (Optional)
                </CardTitle>
                {errorMessage && (
                  <button
                    onClick={() => setErrorMessage("")}
                    className="text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    Clear error
                  </button>
                )}
              </CardHeader>
              <CardContent>
                <textarea
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                  placeholder="Paste compiler trace or terminal error (e.g. error: unknown type name 'include')..."
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-red-300/90 focus:outline-none focus:border-red-500"
                />
              </CardContent>
            </div>
            <div className="p-6 pt-0">
              <Button
                onClick={handleDiagnose}
                disabled={isLoading || (!code.trim() && !errorMessage.trim())}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-10 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Diagnosing Root Cause...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze & Prescribe Fix
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Structured Diagnosis Output */}
        {diagnosis && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Doctor&apos;s Structured Diagnosis</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Error Type & What Happened */}
              <Card className="border-red-900/40 bg-red-950/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" />
                    <span>Error Type</span>
                  </div>
                  <CardTitle className="text-base text-red-300 font-mono">
                    {diagnosis.error_type}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-slate-300">
                  <div>
                    <strong className="text-slate-200">What happened:</strong>{" "}
                    <span className="text-slate-300">{diagnosis.what_happened}</span>
                  </div>
                  <div>
                    <strong className="text-slate-200">Problem Location:</strong>{" "}
                    <span className="text-amber-300 font-mono">{diagnosis.where_it_happened}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Why It Happened */}
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4" />
                    <span>Root Cause Reasoning</span>
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

            {/* How To Fix & Corrected Example */}
            <Card className="border-emerald-900/40 bg-emerald-950/10">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>The Solution</span>
                  </div>
                  <CardTitle className="text-base text-emerald-200">
                    How to Fix It
                  </CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyCorrectedExample}
                  className="h-7 px-2.5 text-xs border-emerald-800 text-emerald-300 hover:bg-emerald-950"
                >
                  {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? "Copied" : "Copy Fix"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {diagnosis.how_to_fix}
                </p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                  <pre>{diagnosis.corrected_example}</pre>
                </div>
              </CardContent>
            </Card>

            {/* Prevention Tip & Practice Question */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4" />
                    <span>Prevention Tip</span>
                  </div>
                </CardHeader>
                <CardContent className="text-xs text-slate-300 leading-relaxed">
                  {diagnosis.prevention_tip}
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Reinforcement Challenge</span>
                  </div>
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
