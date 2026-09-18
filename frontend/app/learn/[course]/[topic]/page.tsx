"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BookOpen, CheckCircle2, ArrowLeft, ArrowRight, Lightbulb,
  HelpCircle, Code, Check, X, Sparkles, Loader2, MessageSquare
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeEditor } from "@/components/CodeEditor";
import { Lesson } from "@/types";
import { api } from "@/services/api";

export default function LessonInteractivePage() {
  const params = useParams();
  const courseSlug = params.course as string;
  const lessonSlug = params.topic as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showHints, setShowHints] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Gemini AI Lesson Tutor
  const [isExplaining, setIsExplaining] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [explanationData, setExplanationData] = useState<any>(null);

  useEffect(() => {
    if (courseSlug && lessonSlug) {
      api.getLessonDetail(courseSlug, lessonSlug)
        .then((res) => {
          setLesson(res);
          setIsCompleted(res.is_completed);
        })
        .catch((err) => console.error("Lesson fetch error:", err))
        .finally(() => setLoading(false));
    }
  }, [courseSlug, lessonSlug]);

  const handleSelectQuiz = (qIdx: number, optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleCompleteLesson = async () => {
    if (!lesson) return;
    setCompleting(true);
    try {
      await api.completeLesson(lesson.slug);
      setIsCompleted(true);
    } catch (err) {
      console.error("Failed to complete lesson:", err);
      setIsCompleted(true);
    } finally {
      setCompleting(false);
    }
  };

  const handleExplainConcept = async (promptOverride?: string) => {
    if (!lesson) return;
    setIsExplaining(true);
    const question = promptOverride || customQuestion.trim() || "Explain this concept with an intuitive real-world analogy and step-by-step breakdown.";
    try {
      const res = await api.explainLesson(
        lessonSlug,
        question,
        lesson.title,
        lesson.content_markdown,
        courseSlug.includes("java") ? "java" : courseSlug.includes("c") ? "c" : "python"
      );
      setExplanationData(res);
    } catch (err: any) {
      console.error("AI explanation error:", err);
    } finally {
      setIsExplaining(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-20 bg-slate-900 rounded-xl" />
          <div className="h-64 bg-slate-900 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!lesson) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-slate-400">Lesson not found.</p>
          <Link href={`/learn/${courseSlug}`}>
            <Button variant="outline" className="mt-4">Back to course</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href={`/learn/${courseSlug}`}
            className="inline-flex items-center text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Course
          </Link>

          <div className="flex items-center space-x-2">
            {isCompleted ? (
              <Badge variant="success" className="text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Lesson Completed
              </Badge>
            ) : (
              <Button
                size="sm"
                onClick={handleCompleteLesson}
                disabled={completing}
                className="bg-emerald-600 hover:bg-emerald-700 text-xs px-3.5"
              >
                {completing ? "Marking..." : "Mark as Completed"}
                <Check className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Lesson Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-400 mb-1">
            <span>LESSON 0{lesson.order_index}</span>
            <span>&bull;</span>
            <span className="uppercase">{courseSlug.replace("-", " ")}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{lesson.title}</h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column: Markdown Theory & Quiz (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader className="pb-3 border-b border-slate-800/80">
                <CardTitle className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>Concept Theory</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-xs text-slate-300 leading-relaxed space-y-4">
                <div className="whitespace-pre-wrap font-sans">
                  {lesson.content_markdown}
                </div>

                {lesson.hints && lesson.hints.length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="inline-flex items-center text-xs text-amber-400 hover:underline font-medium"
                    >
                      <Lightbulb className="w-3.5 h-3.5 mr-1" />
                      {showHints ? "Hide hints" : "Show concept hints"}
                    </button>
                    {showHints && (
                      <div className="mt-2 p-3 rounded-lg bg-amber-950/20 border border-amber-800/30 text-xs text-amber-200/90 space-y-1">
                        {lesson.hints.map((h, idx) => (
                          <div key={idx}>• {h}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gemini AI Concept Tutor */}
            <Card className="border-blue-900/40 bg-gradient-to-br from-blue-950/20 via-slate-900/80 to-slate-950 shadow-lg">
              <CardHeader className="pb-3 border-b border-slate-800/80">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>Gemini AI Interactive Concept Tutor</span>
                  </CardTitle>
                  <Badge variant="outline" className="border-blue-500/40 text-blue-300 text-[10px]">
                    Powered by Gemini
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                <div className="space-y-2">
                  <span className="text-slate-400 block font-medium">Quick Concept Deep-Dives:</span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isExplaining}
                      onClick={() => handleExplainConcept("Explain this concept with an intuitive real-world analogy that an engineering beginner can relate to.")}
                      className="text-[11px] h-7 border-slate-800 hover:border-blue-500/60 hover:bg-blue-950/30 text-slate-300"
                    >
                      💡 Real-World Analogy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isExplaining}
                      onClick={() => handleExplainConcept("Break down how this works step-by-step under the hood in memory and execution.")}
                      className="text-[11px] h-7 border-slate-800 hover:border-blue-500/60 hover:bg-blue-950/30 text-slate-300"
                    >
                      ⚙️ Under-the-Hood Mechanics
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isExplaining}
                      onClick={() => handleExplainConcept("What are the most common subtle bugs or traps junior developers fall into with this concept?")}
                      className="text-[11px] h-7 border-slate-800 hover:border-blue-500/60 hover:bg-blue-950/30 text-slate-300"
                    >
                      ⚠️ Common Pitfalls & Traps
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="Ask Gemini any doubt about this lesson..."
                    onKeyDown={(e) => { if (e.key === "Enter") handleExplainConcept(); }}
                    className="flex-1 h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                  <Button
                    size="sm"
                    disabled={isExplaining || !customQuestion.trim()}
                    onClick={() => handleExplainConcept()}
                    className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    {isExplaining ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Ask AI"
                    )}
                  </Button>
                </div>

                {isExplaining && (
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center space-x-2 text-slate-400">
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    <span>Gemini is synthesizing pedagogical explanation...</span>
                  </div>
                )}

                {explanationData && !isExplaining && (
                  <div className="p-4 rounded-xl bg-slate-950/90 border border-blue-900/50 space-y-3 animate-in fade-in">
                    <div className="space-y-1">
                      <span className="font-semibold text-blue-300 text-xs flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>Intuitive Mental Model & Explanation</span>
                      </span>
                      <div className="text-slate-200 leading-relaxed whitespace-pre-wrap text-xs font-sans">
                        {explanationData.explanation || explanationData.explanation_or_analogy}
                      </div>
                    </div>

                    {explanationData.key_takeaways && explanationData.key_takeaways.length > 0 && (
                      <div className="space-y-1 text-[11px] pt-1 border-t border-slate-800/80">
                        <span className="font-semibold text-slate-300 block">Key Takeaways:</span>
                        <ul className="space-y-0.5 list-disc pl-4 text-slate-300">
                          {explanationData.key_takeaways.map((k: string, i: number) => <li key={i}>{k}</li>)}
                        </ul>
                      </div>
                    )}

                    {explanationData.sample_code && (
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-blue-300 space-y-1">
                        <span className="text-[10px] text-slate-400 block uppercase">Code Example</span>
                        <pre className="whitespace-pre-wrap">{explanationData.sample_code}</pre>
                      </div>
                    )}

                    {(explanationData.challenge_question || explanationData.practice_challenge) && (
                      <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/30 text-blue-200 text-[11px] space-y-1">
                        <strong className="block text-blue-300 font-semibold">🎯 Quick Mini-Challenge:</strong>
                        <p>{explanationData.challenge_question || explanationData.practice_challenge}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interactive MCQ Quiz */}
            {lesson.quiz_questions && lesson.quiz_questions.length > 0 && (
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader className="pb-3 border-b border-slate-800/80">
                  <CardTitle className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    <span>Concept Check MCQ</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-6 text-xs">
                  {lesson.quiz_questions.map((quiz, qIdx) => {
                    const selected = selectedAnswers[qIdx];
                    const isAnswered = selected !== undefined;
                    const isCorrect = selected === quiz.correctIndex;

                    return (
                      <div key={qIdx} className="space-y-3">
                        <div className="font-semibold text-slate-200">
                          {qIdx + 1}. {quiz.question}
                        </div>
                        <div className="space-y-2">
                          {quiz.options.map((opt, optIdx) => {
                            let btnStyle = "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700";
                            if (isAnswered) {
                              if (optIdx === quiz.correctIndex) {
                                btnStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-300 font-semibold";
                              } else if (selected === optIdx) {
                                btnStyle = "border-red-500 bg-red-950/40 text-red-300";
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectQuiz(qIdx, optIdx)}
                                className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {isAnswered && optIdx === quiz.correctIndex && (
                                  <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                                )}
                                {isAnswered && selected === optIdx && optIdx !== quiz.correctIndex && (
                                  <X className="w-4 h-4 text-red-400 shrink-0 ml-2" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {isAnswered && (
                          <div className={`p-2.5 rounded-lg text-xs leading-relaxed ${isCorrect ? "bg-emerald-950/20 text-emerald-300" : "bg-red-950/20 text-red-300"}`}>
                            <strong>Explanation:</strong> {quiz.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Code Editor & Sandboxed Practice (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Code className="w-4 h-4 text-emerald-400" />
                <span>Interactive Sandboxed Workspace</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Isolated Sandbox</span>
            </div>

            <CodeEditor
              initialCode={lesson.code_snippet || "print('Hello CodePath')"}
              language={courseSlug.includes("java") ? "java" : courseSlug.includes("c") ? "cpp" : "python"}
              height="380px"
            />

            {lesson.practice_problem_slug && (
              <Card className="border-blue-900/30 bg-blue-950/20 p-4">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-blue-300">Reinforce with Problem Solving</div>
                    <div className="text-slate-400 text-[11px]">Solve LeetCode-style challenge for this topic</div>
                  </div>
                  <Link href={`/practice/${lesson.practice_problem_slug}`}>
                    <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700">
                      Practice Now
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
