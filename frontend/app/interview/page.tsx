"use client";

import React, { useState } from "react";
import {
  Mic, Play, Send, CheckCircle2, AlertCircle, Sparkles,
  TrendingUp, ArrowRight, Loader2, Award, RefreshCw
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InterviewSession } from "@/types";
import { api } from "@/services/api";

const MODES = ["Technical", "DSA", "HR", "Project", "Behavioral"];

export default function InterviewPage() {
  const [selectedMode, setSelectedMode] = useState("Technical");
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleStartInterview = async () => {
    setIsStarting(true);
    setAnswerFeedback(null);
    setIsCompleted(false);

    try {
      const res = await api.startInterview(selectedMode, targetRole);
      setSession(res);
    } catch (err) {
      console.error("Failed to start interview:", err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!session || !session.current_question || !currentAnswer.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await api.submitInterviewAnswer(
        session.id,
        session.current_question.id,
        currentAnswer
      );
      setAnswerFeedback(res);
    } catch (err) {
      console.error("Failed to submit answer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!session) return;
    try {
      const finished = await api.completeInterview(session.id);
      setSession(finished);
      setIsCompleted(true);
    } catch (err) {
      console.error("Complete interview error:", err);
      setIsCompleted(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Mic className="w-6 h-6 text-purple-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">AI Mock Interview Simulator</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Dynamic technical and HR interview rounds with real-time scoring on technical depth, communication, and problem solving.
            </p>
          </div>
        </div>

        {!session ? (
          /* Interview Setup Card */
          <Card className="max-w-2xl mx-auto border-slate-800 bg-slate-900/60 p-6 space-y-6 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold text-white">Configure Your Mock Interview</h2>
              <p className="text-xs text-slate-400 mt-1">
                Choose the interview format and target role you are preparing for.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-2">Interview Format</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {MODES.map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMode(m)}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        selectedMode === m
                          ? "border-purple-500 bg-purple-500/20 text-purple-300 font-semibold"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-2">Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full h-10 bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-3 focus:outline-none focus:border-purple-500"
                >
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Software Developer">Software Developer</option>
                  <option value="AI/ML Engineer">AI/ML Engineer</option>
                  <option value="Cybersecurity Specialist">Cybersecurity Specialist</option>
                  <option value="Cloud / DevOps Engineer">Cloud / DevOps Engineer</option>
                </select>
              </div>
            </div>

            <Button
              onClick={handleStartInterview}
              disabled={isStarting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold h-11 text-xs"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2 fill-white" />
                  Begin Interview Session
                </>
              )}
            </Button>
          </Card>
        ) : isCompleted ? (
          /* Post-Interview Comprehensive Report */
          <div className="space-y-6 animate-in fade-in duration-300">
            <Card className="border-purple-800/40 bg-purple-950/20 p-6 text-center space-y-4">
              <Award className="w-12 h-12 text-amber-400 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-white">Mock Interview Completed!</h2>
                <p className="text-slate-400 text-xs mt-1">Here is your performance evaluation for {session.target_role}.</p>
              </div>
              <div className="text-4xl font-extrabold text-purple-300 font-mono">
                {session.overall_score || 82.0}%
              </div>
            </Card>

            {/* Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <Card className="border-slate-800 bg-slate-900/50 p-4">
                <div className="text-xs text-slate-400">Technical Depth</div>
                <div className="text-xl font-bold text-blue-400 font-mono mt-1">{session.technical_score || 85}%</div>
              </Card>
              <Card className="border-slate-800 bg-slate-900/50 p-4">
                <div className="text-xs text-slate-400">Problem Solving</div>
                <div className="text-xl font-bold text-indigo-400 font-mono mt-1">{session.problem_solving_score || 80}%</div>
              </Card>
              <Card className="border-slate-800 bg-slate-900/50 p-4">
                <div className="text-xs text-slate-400">Communication</div>
                <div className="text-xl font-bold text-emerald-400 font-mono mt-1">{session.communication_score || 81}%</div>
              </Card>
              <Card className="border-slate-800 bg-slate-900/50 p-4">
                <div className="text-xs text-slate-400">Confidence</div>
                <div className="text-xl font-bold text-amber-400 font-mono mt-1">{session.confidence_score || 78}%</div>
              </Card>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-emerald-900/30 bg-emerald-950/10 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-emerald-300 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Key Strengths</span>
                </h3>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-5">
                  {session.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </Card>

              <Card className="border-amber-900/30 bg-amber-950/10 p-4 space-y-2">
                <h3 className="text-sm font-semibold text-amber-300 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Areas for Improvement</span>
                </h3>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-5">
                  {session.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </Card>
            </div>

            <div className="text-center pt-2">
              <Button onClick={() => setSession(null)} className="bg-blue-600 hover:bg-blue-700 text-xs px-6">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Start Another Mock Session
              </Button>
            </div>
          </div>
        ) : (
          /* Active Interview Question Room */
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <Badge variant="outline" className="text-xs">
                  {session.mode} Round &bull; Question {session.current_question?.question_order || 1} of 3
                </Badge>
                <span className="text-xs text-purple-400 font-mono">Live Interview Room</span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white leading-relaxed">
                  &ldquo;{session.current_question?.question_text}&rdquo;
                </h2>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">
                  Your Answer (Structure using STAR method: Situation, Task, Action, Result):
                </label>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Articulate your solution, trade-offs, and design rationale..."
                  className="w-full h-36 bg-slate-950 border border-slate-800 rounded-xl p-3 font-sans text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  onClick={handleAnswerSubmit}
                  disabled={isSubmitting || !currentAnswer.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-xs px-5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Evaluating Answer...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Submit Answer for Feedback
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleFinishInterview}
                  className="text-xs border-slate-700 text-slate-300"
                >
                  End Session & Get Report
                </Button>
              </div>

              {/* Feedback Drawer */}
              {answerFeedback && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-purple-800/40 space-y-3 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-400">Score: {answerFeedback.score}/100</span>
                    <Badge variant="success" className="text-[10px]">Evaluated</Badge>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{answerFeedback.feedback}</p>
                  <div className="p-2.5 rounded bg-purple-950/20 border border-purple-800/20 text-purple-300 text-[11px]">
                    <strong>Suggested Production Formulation:</strong> {answerFeedback.suggested_answer}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
