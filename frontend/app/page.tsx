import Link from "next/link";
import {
  Code2, Sparkles, Terminal, BookOpen, Network, FolderGit2,
  Compass, Mic, GraduationCap, FileText, ArrowRight, CheckCircle2,
  Shield, Cpu, Flame, Target, ChevronRight, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative px-4 pt-16 pb-20 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Built for Engineering Students • CSE, IT, AI/ML, ECE, & Transitioners</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.15]">
          Learn to Code. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
            Build Real Projects.
          </span> <br className="hidden sm:inline" />
          Become Career Ready.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          The all-in-one platform for engineering students struggling with programming fundamentals, syntax errors, DSA patterns, projects, mock interviews, and campus placements.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/onboarding">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 h-12 text-base shadow-xl w-full sm:w-auto">
              Start Learning Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/career">
            <Button size="lg" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 font-medium px-8 h-12 text-base w-full sm:w-auto">
              Explore Roadmaps
              <Compass className="w-4 h-4 ml-2 text-slate-400" />
            </Button>
          </Link>
        </div>

        {/* Student Journey Roadmap Indicator */}
        <div className="mt-16 p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm max-w-4xl mx-auto">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3 text-left px-2">
            The Complete Student Progression
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs font-medium">
            {[
              "Fundamentals", "Practice", "Error Doctor", "DSA Roadmap",
              "Projects", "Interview Prep", "Placement Ready"
            ].map((step, idx) => (
              <div key={step} className="p-2 rounded bg-slate-800/60 border border-slate-700/40 flex flex-col items-center">
                <span className="text-[10px] text-blue-400 font-mono">0{idx + 1}</span>
                <span className="text-slate-200 mt-0.5">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. PROBLEMS STUDENTS FACE */}
      <section className="py-16 bg-slate-900/30 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="secondary" className="mb-3">The Problem</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Why Engineering Students Struggle with Programming
            </h2>
            <p className="mt-3 text-slate-400 text-sm">
              College syllabi teach theoretical concepts, but students frequently encounter roadblocks when attempting to write code independently.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { q: '"I understand theory but cannot write code."', a: "Our AI Mentor guides you line-by-line with hints instead of providing spoilers." },
              { q: '"I get cryptic errors and do not understand them."', a: "The Error Doctor breaks down What happened, Why, and gives an actionable fix." },
              { q: '"I do not know which language to master."', a: "Structured roadmaps in C, C++, Java, Python, JS, and SQL with real application." },
              { q: '"I cannot remember DSA patterns in interviews."', a: "Visual pattern guides for Two Pointers, Trees, Dynamic Programming, and Sliders." },
              { q: '"My resume has no impressive projects."', a: "Project Mentor provides full architectures, database schemas, and resume bullets." },
              { q: '"I freeze during technical mock interviews."', a: "AI-driven mock interviews assessing technical depth, communication, and confidence." },
            ].map((item, i) => (
              <Card key={i} className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base text-blue-300 font-semibold">{item.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE PLATFORM MODULES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="default" className="mb-3">Comprehensive Ecosystem</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Everything You Need from First Line of Code to Offer Letter
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Not just another chatbot. A complete integrated ecosystem built specifically for engineering college success.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1: AI Programming Mentor */}
          <Card className="border-slate-800 bg-slate-900/60 flex flex-col justify-between hover:border-blue-500/40 transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <CardTitle className="text-xl">AI Programming Mentor</CardTitle>
              <CardDescription>
                Multi-mode intelligent guidance: Explain concepts, Debug syntax/runtime errors, Improve code quality, and ask for Hints first.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>&ldquo;Don&apos;t give me the answer &ndash; give me a hint&rdquo; mode</span></div>
              <div className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>Line-by-line code explanation in beginner language</span></div>
              <div className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>Conversations saved securely for review</span></div>
              <div className="pt-4">
                <Link href="/mentor">
                  <Button variant="outline" size="sm" className="w-full text-xs">Open AI Mentor</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Error Doctor */}
          <Card className="border-slate-800 bg-slate-900/60 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-3">
                <Terminal className="w-5 h-5" />
              </div>
              <CardTitle className="text-xl">Error Doctor</CardTitle>
              <CardDescription>
                Paste your broken code or compiler stack trace. The system performs structured diagnostic triage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>What happened & Why it happened</span></div>
              <div className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>Exact line location & Corrected working example</span></div>
              <div className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>Prevention tip & reinforcement practice question</span></div>
              <div className="pt-4">
                <Link href="/error-doctor">
                  <Button variant="outline" size="sm" className="w-full text-xs">Diagnose Code</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Interactive Code Editor */}
          <Card className="border-slate-800 bg-slate-900/60 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-3">
                <Code2 className="w-5 h-5" />
              </div>
              <CardTitle className="text-xl">Sandboxed Code Execution</CardTitle>
              <CardDescription>
                Full Monaco editor environment with isolated test runners for Python, JavaScript, Java, C++, and C.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>Strict process limits, timeout enforcement & zero network access</span></div>
              <div className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>Instant standard output and runtime diagnostic panel</span></div>
              <div className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span>Automatic memory metrics & execution latency</span></div>
              <div className="pt-4">
                <Link href="/practice">
                  <Button variant="outline" size="sm" className="w-full text-xs">Solve Problems</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. CAREER READINESS SCORE PREVIEW */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-3">Data-Driven Scoring</Badge>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Your Transparent Career Readiness Score
              </h2>
              <p className="mt-4 text-slate-400 text-sm leading-relaxed">
                No guessing whether you are ready for campus placements or company interviews. CodePath continuously aggregates your completed lessons, solved DSA problems, verified projects, and mock interview performances into an objective composite readiness percentage.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-3 text-xs text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Programming Fundamentals (20%)</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Coding Practice & Problem Solving (25%)</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>DSA Algorithmic Mastery (20%)</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Full-Stack & Capstone Projects (15%)</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>AI Mock Interviews & ATS Resume (20%)</span>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700">View Student Dashboard</Button>
                </Link>
              </div>
            </div>

            {/* Simulated Live Dashboard Metric Card */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs text-slate-400">Target Role</div>
                  <div className="font-semibold text-slate-100 text-sm">Full Stack Developer</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Career Readiness</div>
                  <div className="text-2xl font-black text-blue-400">68.0%</div>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Programming Core</span>
                    <span className="text-blue-400">72%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "72%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>DSA Algorithms</span>
                    <span className="text-indigo-400">54%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "54%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Capstone Projects</span>
                    <span className="text-emerald-400">65%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "65%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Mock Technical Interview</span>
                    <span className="text-amber-400">41%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "41%" }} />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200 flex items-center justify-between">
                <span>Next recommended milestone:</span>
                <span className="font-semibold underline">Solve Two Sum</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-2">FAQ</Badge>
          <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "How does CodePath's AI Mentor differ from generic chat tools?",
              a: "CodePath's AI Mentor enforces pedagogical restraint. By default, it operates in 'Hint' mode to guide you toward discovering the algorithm yourself rather than handing you complete code to copy-paste."
            },
            {
              q: "Is code execution completely safe?",
              a: "Yes. Untrusted student code is isolated in restricted sub-environments with hard CPU quotas, 8-second timeouts, memory bounds, and zero internet or local filesystem access."
            },
            {
              q: "Can I use CodePath if I am a complete beginner with zero prior coding?",
              a: "Yes. Our curriculum begins at fundamental variable declarations and simple I/O, progressively guiding you into conditionals, functions, data structures, and capstone applications."
            },
            {
              q: "How are the career roadmaps designed?",
              a: "Roadmaps are aligned with real industry expectations across Software Development, Full Stack, AI/ML, and Cybersecurity, covering required languages, technologies, DSA depth, and portfolio projects."
            }
          ].map((faq, idx) => (
            <Card key={idx} className="border-slate-800 bg-slate-900/40">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-semibold text-slate-100 flex items-center">
                  <HelpCircle className="w-4 h-4 mr-2 text-blue-400 shrink-0" />
                  {faq.q}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-xs text-slate-400 leading-relaxed">
                {faq.a}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Take Control of Your Engineering Career?
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Join thousands of engineering students who are bridging the gap between classroom theory and production-grade software engineering.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/onboarding">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 h-12">
                Start Your Roadmap Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-200">
                Explore Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
