import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/Footer";

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-12 flex-1">
        <div className="text-center space-y-4">
          <Badge variant="outline">Free For Engineering Students</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Transparent, Student-First Pricing
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            We believe core educational tools and AI mentorship should be accessible to every engineering student without paywalls.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Tier */}
          <Card className="border-blue-500/40 bg-slate-900/80 p-6 space-y-6 shadow-xl relative">
            <div className="absolute -top-3 right-6">
              <Badge variant="default">Most Popular</Badge>
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">Student Free</h3>
              <div className="text-3xl font-extrabold text-white font-mono mt-2">$0 <span className="text-xs text-slate-400 font-normal">/ forever</span></div>
              <p className="text-xs text-slate-400 mt-1">Full access for students preparing for campus drives.</p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              {[
                "Unlimited sandboxed code execution (Python, JS, Java, C++, C)",
                "AI Programming Mentor with Hint-first mode",
                "Error Doctor diagnostic triage",
                "Complete DSA Roadmap & LeetCode-style challenges",
                "Project Mentor & Architecture Generator",
                "AI Mock Interviews & Performance Scorecard",
                "Placement Preparation Sprint Tests",
                "ATS Resume Builder & GitHub Checklist"
              ].map((feature, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/onboarding" className="block pt-2">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-xs font-semibold h-10">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </Card>

          {/* College Campus Partner Tier */}
          <Card className="border-slate-800 bg-slate-900/40 p-6 space-y-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-xl text-slate-200">College Campus Partner</h3>
              <div className="text-3xl font-extrabold text-slate-300 font-mono mt-2">Custom</div>
              <p className="text-xs text-slate-400 mt-1">For universities & engineering placement departments.</p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-400">
              {[
                "Department-wide analytics dashboard",
                "Batch-wise student progress & readiness tracking",
                "Custom campus placement mock test authoring",
                "Faculty mentor management portal",
                "Dedicated institutional SLA support"
              ].map((feature, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/contact" className="block pt-2">
              <Button variant="outline" className="w-full border-slate-700 text-slate-300 text-xs h-10">
                Contact Campus Team
              </Button>
            </Link>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
