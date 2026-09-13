import Link from "next/link";
import { Code2, Target, Users, BookOpen, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-12 flex-1">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Our Mission: Empower Engineering Students
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
            CodePath was founded to solve a pervasive problem across technical universities: students graduate understanding abstract theory, but struggle to write production code, pass algorithmic interviews, or build real-world systems.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-xs">
          <Card className="border-slate-800 bg-slate-900/50 p-5 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Pedagogical Philosophy</h3>
            <p className="text-slate-400 leading-relaxed">
              We never hand out copy-paste code. The AI Mentor guides students with hints, guiding questions, and conceptual analogies so genuine problem-solving intuition develops.
            </p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50 p-5 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">No Fake Claims</h3>
            <p className="text-slate-400 leading-relaxed">
              We do not fabricate resume metrics or promise overnight magic. Every readiness score, streak, and milestone is earned through verified sandbox execution and problem solutions.
            </p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50 p-5 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Complete Journey</h3>
            <p className="text-slate-400 leading-relaxed">
              From absolute beginner fundamentals in Python/Java/C to complex dynamic programming, full-stack architectures, mock interviews, and campus placement drives.
            </p>
          </Card>
        </div>

        <div className="text-center pt-8">
          <Link href="/onboarding">
            <Button className="bg-blue-600 hover:bg-blue-700 text-xs px-8 h-11">
              Join CodePath Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
