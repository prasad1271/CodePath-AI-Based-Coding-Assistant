"use client";

import React, { useEffect, useState } from "react";
import {
  GraduationCap, Clock, CheckCircle2, AlertCircle, ArrowRight,
  HelpCircle, Check, X, Award, RotateCcw
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlacementTest } from "@/types";
import { api } from "@/services/api";

export default function PlacementPage() {
  const [tests, setTests] = useState<PlacementTest[]>([]);
  const [activeTest, setActiveTest] = useState<PlacementTest | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPlacementTests()
      .then((res) => setTests(res))
      .catch((err) => console.error("Placement fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectTest = async (testId: string) => {
    setLoading(true);
    setAnswers({});
    setIsSubmitted(false);
    setResult(null);

    try {
      const detailed = await api.getPlacementTest(testId);
      setActiveTest(detailed);
    } catch (err) {
      console.error("Test fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qId: string, optIdx: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmitTest = async () => {
    if (!activeTest) return;
    try {
      const res = await api.submitPlacementTest(activeTest.id, answers);
      setResult(res);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Submit test error:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-6 h-6 text-emerald-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Placement Preparation Hub</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Timed mock tests for DBMS, Operating Systems, Computer Networks, and Quantitative Aptitude.
            </p>
          </div>
        </div>

        {!activeTest ? (
          /* Test Catalog */
          <div className="grid md:grid-cols-2 gap-6">
            {tests.map((t) => (
              <Card key={t.id} className="border-slate-800 bg-slate-900/50 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                    <span className="flex items-center text-xs text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {t.time_limit_minutes} Mins
                    </span>
                  </div>
                  <CardTitle className="text-base text-white">{t.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {t.total_questions} Core Technical & Aptitude Questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleSelectTest(t.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    Start Timed Test
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isSubmitted && result ? (
          /* Test Results Breakdown */
          <div className="space-y-6 animate-in fade-in">
            <Card className="border-emerald-800/40 bg-emerald-950/20 p-6 text-center space-y-3">
              <Award className="w-12 h-12 text-amber-400 mx-auto" />
              <h2 className="text-2xl font-bold text-white">Placement Test Report</h2>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                {result.percentage}% ({result.score} / {result.total_score})
              </div>
              <p className="text-slate-400 text-xs">
                Score has been recorded in your performance profile and factored into your Career Readiness Score.
              </p>
            </Card>

            {/* Questions with Explanations */}
            <div className="space-y-4">
              <h3 className="font-bold text-white text-sm">Detailed Question Explanations</h3>
              {result.explanations?.map((exp: any, i: number) => (
                <Card key={i} className={`border ${exp.is_correct ? "border-emerald-900/40 bg-emerald-950/10" : "border-red-900/40 bg-red-950/10"} p-4 space-y-2 text-xs`}>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">{exp.subject}</Badge>
                    <span className={`font-semibold ${exp.is_correct ? "text-emerald-400" : "text-red-400"}`}>
                      {exp.is_correct ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-200">{i + 1}. {exp.question_text}</div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    <strong>Explanation:</strong> {exp.explanation}
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button onClick={() => setActiveTest(null)} variant="outline" className="text-xs">
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Return to Placement Tests
              </Button>
            </div>
          </div>
        ) : (
          /* Active Placement Test Session */
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white">{activeTest.title}</h2>
                <span className="text-xs text-slate-400 font-mono">
                  {Object.keys(answers).length} of {activeTest.questions?.length || 0} Answered
                </span>
              </div>
              <Button
                size="sm"
                onClick={handleSubmitTest}
                disabled={Object.keys(answers).length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-xs px-5"
              >
                Submit Test
              </Button>
            </div>

            <div className="space-y-6">
              {activeTest.questions?.map((q, qIdx) => (
                <Card key={q.id} className="border-slate-800 bg-slate-900/60 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">{q.subject}</Badge>
                    <span className="text-[11px] font-mono text-slate-500">Q{qIdx + 1}</span>
                  </div>

                  <div className="text-sm font-semibold text-slate-200 leading-relaxed">
                    {q.question_text}
                  </div>

                  <div className="space-y-2">
                    {q.options?.map((opt, optIdx) => {
                      const isChosen = answers[q.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleOptionSelect(q.id, optIdx)}
                          className={`w-full p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                            isChosen
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold"
                              : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <span>{opt}</span>
                          {isChosen && <Check className="w-4 h-4 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleSubmitTest} className="bg-emerald-600 hover:bg-emerald-700 text-xs px-6">
                Submit Test & View Results
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
