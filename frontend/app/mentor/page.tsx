"use client";

import React, { useState } from "react";
import {
  Sparkles, Send, Terminal, HelpCircle, Code, CheckCircle2,
  AlertCircle, RotateCcw, Lightbulb, User, Bot, Loader2
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";

const MODES = [
  { id: "hint", label: "Give Hint", icon: Lightbulb, color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  { id: "explain", label: "Explain Concept", icon: HelpCircle, color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
  { id: "debug", label: "Debug Code", icon: Terminal, color: "text-red-400 border-red-500/30 bg-red-500/10" },
  { id: "improve", label: "Improve & Optimize", icon: Sparkles, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  { id: "practice", label: "Practice Challenge", icon: Code, color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
];

export default function MentorPage() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; code?: string }>>([
    {
      role: "assistant",
      content: "Hello! I am your **CodePath AI Mentor**. I'm here to help you master programming fundamentals, debug complex issues, and guide your algorithmic reasoning.\n\n*Pro-tip:* Select **Give Hint** mode when you want guiding questions instead of direct solutions!"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedMode, setSelectedMode] = useState("hint");
  const [selectedLang, setSelectedLang] = useState("python");
  const [codeContext, setCodeContext] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      role: "user" as const,
      content: textToSend,
      code: codeContext.trim() ? codeContext : undefined
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await api.chatWithMentor(
        textToSend,
        selectedMode,
        selectedLang,
        codeContext.trim() ? codeContext : undefined
      );

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.response }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I am temporarily unable to connect to the programming mentor. Please verify your connection or try again shortly."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Top Control Bar */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Programming Mentor</h2>
              <p className="text-[11px] text-slate-400">Pedagogical guidance &bull; Hint-first philosophy</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode selection pills */}
            <div className="flex space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {MODES.map((m) => {
                const Icon = m.icon;
                const isSelected = selectedMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMode(m.id)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all ${
                      isSelected
                        ? `${m.color} font-semibold shadow-sm border`
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Language Selector */}
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-slate-950 text-slate-300 border border-slate-800 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="javascript">JavaScript</option>
              <option value="sql">SQL</option>
            </select>
          </div>
        </div>

        {/* Chat History Thread */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl border border-slate-800 bg-slate-950/60 shadow-inner">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-xl max-w-2xl text-xs leading-relaxed space-y-2 ${
                  m.role === "user"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-slate-900 border border-slate-800 text-slate-200 shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {m.code && (
                  <div className="mt-2 p-2.5 rounded bg-slate-950 font-mono text-[11px] border border-slate-800 overflow-x-auto text-emerald-400">
                    <pre>{m.code}</pre>
                  </div>
                )}
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span>Thinking through pedagogical hints...</span>
              </div>
            </div>
          )}
        </div>

        {/* Optional Code Context Drawer */}
        {showCodeInput && (
          <div className="mt-2 p-3 rounded-xl border border-slate-800 bg-slate-900/90 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">Attach Code Snippet ({selectedLang})</span>
              <button onClick={() => setShowCodeInput(false)} className="text-slate-400 hover:text-white">
                ✕ Close
              </button>
            </div>
            <textarea
              value={codeContext}
              onChange={(e) => setCodeContext(e.target.value)}
              placeholder="Paste code snippet here for mentor line-by-line review..."
              className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Quick Action Suggestion Pills */}
        <div className="flex items-center space-x-2 my-2 overflow-x-auto text-[11px] text-slate-400 py-1">
          <span className="shrink-0 text-slate-400">Quick prompts:</span>
          {[
            "Don't give me the answer – give me a hint.",
            "Explain this algorithm step-by-step.",
            "What is the time complexity Big-O?",
            "What edge cases should I test?"
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-slate-200 shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="flex items-center space-x-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCodeInput(!showCodeInput)}
            className={`h-10 px-3 text-xs border-slate-800 ${showCodeInput ? "bg-slate-800 text-blue-400" : "text-slate-400"}`}
          >
            <Code className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Code</span>
          </Button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={
              selectedMode === "hint"
                ? "Ask for guidance (e.g. 'I am stuck on Two Sum pointer movement')..."
                : "Ask programming question..."
            }
            className="flex-1 h-10 bg-slate-900 border border-slate-800 rounded-lg px-4 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
          />

          <Button
            size="sm"
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
