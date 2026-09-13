import Link from "next/link";
import {
  Sparkles, Terminal, Code2, Network, FolderGit2,
  Compass, Mic, GraduationCap, FileText, CheckCircle2, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/Footer";

export default function FeaturesPage() {
  const featureList = [
    {
      title: "AI Programming Mentor",
      icon: Sparkles,
      color: "text-purple-400 bg-purple-600/20",
      description: "Line-by-line concept breakdown, algorithmic hints, and clean code optimization with zero spoilers.",
      bullets: ["Hint-first pedagogical mode", "Multi-language support (Python, Java, C++, JS, SQL)", "Contextual code snippet review"]
    },
    {
      title: "Error Doctor",
      icon: Terminal,
      color: "text-emerald-400 bg-emerald-600/20",
      description: "Instant root-cause compiler triage explaining What happened, Why it happened, and how to avoid it.",
      bullets: ["Stack trace line identification", "Corrected working code snippet", "Preventative habit reinforcement"]
    },
    {
      title: "Interactive Code Editor",
      icon: Code2,
      color: "text-blue-400 bg-blue-600/20",
      description: "Monaco-powered coding sandbox enforcing hard resource quotas and instant stdout execution.",
      bullets: ["Execution latency in milliseconds", "Memory consumption tracking", "Isolated process security"]
    },
    {
      title: "Complete DSA Roadmap",
      icon: Network,
      color: "text-indigo-400 bg-indigo-600/20",
      description: "Visual roadmap covering Two Pointers, Sliding Window, Trees, Graphs, and Dynamic Programming.",
      bullets: ["Pattern recognition blueprints", "Common student mistakes library", "Curated LeetCode challenge linking"]
    },
    {
      title: "Project Mentor & Architect",
      icon: FolderGit2,
      color: "text-amber-400 bg-amber-600/20",
      description: "End-to-end full-stack architectures, database models, milestone checklists, and README generation.",
      bullets: ["System architecture blueprints", "Milestone task tracker", "Earned resume bullet generation"]
    },
    {
      title: "AI Mock Interviews",
      icon: Mic,
      color: "text-red-400 bg-red-600/20",
      description: "Dynamic technical, HR, and coding interview rounds with automated scoring on depth and communication.",
      bullets: ["Technical & communication scores", "Strengths and weaknesses detection", "Suggested production formulations"]
    },
    {
      title: "Placement Preparation Hub",
      icon: GraduationCap,
      color: "text-teal-400 bg-teal-600/20",
      description: "Timed sprint tests covering DBMS, Operating Systems, Computer Networks, and Quantitative Aptitude.",
      bullets: ["Detailed solution explanations", "Subject-by-subject accuracy report", "Database-persisted progress"]
    },
    {
      title: "ATS Resume & GitHub Assistant",
      icon: FileText,
      color: "text-pink-400 bg-pink-600/20",
      description: "Real keyword matching, missing skills detection, and GitHub profile README generators.",
      bullets: ["ATS score percentage", "Action-verb bullet point polisher", "GitHub presentation checklist"]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-12 flex-1">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <Badge variant="outline">Complete Ecosystem</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Designed from Scratch for Engineers
          </h1>
          <p className="text-slate-400 text-sm">
            Explore the full suite of integrated tools bridging the gap between college theory and professional software careers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureList.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i} className="border-slate-800 bg-slate-900/50 p-5 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-lg ${f.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-white">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
                  <ul className="space-y-1.5 text-xs text-slate-300 pt-2">
                    {f.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center pt-8">
          <Link href="/onboarding">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold px-8 h-11">
              Start Free Learning Journey
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
