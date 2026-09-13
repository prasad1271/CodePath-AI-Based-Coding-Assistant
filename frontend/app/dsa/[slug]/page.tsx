"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Network, CheckCircle2, ArrowLeft, ArrowRight, Lightbulb,
  AlertTriangle, HelpCircle, Code, Check
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DsaTopic } from "@/types";
import { api } from "@/services/api";

export default function DsaTopicDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [topic, setTopic] = useState<DsaTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (slug) {
      api.getDsaTopic(slug)
        .then((res) => {
          setTopic(res);
          setIsCompleted(res.is_completed);
        })
        .catch((err) => console.error("DSA topic error:", err))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleCompleteTopic = async () => {
    if (!topic) return;
    setCompleting(true);
    try {
      await api.completeDsaTopic(topic.slug);
      setIsCompleted(true);
    } catch (err) {
      console.error("Failed to complete DSA topic:", err);
      setIsCompleted(true);
    } finally {
      setCompleting(false);
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

  if (!topic) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-slate-400">DSA topic not found.</p>
          <Link href="/dsa"><Button variant="outline" className="mt-4">Back to DSA</Button></Link>
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
            href="/dsa"
            className="inline-flex items-center text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to DSA Roadmap
          </Link>

          <div className="flex items-center space-x-2">
            {isCompleted ? (
              <Badge variant="success" className="text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Topic Mastered
              </Badge>
            ) : (
              <Button
                size="sm"
                onClick={handleCompleteTopic}
                disabled={completing}
                className="bg-indigo-600 hover:bg-indigo-700 text-xs px-3.5"
              >
                {completing ? "Marking..." : "Mark Topic Mastered"}
                <Check className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80">
          <Badge variant="outline" className="text-xs mb-2">
            {topic.category}
          </Badge>
          <h1 className="text-2xl font-bold text-white tracking-tight">{topic.title}</h1>
        </div>

        {/* Concept Explanation */}
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-base text-slate-200">
              Concept Deep-Dive & Complexity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
            {topic.concept_explanation}
          </CardContent>
        </Card>

        {/* Patterns & Common Pitfalls */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Key Algorithmic Patterns */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Repeatable Patterns</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2 text-xs">
              {topic.patterns?.map((pat, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{pat}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Common Pitfalls / Mistakes */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Common Student Mistakes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2 text-xs">
              {topic.common_mistakes?.map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-red-950/20 border border-red-800/30 text-red-300 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span>{m}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Practice Challenge Linking */}
        {topic.problem_slugs && topic.problem_slugs.length > 0 && (
          <Card className="border-blue-900/30 bg-blue-950/20 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-base">Reinforce with LeetCode-style Practice</h3>
              <p className="text-slate-400 text-xs mt-1">Solve the curated problem specifically linked to this algorithmic pattern.</p>
            </div>
            <Link href={`/practice/${topic.problem_slugs[0]}`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-xs px-5">
                Solve Linked Problem
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
