"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Play, RotateCcw, Terminal, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  readOnly?: boolean;
  height?: string;
  onCodeChange?: (code: string) => void;
  onRunComplete?: (result: any) => void;
}

export function CodeEditor({
  initialCode = 'print("Hello from CodePath Sandboxed Editor!")',
  language = "python",
  readOnly = false,
  height = "420px",
  onCodeChange,
  onRunComplete
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [selectedLang, setSelectedLang] = useState(language);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ time?: number; memory?: number; status?: string } | null>(null);

  const handleEditorChange = (value: string | undefined) => {
    const val = value || "";
    setCode(val);
    if (onCodeChange) onCodeChange(val);
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput(null);
    setError(null);
    setStats(null);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    setError(null);

    try {
      const res = await api.runCode(selectedLang, code);
      setOutput(res.output || "(Code executed with no output printed)");
      setError(res.error || null);
      setStats({
        time: res.execution_time_ms,
        memory: res.memory_used_kb,
        status: res.status
      });
      if (onRunComplete) onRunComplete(res);
    } catch (err: any) {
      setError(err.message || "Failed to execute code.");
      setStats({ status: "Execution Error" });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col border border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-2xl">
      {/* Top action toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
          </div>
          <span className="text-slate-400 font-mono">codepath_sandbox</span>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-0.5 text-xs focus:outline-none"
            disabled={readOnly}
          >
            <option value="python">Python 3.11</option>
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="cpp">C++ (g++ 17)</option>
            <option value="c">C (gcc 11)</option>
            <option value="java">Java 17</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {!readOnly && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isRunning}
                className="text-slate-400 hover:text-slate-200 h-7 px-2 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleRun}
                disabled={isRunning}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-3 text-xs shadow-md"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1 fill-white" />
                    Run Code
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div style={{ height }}>
        <Editor
          height="100%"
          language={selectedLang === "cpp" ? "cpp" : selectedLang === "c" ? "c" : selectedLang}
          value={code}
          theme="vs-dark"
          options={{
            readOnly,
            fontSize: 13,
            fontFamily: "Fira Code, Menlo, Monaco, Consolas, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12, bottom: 12 },
          }}
          onChange={handleEditorChange}
        />
      </div>

      {/* Output Terminal Console */}
      {(output !== null || error !== null || isRunning) && (
        <div className="border-t border-slate-800 bg-slate-900/90 p-4 font-mono text-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-slate-300">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span className="font-semibold">Terminal Execution Output</span>
            </div>
            {stats && (
              <div className="flex items-center space-x-2">
                <Badge variant={stats.status === "Success" ? "success" : "destructive"}>
                  {stats.status}
                </Badge>
                {stats.time !== undefined && (
                  <span className="text-slate-400">{stats.time.toFixed(0)} ms</span>
                )}
              </div>
            )}
          </div>

          {isRunning && (
            <div className="flex items-center space-x-2 text-slate-400 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span>Executing in isolated sandbox environment...</span>
            </div>
          )}

          {output && (
            <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
              {output}
            </pre>
          )}

          {error && (
            <div className="mt-2 p-2.5 rounded bg-red-950/40 border border-red-800/40 text-red-300 whitespace-pre-wrap leading-relaxed">
              <div className="flex items-center space-x-1.5 font-semibold text-red-400 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span>Runtime Diagnostics</span>
              </div>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
